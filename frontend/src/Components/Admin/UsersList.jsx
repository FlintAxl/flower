import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import axios from 'axios';
import { getToken, errMsg, successMsg } from '../../Utils/helpers';
import { DataGrid, } from '@mui/x-data-grid'
import { toast } from 'react-toastify';

const UsersList = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [allUsers, setAllUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])
    const [bulkDeleting, setBulkDeleting] = useState(false)
    const [togglingStatus, setTogglingStatus] = useState({})
    let navigate = useNavigate();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    }
    const listUsers = async () => {
        try {

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, config)
            setAllUsers(data.users)
            setLoading(false)

        } catch (error) {
            setError(error.response.data.message)

        }
    }

    useEffect(() => {
        listUsers();
        if (error) {
            errMsg(error);
            setError('')
        }
    }, [error])



    const bulkDeleteUsers = async (userIds) => {
        try {
            setBulkDeleting(true)
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/users/bulk`, {
                ...config,
                data: { userIds }
            })

            if (data.success) {
                toast.success(`${userIds.length} users deleted successfully`, {
                    position: 'bottom-right'
                })
                setSelectedUsers([])
                listUsers() // Refresh the users list
            }
            setBulkDeleting(false)
        } catch (error) {
            setBulkDeleting(false)
            toast.error(error.response?.data?.message || 'Failed to delete users', {
                position: 'bottom-right'
            })
        }
    }

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) {
            toast.warning('Please select users to delete', {
                position: 'bottom-right'
            })
            return
        }

        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users? This action cannot be undone.`)) {
            bulkDeleteUsers(selectedUsers)
        }
    }

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedUsers(allUsers.map(user => user._id))
        } else {
            setSelectedUsers([])
        }
    }

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId)
            } else {
                return [...prev, userId]
            }
        })
    }

    const toggleUserStatus = async (userId) => {
        try {
            setTogglingStatus(prev => ({ ...prev, [userId]: true }))
            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/admin/user/${userId}/toggle-status`,
                {},
                config
            )

            if (data.success) {
                successMsg(data.message)
                // Update the user in the list
                setAllUsers(prevUsers => 
                    prevUsers.map(user => 
                        user._id === userId 
                            ? { ...user, isActive: data.user.isActive }
                            : user
                    )
                )
            }
            setTogglingStatus(prev => ({ ...prev, [userId]: false }))
        } catch (error) {
            setTogglingStatus(prev => ({ ...prev, [userId]: false }))
            errMsg(error.response?.data?.message || 'Failed to toggle user status')
        }
    }

    const columns = [
        {
            field: 'select',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            renderHeader: () => (
                <input
                    type="checkbox"
                    checked={selectedUsers.length === allUsers.length && allUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
            ),
            renderCell: (params) => (
                <input
                    type="checkbox"
                    checked={selectedUsers.includes(params.id)}
                    onChange={() => handleSelectUser(params.id)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
            )
        },
        {
            field: 'id',
            headerName: '🆔 User ID',
            width: 200,
            renderCell: (params) => (
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400" style={{ wordBreak: 'break-all' }}>
                    {params.value.substring(0, 8)}...
                </span>
            )
        },
        {
            field: 'name',
            headerName: '👤 Name',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{params.value}</span>
            )
        },
        {
            field: 'email',
            headerName: '📧 Email',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <span className="text-gray-700 dark:text-gray-300">{params.value}</span>
            )
        },
        {
            field: 'role',
            headerName: '🔐 Role',
            width: 120,
            renderCell: (params) => (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    params.value === 'admin' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'isActive',
            headerName: '📊 Status',
            width: 120,
            renderCell: (params) => (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    params.value 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                    {params.value ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: '⚙️ Actions',
            width: 200,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const isActive = params.row.isActive;
                const isLoading = togglingStatus[params.id];
                return (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => toggleUserStatus(params.id)}
                            disabled={isLoading}
                            className={`p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                                isActive
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isActive ? 'Deactivate User' : 'Activate User'}
                        >
                            {isLoading ? (
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>
                        <Link 
                            to={`/admin/user/${params.id}`} 
                            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit User"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Link>
                    </div>
                )
            }
        }
    ];
    const rows = allUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive !== undefined ? user.isActive : true,
    }));

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-2">
                                        👥 All Users
                                    </h1>
                                    <p className="text-gray-600 dark:text-ink-muted">
                                        Manage your system users
                                    </p>
                                </div>
                                <Link
                                    to="/admin/user/new"
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create New User
                                </Link>
                            </div>
                            
                            {/* Bulk Actions */}
                            {selectedUsers.length > 0 && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-purple-700 dark:text-purple-300 font-medium">
                                            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedUsers([])}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                        >
                                            Clear Selection
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={bulkDeleting}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                                        >
                                            {bulkDeleting ? (
                                                <>
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Selected
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Users Table */}
                        <div className="rounded-xl shadow-lg overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader />
                                </div>
                            ) : (
                                <div style={{ height: 600, width: '100%' }} className="border-2 border-purple-200 dark:border-purple-500/30 rounded-xl overflow-hidden">
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSize={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                        disableSelectionOnClick
                                        getRowId={(row) => row.id}
                                        rowHeight={80}
                                        className="dark:bg-gray-800"
                                        sx={{
                                            border: 'none',
                                            '& .MuiDataGrid-main': {
                                                color: 'inherit',
                                            },
                                            '& .MuiDataGrid-root': {
                                                backgroundColor: 'transparent',
                                            },
                                            '& .MuiDataGrid-virtualScroller': {
                                                backgroundColor: 'transparent',
                                            },
                                            '& .MuiDataGrid-cell': {
                                                borderBottom: '1px solid rgba(147, 51, 234, 0.1)',
                                                color: 'inherit',
                                            },
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                                borderBottom: '2px solid rgba(147, 51, 234, 0.2)',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                color: 'inherit',
                                            },
                                            '& .MuiDataGrid-row': {
                                                color: 'inherit',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(147, 51, 234, 0.05)',
                                                },
                                            },
                                            '& .MuiDataGrid-columnHeaderTitle': {
                                                color: 'inherit',
                                            },
                                            '& .MuiDataGrid-columnSeparator': {
                                                display: 'none',
                                            },
                                            '& .MuiDataGrid-footerContainer': {
                                                backgroundColor: 'inherit',
                                                color: 'inherit',
                                                borderTop: '2px solid rgba(147, 51, 234, 0.2)',
                                            },
                                            '& .MuiTablePagination-root': {
                                                color: 'inherit',
                                            },
                                            '& .MuiIconButton-root': {
                                                color: 'inherit',
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* User Statistics Cards */}
                        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-purple-100 mb-1">Total Users</p>
                                <p className="text-2xl font-bold">{allUsers.length}</p>
                                <Link to="/admin/users" className="text-xs text-purple-100 hover:underline mt-1 block">Manage users</Link>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-green-100 mb-1">Regular Users</p>
                                <p className="text-2xl font-bold">
                                    {allUsers.filter(u => u.role === 'user').length}
                                </p>
                                <p className="text-xs text-green-100 mt-1">Customer accounts</p>
                            </div>

                            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-red-100 mb-1">Administrators</p>
                                <p className="text-2xl font-bold">
                                    {allUsers.filter(u => u.role === 'admin').length}
                                </p>
                                <p className="text-xs text-red-100 mt-1">Admin accounts</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-blue-100 mb-1">Active Users</p>
                                <p className="text-2xl font-bold">
                                    {allUsers.filter(u => u.isActive !== false).length}
                                </p>
                                <p className="text-xs text-blue-100 mt-1">Currently active</p>
                            </div>

                            <div className="bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-gray-100 mb-1">Inactive Users</p>
                                <p className="text-2xl font-bold">
                                    {allUsers.filter(u => u.isActive === false).length}
                                </p>
                                <p className="text-xs text-gray-100 mt-1">Deactivated</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-orange-100 mb-1">New This Month</p>
                                <p className="text-2xl font-bold">
                                    {allUsers.filter(u => {
                                        const userDate = new Date(u.createdAt);
                                        const now = new Date();
                                        return userDate.getMonth() === now.getMonth() && 
                                               userDate.getFullYear() === now.getFullYear();
                                    }).length}
                                </p>
                                <p className="text-xs text-orange-100 mt-1">Recent signups</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UsersList