import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { Box, Paper, Button, Typography } from '@mui/material'

const OrderSuccess = () => {
    // sessionStorage.clear();
    // localStorage.clear();
    // sessionStorage.removeItem()
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingInfo');
    return (
        <>

            <MetaData title={'Order Success'} />

            <Box
                className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 dark:from-base-dark dark:via-base-soft dark:to-base-soft"
            >
                <Paper
                    elevation={4}
                    className="max-w-md w-full rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-8 text-center"
                >
                    <Box className="mb-4 flex justify-center">
                        <img
                            className="my-2 img-fluid d-block mx-auto drop-shadow-md"
                            src="/images/order_success.png"
                            alt="Order Success"
                            width="180"
                            height="180"
                        />
                    </Box>

                    <Typography
                        variant="h5"
                        component="h2"
                        className="font-semibold text-gray-900 dark:text-ink mb-2 tracking-wide"
                    >
                        Your order has been placed successfully.
                    </Typography>

                    <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-ink-muted mb-6"
                    >
                        You can view your order details and track its status anytime in your orders page.
                    </Typography>

                    <Button
                        component={Link}
                        to="/orders/me"
                        variant="contained"
                        fullWidth
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
                        Go to Orders
                    </Button>
                </Paper>
            </Box>

        </>
    )
}

export default OrderSuccess