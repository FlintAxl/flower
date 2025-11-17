import React, { useState } from 'react'
import MetaData from '../Layout/MetaData'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography } from '@mui/material';

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const forgotPassword = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email address', {
                position: 'bottom-right'
            });
            return;
        }

        setLoading(true);
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API}/password/forgot`, 
                { email }, 
                config
            );
            
            setLoading(false);
            toast.success(data.message, {
                position: 'bottom-right',
                autoClose: 5000
            });
            navigate('/login');
        } catch (error) {
            setLoading(false);
            toast.error(
                error.response?.data?.message || 'Failed to send reset email. Please try again.', 
                {
                    position: 'bottom-right'
                }
            );
        }
    }

    return (
        <>
            <MetaData title={'Forgot Password'} />
            <Box className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 dark:from-base-dark dark:via-base-soft dark:to-base-soft">
                <Paper
                    elevation={6}
                    className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-8"
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        className="font-bold text-gray-900 dark:text-ink mb-2 text-center"
                    >
                        🔐 Forgot Password?
                    </Typography>
                    <Typography
                        variant="body2"
                        className="text-center text-gray-600 dark:text-ink-muted mb-6"
                    >
                        Enter your email address and we'll send you a link to reset your password.
                    </Typography>

                    <form onSubmit={forgotPassword} className="space-y-5">
                        <TextField
                            id="email_field"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />

                        <Button
                            id="forgot_password_button"
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                borderRadius: '999px',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundImage: 'linear-gradient(to right, #a855f7, #6366f1)',
                                boxShadow: '0 10px 25px rgba(88, 28, 135, 0.35)',
                                '&:hover': {
                                    backgroundImage: 'linear-gradient(to right, #9333ea, #4f46e5)',
                                    boxShadow: '0 12px 30px rgba(76, 29, 149, 0.5)'
                                },
                                '&:disabled': {
                                    opacity: 0.6
                                }
                            }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <div className="text-center mt-4">
                            <Link
                                to="/login"
                                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                </Paper>
            </Box>
        </>
    )
}

export default ForgotPassword