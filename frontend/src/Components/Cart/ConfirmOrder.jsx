import React, {  useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { getUser } from '../../Utils/helpers'
import { Box, Grid, Paper, Typography, Button, Divider } from '@mui/material';
const ConfirmOrder = ({cartItems, shippingInfo}) => {
    const [user, setUser] = useState(getUser() ? getUser() : {})
    let navigate = useNavigate();
    // Calculate Order Prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shippingPrice = itemsPrice > 200 ? 0 : 25
    const taxPrice = Number((0.05 * itemsPrice).toFixed(2))
    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2)

    const processToPayment = () => {
        const data = {
            itemsPrice: itemsPrice.toFixed(2),
            shippingPrice,
            taxPrice,
            totalPrice
        }

        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        navigate('/payment')
    }

    return (
        <>
            <MetaData title={'Confirm Order'} />
            <CheckoutSteps shipping confirmOrder />
            <Box className="min-h-[70vh] px-4 py-10 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 dark:from-base-dark dark:via-base-soft dark:to-base-soft">
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} md={8}>
                        <Paper className="rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-6 md:p-8" elevation={4}>
                            <Typography
                                variant="h6"
                                className="font-semibold text-gray-900 dark:text-ink mb-3"
                            >
                                Shipping Info
                            </Typography>
                            {getUser() && (
                                <Typography variant="body2" className="text-gray-700 dark:text-ink mb-1">
                                    <b>Name:</b> {user && user.name}
                                </Typography>
                            )}
                            <Typography variant="body2" className="text-gray-700 dark:text-ink mb-1">
                                <b>Phone:</b> {shippingInfo.phoneNo}
                            </Typography>
                            <Typography variant="body2" className="text-gray-700 dark:text-ink mb-4">
                                <b>Address:</b> {`${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`}
                            </Typography>

                            <Divider className="my-4" />

                            <Typography
                                variant="h6"
                                className="font-semibold text-gray-900 dark:text-ink mb-3"
                            >
                                Your Cart Items
                            </Typography>

                            {cartItems.map(item => (
                                <Box key={item.product} className="py-3 border-b border-gray-100 dark:border-base-soft last:border-b-0">
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={3} sm={2}>
                                            <img src={item.image} alt={item.name} className="w-full max-w-[70px] rounded-lg shadow-sm" />
                                        </Grid>
                                        <Grid item xs={9} sm={6}>
                                            <Link
                                                to={`/product/${item.product}`}
                                                className="text-sm md:text-base text-purple-700 dark:text-purple-300 hover:underline"
                                            >
                                                {item.name}
                                            </Link>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography
                                                variant="body2"
                                                className="text-gray-700 dark:text-ink mt-1 sm:mt-0 text-right sm:text-left"
                                            >
                                                {item.quantity} x P{item.price} ={' '}
                                                <b>P{(item.quantity * item.price).toFixed(2)}</b>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper className="rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-6 md:p-7" elevation={4}>
                            <Typography
                                variant="h6"
                                className="font-semibold text-gray-900 dark:text-ink mb-3"
                            >
                                Order Summary
                            </Typography>
                            <Divider className="mb-4" />

                            <Box className="space-y-2 text-sm text-gray-700 dark:text-ink">
                                <Box className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">${itemsPrice}</span>
                                </Box>
                                <Box className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="font-medium">${shippingPrice}</span>
                                </Box>
                                <Box className="flex justify-between">
                                    <span>Tax:</span>
                                    <span className="font-medium">${taxPrice}</span>
                                </Box>
                            </Box>

                            <Divider className="my-4" />

                            <Box className="flex justify-between items-center mb-4 text-sm text-gray-900 dark:text-ink">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold text-lg">${totalPrice}</span>
                            </Box>

                            <Button
                                id="checkout_btn"
                                fullWidth
                                variant="contained"
                                onClick={processToPayment}
                                sx={{
                                    borderRadius: '999px',
                                    py: 1.4,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    backgroundImage: 'linear-gradient(to right, #a855f7, #6366f1)',
                                    boxShadow: '0 10px 25px rgba(88, 28, 135, 0.35)',
                                    '&:hover': {
                                        backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
                                        boxShadow: '0 12px 30px rgba(76, 29, 149, 0.5)'
                                    }
                                }}
                            >
                                Proceed to Payment
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

        </>
    )
}

export default ConfirmOrder