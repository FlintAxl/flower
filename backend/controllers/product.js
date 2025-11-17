const Product = require('../models/product')
const Order = require('../models/order');

const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');
const Filter = require('bad-words');
const { getAllCustomWords } = require('../config/badwords');

// Initialize bad words filter
const filter = new Filter();

// Add custom bad words from configuration file
const customWords = getAllCustomWords();
filter.addWords(...customWords);

console.log(`Loaded ${customWords.length} custom bad words from local language`);

// Helper function to filter bad words from text
const filterBadWords = (text) => {
    try {
        // Clean the text and replace bad words with asterisks
        const cleanedText = filter.clean(text);
        
        // Log if bad words were found (for monitoring purposes)
        if (cleanedText !== text) {
            console.log('Bad words filtered from review comment');
        }
        
        return cleanedText;
    } catch (error) {
        console.error('Error filtering bad words:', error);
        return text; // Return original text if filtering fails
    }
};

// Helper function to check if user can review a product
const canUserReviewProduct = async (userId, productId) => {
    try {
        // Find orders where user bought this product and order is delivered
        const deliveredOrder = await Order.findOne({
            user: userId,
            orderStatus: 'Delivered',
            'orderItems.product': productId
        });
        
        return !!deliveredOrder; // Returns true if found, false otherwise
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return false;
    }
};



exports.newProduct = async (req, res, next) => {
console.log(req.files)
	let images = []
	if (typeof req.files === 'string') {
		images.push(req.files)
	} else {
		images = req.files
	}

	let imagesLinks = [];

	for (let i = 0; i < images.length; i++) {
		try {
			const result = await cloudinary.v2.uploader.upload(images[i]['path'], {
				folder: 'products',
				width: 150,
				crop: "scale",
			});

			imagesLinks.push({
				public_id: result.public_id,
				url: result.secure_url
			})

		} catch (error) {
			console.log(error)
		}

	}

	req.body.images = imagesLinks
	// req.body.user = req.user.id;

	const product = await Product.create(req.body);

	if (!product)
		return res.status(400).json({
			success: false,
			message: 'Product not created'
		})


	return res.status(201).json({
		success: true,
		product
	})
}

exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    return res.status(200).json({
        success: true,
        product
    })
}

exports.getAdminProducts = async (req, res, next) => {

    const products = await Product.find();
    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        products
    })

}

exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        // Handle images if new ones are uploaded
        if (req.body.images && req.body.images.length > 0) {
            let images = []
            if (typeof req.body.images === 'string') {
                images.push(req.body.images)
            } else {
                images = req.body.images
            }

            let imagesLinks = [];
            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: 'products',
                });
                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url
                })
            }
            req.body.images = imagesLinks;
        } else {
            // Keep old images if no new images uploaded
            delete req.body.images;
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindandModify: false
        })

        return res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error updating product'
        })
    }
}

exports.getProducts = async (req, res) => {

    const resPerPage = 8;   
    const productsCount = await Product.countDocuments();

    // Build filter object for counting
    let filterObj = {};
    
    // Add keyword search filter
    if (req.query.keyword) {
        filterObj.name = {
            $regex: req.query.keyword,
            $options: 'i'
        };
    }
    
    // Add price filter
    if (req.query['price[gte]'] || req.query['price[lte]']) {
        filterObj.price = {};
        if (req.query['price[gte]']) {
            filterObj.price.$gte = Number(req.query['price[gte]']);
        }
        if (req.query['price[lte]']) {
            filterObj.price.$lte = Number(req.query['price[lte]']);
        }
    }
    
    // Add category filter
    if (req.query.category) {
        filterObj.category = req.query.category;
    }
    
    // Add ratings filter
    if (req.query['ratings[gte]']) {
        filterObj.ratings = {};
        filterObj.ratings.$gte = Number(req.query['ratings[gte]']);
    }
    
    // Get filtered products count (before pagination)
    const filteredProductsCount = await Product.countDocuments(filterObj);

    // Get paginated products
    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter()
    apiFeatures.pagination(resPerPage);
	const products = await apiFeatures.query;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,

    })
    // if (!products)
    //     return res.status(400).json({ message: 'error loading products' })
    
    // return res.status(200).json({
    //     success: true,
    //     products,
    //     resPerPage,
    //     productsCount,

    // })
}


exports.productSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$itemsPrice" }

            },
            
        },
    ])
    console.log( totalSales)
    const sales = await Order.aggregate([
        { $project: { _id: 0, "orderItems": 1, totalPrice: true } },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            },
        },
    ])
	console.log(sales)
    
    if (!totalSales) {
		return res.status(404).json({
			message: 'error sales'
		})
       
    }
    if (!sales) {
		return res.status(404).json({
			message: 'error sales'
		})
      
    }
    
    let totalPercentage = {}
    totalPercentage = sales.map(item => {
         
        // console.log( ((item.total/totalSales[0].total) * 100).toFixed(2))
        percent = Number (((item.total/totalSales[0].total) * 100).toFixed(2))
        total =  {
            name: item._id.product,
            percent
        }
        return total
    }) 
     console.log(totalPercentage)
    res.status(200).json({
        success: true,
        totalPercentage,
        sales,
        totalSales
    })

}

