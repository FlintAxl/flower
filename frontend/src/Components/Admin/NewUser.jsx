import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import { getToken, firebaseSignUp } from '../../Utils/helpers'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const NewUser = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    })
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const { name, email, password, role } = user

    const onChange = e => {
        if (e.target.name === 'avatar') {
            const reader = new FileReader()
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

    const submitHandler = async (e) => {
        e.preventDefault()

        if (!name || !email || !password) {
            toast.error('Please fill in all required fields', {
                position: 'bottom-right'
            })
            return
        }

        try {
            setLoading(true)
            
            // Step 1: Create user in Firebase first
            console.log('Creating user in Firebase...')
            const firebaseUser = await firebaseSignUp(email, password)
            console.log('Firebase user created:', firebaseUser.uid)

            // Step 2: Create user in your backend database
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const formData = {
                name,
                email,
                password,
                role,
                avatar: avatar || '/images/default_avatar.jpg',
                firebaseUid: firebaseUser.uid // Include Firebase UID
            }

            const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/user/new`, formData, config)

            if (data.success) {
                toast.success('User created successfully in both Firebase and database', {
                    position: 'bottom-right'
                })
                navigate('/admin/users')
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
            
            // Handle different types of errors
            if (error.code) {
                // Firebase error
                let firebaseErrorMsg = 'Error creating user in Firebase';
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        firebaseErrorMsg = 'Email is already registered in Firebase';
                        break;
                    case 'auth/invalid-email':
                        firebaseErrorMsg = 'Invalid email address';
                        break;
                    case 'auth/weak-password':
                        firebaseErrorMsg = 'Password is too weak (minimum 6 characters)';
                        break;
                    default:
                        firebaseErrorMsg = error.message;
                }
                toast.error(firebaseErrorMsg, {
                    position: 'bottom-right'
                })
            } else {
                // Backend error
                toast.error(error.response?.data?.message || 'Error creating user in database', {
                    position: 'bottom-right'
                })
            }
        }
    }

    return (
        <>
            <MetaData title={'Create New User'} />
            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-2">
                                👤 Create New User
                            </h1>
                            <p className="text-gray-600 dark:text-ink-muted">
                                Add a new user to the system
                            </p>
                        </div>

                        {/* Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <form onSubmit={submitHandler} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={name}
                                            onChange={onChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={onChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={password}
                                            onChange={onChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            placeholder="Enter password (min 6 characters)"
                                            minLength="6"
                                            required
                                        />
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={role}
                                            onChange={onChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Avatar */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Avatar
                                    </label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-500/30">
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                name="avatar"
                                                accept="image/*"
                                                onChange={onChange}
                                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-300"
                                            />
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                PNG, JPG, GIF up to 10MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="mt-8 flex items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/users')}
                                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                Create User
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewUser
