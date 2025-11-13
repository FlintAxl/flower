import React, {  useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import axios from 'axios'
import { firebaseSignUp, firebaseGoogleSignIn, successMsg, errMsg, authenticate } from '../../Utils/helpers'


const Register = () => {
  
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    })

    const { name, email, password } = user;

    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
   
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
   

    let navigate = useNavigate()
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         navigate('/')
    //     }

    //     if (error) {
    //         console.log(error)
    //         dispatch(clearErrors());
           
    //     }

    // }, [error, navigate, isAuthenticated])

    const submitHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('password', password);
        formData.set('avatar', avatar);
      
       register(formData)
    }

    const onChange = e => {
        if (e.target.name === 'avatar') {

            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result)
                    setAvatar(reader.result)
                }
            }

            reader.readAsDataURL(e.target.files[0])

        } else {
            setUser({ ...user, [e.target.name]: e.target.value })
        }
    }

    const register = async (userData) => {
        console.log(userData)
        try {
            setLoading(true)
            
            // First, create user in Firebase
            const firebaseUser = await firebaseSignUp(email, password);
            console.log('Firebase user created:', firebaseUser);
            
            // Then register in your backend database
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            // Add Firebase UID to the form data
            userData.set('firebaseUid', firebaseUser.uid);

            const { data } = await axios.post(`http://localhost:4001/api/v1/register`, userData, config)
            console.log(data.user)
           
            setLoading(false)
            setUser(data.user)
            authenticate(data, () => {
                successMsg('Registration successful! User created in both Firebase and database.')
                navigate('/me')
            })

        } catch (error) {
            setLoading(false)
            setUser(null)
            
            if (error.code) {
                // Firebase error
                let firebaseErrorMsg = 'Registration failed';
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        firebaseErrorMsg = 'Email is already registered';
                        break;
                    case 'auth/weak-password':
                        firebaseErrorMsg = 'Password should be at least 6 characters';
                        break;
                    case 'auth/invalid-email':
                        firebaseErrorMsg = 'Invalid email address';
                        break;
                    default:
                        firebaseErrorMsg = error.message;
                }
                setError(firebaseErrorMsg)
                errMsg(firebaseErrorMsg)
            } else if (error.response) {
                // Backend error
                setError(error.response.data.message)
                errMsg(error.response.data.message)
            } else {
                setError('Registration failed')
                errMsg('Registration failed')
            }
            console.log(error)
        }
    }

    const handleGoogleSignup = async () => {
        try {
            setLoading(true)
            
            // Sign up with Google via Firebase
            const firebaseUser = await firebaseGoogleSignIn();
            console.log('Google user signed up:', firebaseUser);
            
            // Register user in your backend using FormData (same as regular registration)
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            
            const formData = new FormData();
            formData.set('name', firebaseUser.displayName || firebaseUser.email.split('@')[0]);
            formData.set('email', firebaseUser.email);
            formData.set('firebaseUid', firebaseUser.uid);
            formData.set('isGoogleSignup', 'true');
            
            // Auto-generate a secure password for Google users (they won't use it for login)
            const autoPassword = `Google_${firebaseUser.uid.substring(0, 10)}_${Date.now()}`;
            formData.set('password', autoPassword);
            
            // Handle avatar - send Google photo URL and create empty file blob for required file parameter
            if (firebaseUser.photoURL) {
                formData.set('avatarUrl', firebaseUser.photoURL);
            }
            
            // Create a simple file input element and simulate file selection
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            
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
            
            console.log('Created File object:', {
                name: emptyFile.name,
                size: emptyFile.size,
                type: emptyFile.type,
                lastModified: emptyFile.lastModified
            });
            
            formData.set('avatar', emptyFile);
            
            // Debug: Log what we're sending
            console.log('Sending Google signup data:');
            console.log('Name:', firebaseUser.displayName || firebaseUser.email.split('@')[0]);
            console.log('Email:', firebaseUser.email);
            console.log('Firebase UID:', firebaseUser.uid);
            console.log('Photo URL:', firebaseUser.photoURL);
            
            // Log all FormData entries
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            
            console.log('Sending request to backend...')
            const { data } = await axios.post(`http://localhost:4001/api/v1/register`, formData, config)
            console.log('Backend response received:', data)
            console.log('User data:', data.user)
            
            setLoading(false)
            setUser(data.user)
            authenticate(data, () => {
                successMsg('Google registration successful!')
                navigate('/me')
            })
            console.log('Registration completed successfully!')

        } catch (error) {
            setLoading(false)
            
            if (error.code) {
                // Firebase error
                let firebaseErrorMsg = 'Google signup failed';
                switch (error.code) {
                    case 'auth/popup-closed-by-user':
                        firebaseErrorMsg = 'Signup cancelled by user';
                        break;
                    case 'auth/popup-blocked':
                        firebaseErrorMsg = 'Popup blocked. Please allow popups and try again.';
                        break;
                    case 'auth/account-exists-with-different-credential':
                        firebaseErrorMsg = 'An account already exists with this email';
                        break;
                    default:
                        firebaseErrorMsg = error.message;
                }
                setError(firebaseErrorMsg)
                errMsg(firebaseErrorMsg)
            } else if (error.response) {
                // Backend error - log full error details
                console.error('Backend error details:', error.response);
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                
                const errorMessage = error.response.data?.message || error.response.data || 'Backend error occurred';
                setError(errorMessage)
                errMsg(`Backend Error (${error.response.status}): ${errorMessage}`)
            } else {
                console.error('Unknown error:', error);
                setError('Google signup failed')
                errMsg('Google signup failed')
            }
        }
    }

    return (
        <>

            <MetaData title={'Register User'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                        <h1 className="mb-3">Register</h1>

                        <div className="form-group">
                            <label htmlFor="email_field">Name</label>
                            <input
                                type="name"
                                id="name_field"
                                className="form-control"
                                name='name'
                                value={name}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name='email'
                                value={email}
                                onChange={onChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                name='password'
                                value={password}
                                onChange={onChange}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='avatar_upload'>Avatar</label>
                            <div className='d-flex align-items-center'>
                                <div>
                                    <figure className='avatar mr-3 item-rtl'>
                                        <img
                                            src={avatarPreview}
                                            className='rounded-circle'
                                            alt='Avatar Preview'
                                        />
                                    </figure>
                                </div>
                                <div className='custom-file'>
                                    <input
                                        type='file'
                                        name='avatar'
                                        className='custom-file-input'
                                        id='customFile'
                                        accept="images/*"
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            id="register_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading}
                        >
                            REGISTER
                        </button>

                        <div className="text-center my-3">
                            <span>OR</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="btn btn-danger btn-block py-3 mb-3"
                            disabled={loading}
                            style={{
                                backgroundColor: '#db4437',
                                borderColor: '#db4437',
                                color: 'white'
                            }}
                        >
                            <i className="fab fa-google mr-2"></i>
                            Sign up with Google
                        </button>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Register