exports.createProductReview = async (req, res, next) => {
	try {
		const { rating, comment, productId } = req.body;
		
		if (!rating || !comment || !productId) {
			return res.status(400).json({
				success: false,
				message: 'Please provide rating, comment, and product ID'
			});
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		// Check if user can review this product (must have ordered and received it)
		const canReview = await canUserReviewProduct(req.user._id, productId);
		if (!canReview) {
			return res.status(403).json({
				success: false,
				message: 'You can only review products you have purchased and received (order status: Delivered)'
			});
		}

		const isReviewed = product.reviews.find(
			r => r.user.toString() === req.user._id.toString()
		);

		if (isReviewed) {
			return res.status(400).json({
				success: false,
				message: 'You have already reviewed this product. Use update review instead.'
			});
		}

		// Filter bad words from comment
		const filteredComment = filterBadWords(comment);

		const review = {
			user: req.user._id,
			name: req.user.name,
			rating: Number(rating),
			comment: filteredComment,
			createdAt: new Date()
		};

		product.reviews.push(review);
		product.numOfReviews = product.reviews.length;
		product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

		await product.save({ validateBeforeSave: false });

		return res.status(201).json({
			success: true,
			message: 'Review added successfully',
			review: product.reviews[product.reviews.length - 1]
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || 'Error creating review'
		});
	}
}

exports.updateProductReview = async (req, res, next) => {
	try {
		const { rating, comment, productId } = req.body;
		
		if (!rating || !comment || !productId) {
			return res.status(400).json({
				success: false,
				message: 'Please provide rating, comment, and product ID'
			});
		}

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		// Check if user can review this product (must have ordered and received it)
		const canReview = await canUserReviewProduct(req.user._id, productId);
		if (!canReview) {
			return res.status(403).json({
				success: false,
				message: 'You can only review products you have purchased and received (order status: Delivered)'
			});
		}

		const reviewIndex = product.reviews.findIndex(
			r => r.user.toString() === req.user._id.toString()
		);

		if (reviewIndex === -1) {
			return res.status(404).json({
				success: false,
				message: 'Review not found. Please create a review first.'
			});
		}

		// Filter bad words from comment
		const filteredComment = filterBadWords(comment);

		// Update the existing review
		product.reviews[reviewIndex].rating = Number(rating);
		product.reviews[reviewIndex].comment = filteredComment;
		product.reviews[reviewIndex].updatedAt = new Date();

		// Recalculate ratings
		product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

		await product.save({ validateBeforeSave: false });

		return res.status(200).json({
			success: true,
			message: 'Review updated successfully',
			review: product.reviews[reviewIndex]
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message || 'Error updating review'
		});
	}
}

exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}

exports.checkReviewEligibility = async (req, res, next) => {
    try {
        const { productId } = req.query;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const canReview = await canUserReviewProduct(req.user._id, productId);
        
        return res.status(200).json({
            success: true,
            canReview: canReview,
            message: canReview 
                ? 'You can review this product' 
                : 'You can only review products you have purchased and received'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error checking review eligibility'
        });
    }
}

exports.deleteReview = async (req, res, next) => {
    try {
        const { productId, reviewId } = req.query;

        if (!productId || !reviewId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide product ID and review ID'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const reviewExists = product.reviews.find(review => review._id.toString() === reviewId);
        if (!reviewExists) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const reviews = product.reviews.filter(review => review._id.toString() !== reviewId);
        const numOfReviews = reviews.length;

        // Recalculate ratings only if there are remaining reviews
        const ratings = numOfReviews > 0 
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews 
            : 0;

        await Product.findByIdAndUpdate(productId, {
            reviews,
            ratings,
            numOfReviews
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting review'
        });
    }
}

exports.bulkDeleteProducts = async (req, res, next) => {
    try {
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid product IDs'
            });
        }

        // Delete products from database
        const result = await Product.deleteMany({ _id: { $in: productIds } });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found to delete'
            });
        }

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} products deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bulk delete products error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting products'
        });
    }
}

// Test endpoint for bad word filtering (optional - for testing purposes)
exports.testBadWordFilter = async (req, res, next) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Please provide text to filter'
            });
        }

        const filteredText = filterBadWords(text);
        
        return res.status(200).json({
            success: true,
            originalText: text,
            filteredText: filteredText,
            wasFiltered: text !== filteredText
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error testing bad word filter'
        });
    }
}
