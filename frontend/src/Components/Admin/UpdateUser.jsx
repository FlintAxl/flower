import React, {  useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
import Loader from '../Layout/Loader'

import { errMsg, successMsg, getToken } from '../../Utils/helpers';

import axios from 'axios';

const UpdateUser = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [user, setUser] = useState(true)
    const [isUpdated, setIsUpdated] = useState(false)
    let navigate = useNavigate();

    const { id } = useParams();
    const config = {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${getToken()}`
        }
    }
    const getUserDetails = async (id) => {
    
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/user/${id}`,config)
            setUser(data.user)
            setLoading(false)
            
        } catch (error) {
            setError(error.response.data.message)
        }
    }

    const updateUser = async (id, userData) => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/user/${id}`, userData, config)
            setIsUpdated(data.success)
            setLoading(false)
            
        } catch (error) {
           setError(error.response.data.message)
        }
    }

    useEffect(() => {
        // console.log(user && user._id !== userId);
        if (user && user._id !== id) {
            getUserDetails(id)
        } else {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role)
        }
        if (error) {
            errMsg(error);
            setError('');
        }
        if (isUpdated) {
            successMsg('User updated successfully')
            navigate('/admin/users')
           
        }
    }, [error, isUpdated, id, user])
    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set('name', name);
        formData.set('email', email);
        formData.set('role', role);
        updateUser(user._id, formData)
    }

    return (
        <>
            <MetaData title={`Update User`} />

            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-6 lg:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-2">Update User</h1>
                            <p className="text-gray-600 dark:text-ink-muted text-sm">
                                Edit user details and role for your Botany &amp; Co admin.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-500/30 p-6 sm:p-8">
                                <form onSubmit={submitHandler} className="space-y-5">
                                    <div>
                                        <label htmlFor="name_field" className="block text-sm font-medium text-gray-700 dark:text-ink mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name_field"
                                            className="w-full rounded-lg border border-gray-300 dark:border-purple-500/40 bg-white dark:bg-gray-900/80 px-3 py-2 text-sm text-gray-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            name='name'
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email_field" className="block text-sm font-medium text-gray-700 dark:text-ink mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email_field"
                                            className="w-full rounded-lg border border-gray-300 dark:border-purple-500/40 bg-white dark:bg-gray-900/80 px-3 py-2 text-sm text-gray-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            name='email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="role_field" className="block text-sm font-medium text-gray-700 dark:text-ink mb-1">
                                            Role
                                        </label>
                                        <select
                                            id="role_field"
                                            className="w-full rounded-lg border border-gray-300 dark:border-purple-500/40 bg-white dark:bg-gray-900/80 px-3 py-2 text-sm text-gray-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            name='role'
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="user">user</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-md hover:opacity-90 transition disabled:opacity-60"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateUser