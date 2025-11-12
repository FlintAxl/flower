import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'

import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { authenticate, getUser, firebaseSignIn, firebaseGoogleSignIn, successMsg, errMsg } from '../../Utils/helpers';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)
    let navigate = useNavigate()
    let location = useLocation()

    const submitHandler = (e) => {
        e.preventDefault();
        login(email, password)
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
            
            // Check if user exists in your backend, if not create them
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            
            // For Google login, always try to register first
            // If user exists, backend should return user data instead of error
            const registerConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            
            const formData = new FormData();
            formData.set('name', firebaseUser.displayName || firebaseUser.email.split('@')[0]);
            formData.set('email', firebaseUser.email);
            formData.set('firebaseUid', firebaseUser.uid);
            formData.set('isGoogleLogin', 'true'); // Changed from isGoogleSignup
            
            // Auto-generate a secure password for Google users (they won't use it for login)
            const autoPassword = `Google_${firebaseUser.uid.substring(0, 10)}_${Date.now()}`;
            formData.set('password', autoPassword);
            
            // Handle avatar - send Google photo URL and create empty file blob for required file parameter
            if (firebaseUser.photoURL) {
                formData.set('avatarUrl', firebaseUser.photoURL);
            }
            
            // Create a proper File object (not just Blob)
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
                    successMsg('Google login successful!')
                    navigate("/me")
                })
            } catch (backendError) {
                setLoading(false)
                
                if (backendError.response && backendError.response.status === 400) {
                    // User might already exist - show appropriate message
                    errMsg('User already exists or there was an issue with Google login. Please try regular login.')
                } else {
                    errMsg('Google login failed. Please try again.')
                }
                console.error('Google login error:', backendError)
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
                                onSubmit={submitHandler}
                            >
                                <h1 className="mb-3">Login</h1>
                                <div className="form-group">
                                    <label htmlFor="email_field">Email</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password_field">Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
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
