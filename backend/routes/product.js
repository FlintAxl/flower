const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");

const { 
    newProduct,
    getSingleProduct,
    getAdminProducts,
    updateProduct,
    getProducts,
    productSales,
    createProductReview,
    updateProductReview,
    getProductReviews,
    checkReviewEligibility,
    deleteReview,
    bulkDeleteProducts,
    testBadWordFilter,
    } = require('../controllers/product');

    const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.post('/admin/product/new', upload.array('images', 10), newProduct);
router.get('/product/:id', getSingleProduct)
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);

router.put('/admin/product/:id', upload.array('images', 10), updateProduct);
router.delete('/admin/products/bulk', isAuthenticatedUser, authorizeRoles('admin'), bulkDeleteProducts);

router.get('/products', getProducts)
router.get('/admin/product-sales', productSales);

router.put('/review', isAuthenticatedUser, createProductReview);
router.patch('/review/update', isAuthenticatedUser, updateProductReview);
router.get('/reviews',isAuthenticatedUser, getProductReviews)
router.get('/review/eligibility', isAuthenticatedUser, checkReviewEligibility)
router.delete('/reviews', isAuthenticatedUser, authorizeRoles('admin'), deleteReview)

// Test route for bad word filtering (optional - for development/testing)
router.post('/test/badwords', testBadWordFilter)


module.exports = router