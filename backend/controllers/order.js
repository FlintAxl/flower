const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const { sendOrderStatusEmail } = require('../utils/emailService');
const { generateOrderReceipt } = require('../utils/pdfGenerator');



// Create a new order   =>  /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paymentMethod

        } = req.body;

        // Determine order status based on payment method
        const orderStatus = paymentMethod === 'cod' ? 'Pending' : 'Processing';
        
        // Only set paidAt for card payments
        const orderData = {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paymentMethod: paymentMethod || 'card',
            orderStatus,
            user: req.user._id
        };

        // Only set paidAt for card payments (COD is paid on delivery)
        if (paymentMethod !== 'cod') {
            orderData.paidAt = Date.now();
        }

        const order = await Order.create(orderData)

        // Populate order with product details for email
        const populatedOrder = await Order.findById(order._id).populate('orderItems.product');
        
        // Get user information for email
        const user = await User.findById(req.user._id);
        
        // Send order confirmation email with PDF receipt
        console.log('Sending order confirmation email for new order...');
        
        // Generate PDF receipt for the new order
        const pdfResult = await generateOrderReceipt({ order: populatedOrder, user });
        let pdfPath = null;
        
        if (pdfResult.success) {
            pdfPath = pdfResult.pdfPath;
            console.log('PDF receipt generated successfully for new order');
        } else {
            console.error('Failed to generate PDF for new order:', pdfResult.error);
        }
        
        // Send email notification with PDF attachment
        const emailResult = await sendOrderStatusEmail({ order: populatedOrder, user }, pdfPath);
        
        if (emailResult.success) {
            console.log('Order confirmation email sent successfully:', emailResult.messageId);
        } else {
            console.error('Failed to send order confirmation email:', emailResult.error);
            // Don't fail the order creation if email fails
        }

        res.status(200).json({
            success: true,
            order,
            emailSent: emailResult.success
        })
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })
    // console.log(req.user)
    res.status(200).json({
        success: true,
        orders
    })
}

exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        res.status(404).json({
            message: 'No Order found with this ID',

        })
    }
    res.status(200).json({
        success: true,
        order
    })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find().populate('user', 'name email')
    // console.log(orders)
    let totalAmount = 0;

    orders.forEach(order => {

        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
        return res.status(400).json({
            message: 'No Order found with this ID',

        })
      
    }
    return res.status(200).json({
        success: true
    })
}

exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems.product');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        const nonCancellableStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (nonCancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order. Order is already ${order.orderStatus.toLowerCase()}.`
            });
        }

        // Update order status to Cancelled
        order.orderStatus = 'Cancelled';
        await order.save();

        // Get user information for email
        const user = await User.findById(order.user);
        if (user) {
            // Send cancellation email notification
            const { sendOrderStatusEmail } = require('../utils/emailService');
            const emailResult = await sendOrderStatusEmail({ order, user }, null);
            if (emailResult.success) {
                console.log('Cancellation email sent successfully');
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({
            success: false,
            message: 'Error cancelling order'
        });
    }
}

exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems.product');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        console.log(req.body.order)
        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'You have already delivered this order'
            });
        }

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a cancelled order'
            });
        }

        // Get user information for email
        const user = await User.findById(order.user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldStatus = order.orderStatus;
        const newStatus = req.body.status;

        // Update stock for delivered orders
        if (newStatus === 'Delivered') {
            order.orderItems.forEach(async item => {
                await updateStock(item.product, item.quantity)
            });
            order.deliveredAt = Date.now();
            
            // Mark as paid if COD order is delivered
            if (order.paymentMethod === 'cod' && !order.paidAt) {
                order.paidAt = Date.now();
                if (order.paymentInfo) {
                    order.paymentInfo.status = 'succeeded';
                }
            }
        }

        // Update order status
        order.orderStatus = newStatus;
        await order.save();

        // Send email notification for Processing, Shipped or Delivered status
        if (newStatus === 'Processing' || newStatus === 'Shipped' || newStatus === 'Delivered') {
            let pdfPath = null;
            
            // Generate PDF receipt for processing, shipped and delivered orders
            console.log(`Generating PDF receipt for ${newStatus.toLowerCase()} order...`);
            const pdfResult = await generateOrderReceipt({ order, user });
            if (pdfResult.success) {
                pdfPath = pdfResult.pdfPath;
                console.log('PDF receipt generated successfully');
            } else {
                console.error('Failed to generate PDF:', pdfResult.error);
            }
            
            // Send email notification with PDF attachment
            console.log(`Sending ${newStatus} email notification to ${user.email}...`);
            const emailResult = await sendOrderStatusEmail({ order, user }, pdfPath);
            
            if (emailResult.success) {
                console.log('Email sent successfully:', emailResult.messageId);
            } else {
                console.error('Failed to send email:', emailResult.error);
                // Don't fail the order update if email fails
            }
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to ${newStatus}${newStatus === 'Processing' || newStatus === 'Shipped' || newStatus === 'Delivered' ? '. Email notification sent.' : ''}`
        });
        
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order'
        });
    }
}

async function updateStock(productOrId, quantity) {
    const productId = productOrId && productOrId._id ? productOrId._id : productOrId;

    if (!productId) {
        console.error('updateStock called without valid product id:', productOrId);
        return;
    }

    const product = await Product.findById(productId);

    if (!product) {
        console.error('Product not found for stock update, id:', productId);
        return;
    }

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false })
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    if (!totalOrders) {
        return res.status(404).json({
            message: 'error total orders',
        })
    }
    res.status(200).json({
        success: true,
        totalOrders
    })

}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    if (!totalSales) {
        return res.status(404).json({
            message: 'error total sales',
        })
    }
    res.status(200).json({
        success: true,
        totalSales
    })
}


exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },
        // {
        //     $group: {
        //         _id: "$user",
        //         total: { $sum: "$totalPrice" },
        //     }
        // },

        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$user",
                total: { $sum: "$totalPrice" },
                doc: { "$first": "$$ROOT" },

            }
        },

        {
            $replaceRoot: {
                newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
            },
        },
        // {
        //     $group: {
        //         _id: "$userDetails.name",
        //         total: { $sum: "$totalPrice" }
        //     }
        // },
        {
            $project: {
                _id: 0,
                "userDetails.name": 1,
                total: 1,
            }
        },
        { $sort: { total: -1 } },

    ])
    console.log(customerSales)
    if (!customerSales) {
        return res.status(404).json({
            message: 'error customer sales',
        })


    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        customerSales
    })

}


exports.salesPerMonth = async (req, res, next) => {
    const salesPerMonth = await Order.aggregate([

        {
            $group: {
                // _id: {month: { $month: "$paidAt" } },
                _id: {
                    year: { $year: "$paidAt" },
                    month: { $month: "$paidAt" }
                },
                total: { $sum: "$totalPrice" },
            },
        },

        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', ' Sept', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', "$_id.month"]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: 1,
                total: 1,
            }
        }

    ])
    if (!salesPerMonth) {
        return res.status(404).json({
            message: 'error sales per month',
        })
    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        salesPerMonth
    })

}