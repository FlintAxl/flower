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
                    className="form-check-input"
                />
            ),
            renderCell: (params) => (
                <input
                    type="checkbox"
                    checked={selectedUsers.includes(params.id)}
                    onChange={() => handleSelectUser(params.id)}
                    className="form-check-input"
                />
            )
        },
        {
            field: 'id',
            headerName: 'User ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',

            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Link to={`/admin/user/${params.id}`} className="btn btn-primary py-1 px-2">
                    <i className="fa fa-pencil"></i>
                </Link>
            )
        }
    ];
    const rows = allUsers.map(user => ({
        id: user._id,
        name: user.name,

        email: user.email,
        role: user.role,
    }));

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <div className="d-flex justify-content-between align-items-center my-5">
                            <h1>All Users</h1>
                            <Link
                                to="/admin/user/new"
                                className="btn btn-primary"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    color: 'white'
                                }}
                            >
                                <i className="fa fa-plus mr-2"></i>
                                Create New User
                            </Link>
                        </div>
                        
                        {/* Bulk Actions */}
                        {selectedUsers.length > 0 && (
                            <div className="alert alert-info d-flex justify-content-between align-items-center mb-4" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                color: 'white'
                            }}>
                                <div>
                                    <strong>{selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected</strong>
                                </div>
                                <div>
                                    <button
                                        onClick={() => setSelectedUsers([])}
                                        className="btn btn-light btn-sm mr-2"
                                    >
                                        Clear Selection
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={bulkDeleting}
                                        className="btn btn-danger btn-sm"
                                    >
                                        {bulkDeleting ? (
                                            <>
                                                <i className="fa fa-spinner fa-spin mr-1"></i>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-trash mr-1"></i>
                                                Delete Selected
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}

                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default UsersList