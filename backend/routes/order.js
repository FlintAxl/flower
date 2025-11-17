const express = require('express')
const router = express.Router();

const { newOrder,
	myOrders,
	getSingleOrder,
	deleteOrder,
	allOrders,
	updateOrder,
	cancelOrder,
	totalOrders,
	totalSales,
 customerSales,
 salesPerMonth,
	} = require('../controllers/order')
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.get('/orders/me', isAuthenticatedUser, myOrders);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.put('/order/:id/cancel', isAuthenticatedUser, cancelOrder);
router.get('/admin/orders/', isAuthenticatedUser, authorizeRoles('admin'), allOrders);
// router.route('/admin/order/:id').delete(isAuthenticatedUser, deleteOrder);
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder).delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);
router.put('/admin/order/:id/cancel', isAuthenticatedUser, authorizeRoles('admin'), cancelOrder);

router.get('/admin/total-orders', totalOrders);
router.get('/admin/total-sales', totalSales);
router.get('/admin/customer-sales', customerSales);
router.get('/admin/sales-per-month', salesPerMonth);
module.exports = router;