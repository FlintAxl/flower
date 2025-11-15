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

const Login = () => {
    const [loading, setLoading] = useState(false)
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

                    <div className="row wrapper">
                        <div className="col-10 col-lg-5">
                            <form className="shadow-lg"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <h1 className="mb-3">Login</h1>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback d-block">{errors.email.message}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password_field">Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        {...register('password')}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback d-block">{errors.password.message}</div>
                                    )}
                                </div>

                                <Link to="/password/forgot" className="float-right mb-4">Forgot Password?</Link>

                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading}
                                >
                                    LOGIN
                                </button>

                                <div className="text-center my-3">
                                    <span>OR</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="btn btn-danger btn-block py-3 mb-3"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#db4437',
                                        borderColor: '#db4437',
                                        color: 'white'
                                    }}
                                >
                                    <i className="fab fa-google mr-2"></i>
                                    Sign in with Google
                                </button>

                                <Link to="/register" className="float-right mt-3">New User?</Link>
                            </form>
                        </div>
                    </div>


                </>
            )}
        </>
    )
}
export default Login
