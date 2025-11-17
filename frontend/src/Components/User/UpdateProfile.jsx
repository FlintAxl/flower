import React, {  useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MetaData from '../Layout/MetaData'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getToken } from '../../Utils/helpers';


const UpdateProfile = () => {
    
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('/images/default_avatar.jpg')
    const [error, setError] = useState('')
    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    // Validation schema
    const profileSchema = yup.object().shape({
        name: yup
            .string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name cannot exceed 50 characters')
            .trim(),
        email: yup
            .string()
            .required('Email is required')
            .email('Please enter a valid email address'),
        avatar: yup
            .mixed()
            .nullable()
            .test('fileSize', 'Avatar must be less than 2MB', (value) => {
                if (!value || !value.size) return true;
                return value.size <= 2 * 1024 * 1024;
            })
            .test('fileType', 'Only image files are allowed', (value) => {
                if (!value || !value.type) return true;
                return value.type.startsWith('image/');
            })
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        resolver: yupResolver(profileSchema),
        mode: 'onChange'
    });

    const getProfile = async () => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        }
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/me`, config)
            console.log(data)
            setUser(data.user)
            reset({
                name: data.user.name || '',
                email: data.user.email || ''
            });
            setAvatarPreview(data.user.avatar.url)
            setLoading(false)
        } catch (error) {
            console.log(error)
            toast.error('user not found', {
                position: 'bottom-right'
            });
        }
    }

    const updateProfile = async (userData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${getToken()}`
            }
        }
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/me/update`, userData, config)
            setIsUpdated(data.success)
            setLoading(false)
            toast.success('user updated', {
                position: 'bottom-right'
            });
            getProfile();
            navigate('/me', { replace: true })


        } catch (error) {
            console.log(error)
            toast.error('user not found', {
                position: 'bottom-right'
            });
        }
    }

    console.log(error)
    useEffect(() => {
        getProfile()

    }, [])

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.set('name', data.name);
        formData.set('email', data.email);
        if (avatar) {
            formData.set('avatar', avatar);
        }
        updateProfile(formData)
    }

    const onChange = e => {
        const file = e.target.files[0];
        if (file) {
            setValue('avatar', file, { shouldValidate: true });
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result)
                    setAvatar(reader.result)
                }
            }

            reader.readAsDataURL(file)
        }
    }
    // console.log(user)

    
    return (
        <>
            <MetaData title={'Update Profile'} />

            <div className="min-h-screen bg-white dark:bg-base-dark flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-500/30 p-6 sm:p-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-ink mb-1">Update Profile</h1>
                        <p className="text-sm text-gray-600 dark:text-ink-muted mb-6">
                            Keep your Botany &amp; Co account details up to date.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} encType='multipart/form-data' className="space-y-5">
                            <div>
                                <label htmlFor="name_field" className="block text-sm font-medium text-gray-700 dark:text-ink mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name_field"
                                    className={`w-full rounded-lg border border-gray-300 dark:border-purple-500/40 bg-white dark:bg-gray-900/80 px-3 py-2 text-sm text-gray-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.name ? 'ring-1 ring-red-500' : ''}`}
                                    name='name'
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <div className="mt-1 text-xs text-red-500">{errors.name.message}</div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email_field" className="block text-sm font-medium text-gray-700 dark:text-ink mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email_field"
                                    className={`w-full rounded-lg border border-gray-300 dark:border-purple-500/40 bg-white dark:bg-gray-900/80 px-3 py-2 text-sm text-gray-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.email ? 'ring-1 ring-red-500' : ''}`}
                                    name='email'
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <div className="mt-1 text-xs text-red-500">{errors.email.message}</div>
                                )}
                            </div>

                            <div>
                                <label htmlFor='avatar_upload' className="block text-sm font-medium text-gray-700 dark:text-ink mb-1">
                                    Avatar
                                </label>
                                <div className='flex items-center gap-4'>
                                    <div>
                                        <figure className='avatar mr-3 item-rtl'>
                                            <img
                                                src={avatarPreview}
                                                className='rounded-full w-16 h-16 object-cover border-2 border-purple-200 dark:border-purple-500/60'
                                                alt='Avatar Preview'
                                            />
                                        </figure>
                                    </div>
                                    <div className='flex-1'>
                                        <input
                                            type='file'
                                            name='avatar'
                                            className={`block w-full text-sm text-gray-900 dark:text-ink file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/40 dark:file:text-purple-200 ${errors.avatar ? 'border-red-500' : ''}`}
                                            id='customFile'
                                            accept='image/*'
                                            onChange={onChange}
                                        />
                                        {errors.avatar && (
                                            <div className="mt-1 text-xs text-red-500">{errors.avatar.message}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-md hover:opacity-90 transition disabled:opacity-60"
                                    disabled={loading ? true : false}
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateProfile