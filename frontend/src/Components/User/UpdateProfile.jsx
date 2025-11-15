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

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={handleSubmit(onSubmit)} encType='multipart/form-data'>
                        <h1 className="mt-2 mb-5">Update Profile</h1>

                        <div className="form-group">
                            <label htmlFor="name_field">Name</label>
                            <input
                                type="text"
                                id="name_field"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                name='name'
                                {...register('name')}
                            />
                            {errors.name && (
                                <div className="invalid-feedback d-block">{errors.name.message}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                name='email'
                                {...register('email')}
                            />
                            {errors.email && (
                                <div className="invalid-feedback d-block">{errors.email.message}</div>
                            )}
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
                                        className={`custom-file-input ${errors.avatar ? 'is-invalid' : ''}`}
                                        id='customFile'
                                        accept='image/*'
                                        onChange={onChange}
                                    />
                                    <label className='custom-file-label' htmlFor='customFile'>
                                        Choose Avatar
                                    </label>
                                    {errors.avatar && (
                                        <div className="invalid-feedback d-block">{errors.avatar.message}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false} >Update</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default UpdateProfile