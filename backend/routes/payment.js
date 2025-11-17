const express = require('express')
const router = express.Router();

const { processPayment, getStripeApiKey } = require('../controllers/payment')
const { isAuthenticatedUser } = require('../middlewares/auth')

router.post('/payment/process', isAuthenticatedUser, processPayment);
router.get('/stripeapi', isAuthenticatedUser, getStripeApiKey);

module.exports = router;

