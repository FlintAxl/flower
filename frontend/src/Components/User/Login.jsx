import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { authenticate, getUser, firebaseSignIn, firebaseGoogleSignIn, successMsg, errMsg } from '../../Utils/helpers';
import { Box, Paper, TextField, Button, Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    let navigate = useNavigate()
    let location = useLocation()

    // Validation schema
    const loginSchema = yup.object().shape({
        email: yup
            .string()
            .required('Email is required')
            .email('Please enter a valid email address'),
        password: yup
            .string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters')
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onChange'
    });

    const onSubmit = (data) => {
        login(data.email, data.password)
    }

    const login = async (email, password) => {
        try {
            setLoading(true)
            
            // First, authenticate with Firebase
            const firebaseUser = await firebaseSignIn(email, password);
            console.log('Firebase user signed in:', firebaseUser);
            
            // Then authenticate with your backend
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const { data } = await axios.post(`http://localhost:4001/api/v1/login`, { 
                email, 
                password,
                firebaseUid: firebaseUser.uid 
            }, config)
            console.log(data)
            
            setLoading(false)
            authenticate(data, () => {
                successMsg('Login successful!')
                navigate("/me")
            })

        } catch (error) {
            setLoading(false)
            
            if (error.code) {
                // Firebase error
                let firebaseErrorMsg = 'Login failed';
                switch (error.code) {
                    case 'auth/user-not-found':
                        firebaseErrorMsg = 'No user found with this email';
                        break;
                    case 'auth/wrong-password':
                        firebaseErrorMsg = 'Incorrect password';
                        break;
                    case 'auth/invalid-email':
                        firebaseErrorMsg = 'Invalid email address';
                        break;
                    case 'auth/too-many-requests':
                        firebaseErrorMsg = 'Too many failed attempts. Please try again later.';
                        break;
                    default:
                        firebaseErrorMsg = error.message;
                }
                errMsg(firebaseErrorMsg)
            } else {
                errMsg("Invalid user or password")
            }
        }
    }

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : ''
    console.log(redirect)
    // useEffect(() => {
    //     if (getUser()  ) {
    //          navigate('/')
    //     }
    // }, [])

    useEffect(() => {
        if (getUser() && redirect === 'shipping') {
            navigate(`/${redirect}`)
        }
    }, [])

    const handleGoogleLogin = async () => {
        try {
            setLoading(true)
            
            // Sign in with Google via Firebase
            const firebaseUser = await firebaseGoogleSignIn();
            console.log('Google user signed in:', firebaseUser);
            
            // Try to login first (check if user exists)
            const loginConfig = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            try {
                // First, try to login with existing user
                const loginData = {
                    email: firebaseUser.email,
                    firebaseUid: firebaseUser.uid,
                    isGoogleLogin: 'true'
                };
                
                const { data } = await axios.post(`http://localhost:4001/api/v1/login`, loginData, loginConfig);
                
                setLoading(false)
                authenticate(data, () => {
                    successMsg('Google login successful!')
                    navigate("/me")
                })
                
            } catch (loginError) {
                // User doesn't exist, create new user
                if (loginError.response && loginError.response.status === 401) {
                    console.log('User not found, creating new user...');
                    
                    const registerConfig = {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                    
                    const formData = new FormData();
                    formData.set('name', firebaseUser.displayName || firebaseUser.email.split('@')[0]);
                    formData.set('email', firebaseUser.email);
                    formData.set('firebaseUid', firebaseUser.uid);
                    formData.set('isGoogleSignup', 'true');
                    
                    // Auto-generate a secure password for Google users
                    const autoPassword = `Google_${firebaseUser.uid.substring(0, 10)}_${Date.now()}`;
                    formData.set('password', autoPassword);
                    
                    // Handle Google profile picture
                    if (firebaseUser.photoURL) {
                        formData.set('avatarUrl', firebaseUser.photoURL);
                    }
                    
                    // Create empty file for avatar field requirement
                    const emptyFileContent = new Uint8Array([
                        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
                        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
                        0x00, 0xFF, 0xD9
                    ]);
                    const emptyFile = new File([emptyFileContent], 'empty-avatar.jpg', { 
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    formData.set('avatar', emptyFile);
                    
                    try {
                        const { data } = await axios.post(`http://localhost:4001/api/v1/register`, formData, registerConfig);
                        
                        setLoading(false)
                        authenticate(data, () => {
                            successMsg('Google registration and login successful!')
                            navigate("/me")
                        })
                        
                    } catch (registerError) {
                        setLoading(false)
                        console.error('Google registration error:', registerError)
                        errMsg('Failed to create Google account. Please try again.')
                    }
                    
                } else {
                    setLoading(false)
                    console.error('Google login error:', loginError)
                    errMsg('Google login failed. Please try again.')
                }
            }

        } catch (error) {
            setLoading(false)
            
            if (error.code) {
                // Firebase error
                let firebaseErrorMsg = 'Google login failed';
                switch (error.code) {
                    case 'auth/popup-closed-by-user':
                        firebaseErrorMsg = 'Login cancelled by user';
                        break;
                    case 'auth/popup-blocked':
                        firebaseErrorMsg = 'Popup blocked. Please allow popups and try again.';
                        break;
                    default:
                        firebaseErrorMsg = error.message;
                }
                errMsg(firebaseErrorMsg)
            } else {
                errMsg("Google login failed")
            }
        }
    }

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={'Login'} />
                    <Box className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 dark:from-base-dark dark:via-base-soft dark:to-base-soft">
                        <Paper
                            elevation={6}
                            className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-base-soft/90 border border-purple-200/60 dark:border-purple-500/30 p-8"
                        >
                            <Typography
                                variant="h5"
                                component="h1"
                                className="text-center font-semibold text-gray-900 dark:text-ink tracking-wide mb-1"
                            >
                                Welcome back
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-center text-gray-600 dark:text-ink-muted mb-6"
                            >
                                Login to your Botany &amp; Co account
                            </Typography>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <TextField
                                    id="email_field"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    variant="outlined"
                                    size="medium"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />

                                <TextField
                                    id="password_field"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    variant="outlined"
                                    size="medium"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(prev => !prev)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Box className="flex justify-between items-center text-sm mb-1">
                                    <span />
                                    <Link
                                        to="/password/forgot"
                                        className="text-purple-600 dark:text-purple-400 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </Box>

                                <Button
                                    id="login_button"
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
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
                                    Login
                                </Button>

                                <Box className="flex items-center my-2">
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-base-soft" />
                                    <span className="mx-3 text-xs uppercase tracking-widest text-gray-400">or</span>
                                    <div className="flex-1 h-px bg-gray-200 dark:bg-base-soft" />
                                </Box>

                                <Button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    fullWidth
                                    variant="outlined"
                                    disabled={loading}
                                    sx={{
                                        borderRadius: '999px',
                                        py: 1.3,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        borderColor: '#db4437',
                                        color: '#db4437',
                                        '&:hover': {
                                            borderColor: '#c23321',
                                            backgroundColor: 'rgba(219, 68, 55, 0.06)'
                                        }
                                    }}
                                >
                                    <span className="mr-2">
                                        <i className="fab fa-google" />
                                    </span>
                                    Sign in with Google
                                </Button>

                                <Typography
                                    variant="body2"
                                    className="text-center text-gray-600 dark:text-ink-muted mt-1"
                                >
                                    New user?{' '}
                                    <Link
                                        to="/register"
                                        className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                                    >
                                        Create an account
                                    </Link>
                                </Typography>
                            </form>
                        </Paper>
                    </Box>

                </>
            )}
        </>
    )
}
export default Login
