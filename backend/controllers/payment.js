const stripe = require('stripe');

// Get Stripe instance (lazy initialization)
const getStripe = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
    }
    return stripe(secretKey);
};

// Process payment   =>  /api/v1/payment/process
exports.processPayment = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const stripeInstance = getStripe();

        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd', // Using USD - change to 'php' if Stripe supports it in your region
            metadata: {
                integration_check: 'accept_a_payment'
            }
        });

        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing payment'
        });
    }
}

// Get Stripe publishable key   =>  /api/v1/stripeapi
exports.getStripeApiKey = async (req, res, next) => {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
}

