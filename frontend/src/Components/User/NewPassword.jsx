import { useState } from 'react'
import { useNavigate, useParams, Link } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Box, Paper, TextField, Button, Typography, Divider } from '@mui/material';
import { authenticate } from '../../Utils/helpers';

const NewPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [tokenValid, setTokenValid] = useState(true)

    const navigate = useNavigate();
    const { token } = useParams();

    const resetPassword = async (e) => {
        e.preventDefault();
        
        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters long', {
                position: 'bottom-right'
            });
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match', {
                position: 'bottom-right'
            });
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/password/reset/${token}`, 
                { password, confirmPassword }, 
                config
            );
            
            if (data.success) {
                toast.success(data.message || 'Password reset successfully!', {
                    position: 'bottom-right',
                    autoClose: 3000
                });
                
                // Auto-login user if token is returned
                if (data.token && data.user) {
                    authenticate(data, () => {
                        navigate('/me');
                    });
                } else {
                    navigate('/login');
                }
            }
        } catch (error) {
            setLoading(false);
            const errorMessage = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
            toast.error(errorMessage, {
                position: 'bottom-right',
                autoClose: 5000
            });
            
            if (error.response?.status === 400) {
                setTokenValid(false);
            }
        }
    }

    return (
        <>
            <MetaData title={'Reset Password'} />
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
                        🔑 Reset Password
                    </Typography>
                    <Typography
                        variant="body2"
                        className="text-center text-gray-600 dark:text-ink-muted mb-6"
                    >
                        Enter your new password below
                    </Typography>

                    {!tokenValid && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                This reset link is invalid or has expired. Please request a new one.
                            </p>
                        </div>
                    )}

                    <form onSubmit={resetPassword} className="space-y-5">
                        <TextField
                            id="password_field"
                            label="New Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading || !tokenValid}
                            helperText="Must be at least 6 characters"
                        />

                        <TextField
                            id="confirm_password_field"
                            label="Confirm Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            size="medium"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading || !tokenValid}
                        />

                        <Divider className="my-2" />

                        <Button
                            id="new_password_button"
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading || !tokenValid}
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
                            {loading ? 'Resetting Password...' : 'Reset Password'}
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

export default NewPassword