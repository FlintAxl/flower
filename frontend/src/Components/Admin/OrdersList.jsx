import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
import { getToken } from '../../Utils/helpers'
import axios from 'axios'

const OrdersList = () => {
    let navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [allOrders, setAllOrders] = useState([])
    const [isDeleted, setIsDeleted] = useState(false)
    const [cancellingId, setCancellingId] = useState(null)
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    const listOrders = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config)
            setAllOrders(data.orders)
            setLoading(false)
        } catch (error) {
            setError(error.response.data.message)
        }
    }
    const deleteOrder = async (id) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config)
            setIsDeleted(data.success)
            setLoading(false)
        } catch (error) {
            setError(error.response.data.message)

        }
    }
    useEffect(() => {
        listOrders()
        if (error) {
            errMsg(error)
            setError('')
        }
        if (isDeleted) {
            successMsg('Order deleted successfully');
            navigate('/admin/orders');
        }
    }, [error, isDeleted])
    const cancelOrder = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            setCancellingId(id);

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/admin/order/${id}/cancel`,
                {},
                config
            );

            successMsg(data.message || 'Order cancelled successfully');

            // Refresh orders list
            listOrders();
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to cancel order';
            errMsg(message);
        } finally {
            setCancellingId(null);
        }
    }

    const deleteOrderHandler = (id) => {
        deleteOrder(id)
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'customer',
            headerName: 'Customer',
            width: 160,
        },
        {
            field: 'numofItems',
            headerName: 'Number of Items',

            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const order = allOrders.find(o => o._id === params.id);
                const canCancel = order && !['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus);
                
                return (
                    <div className="flex items-center gap-2">
                        <Link to={`/admin/order/${params.id}`} className="btn btn-primary py-1 px-2">
                            <i className="fa fa-eye"></i>
                        </Link>
                        {canCancel && (
                            <button 
                                className="btn btn-warning py-1 px-2" 
                                onClick={() => cancelOrder(params.id)}
                                disabled={cancellingId === params.id}
                            >
                                {cancellingId === params.id ? (
                                    <i className="fa fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fa fa-times"></i>
                                )}
                            </button>
                        )}
                        <button className="btn btn-danger py-1 px-2" onClick={() => deleteOrderHandler(params.id)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </div>
                );
            }
        }
    ];
    const rows = allOrders.map(order => ({
        id: order._id,
        customer: order.user && order.user.name,
        numofItems: order.orderItems.length,
        amount: `$${order.totalPrice}`,
        status: order.orderStatus,
    }));

    // Calculate order statistics
    const orderStats = {
        total: allOrders.length,
        pending: allOrders.filter(o => o.orderStatus === 'Pending').length,
        processing: allOrders.filter(o => o.orderStatus === 'Processing').length,
        shipped: allOrders.filter(o => o.orderStatus === 'Shipped').length,
        delivered: allOrders.filter(o => o.orderStatus === 'Delivered').length,
        cancelled: allOrders.filter(o => o.orderStatus === 'Cancelled').length,
    };

    return (
        <>
            <MetaData title={'All Orders'} />

            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-1">All Orders</h1>
                                <p className="text-sm text-gray-600 dark:text-ink-muted">
                                    Review and manage every order placed in your store.
                                </p>
                            </div>
                        </div>

                        {/* Order Statistics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-purple-100 mb-1">Total Orders</p>
                                <p className="text-2xl font-bold">{orderStats.total}</p>
                                <Link to="/admin/orders" className="text-xs text-purple-100 hover:underline mt-1 block">View orders</Link>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-yellow-100 mb-1">Pending</p>
                                <p className="text-2xl font-bold">{orderStats.pending}</p>
                                <p className="text-xs text-yellow-100 mt-1">Awaiting processing</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-blue-100 mb-1">Processing</p>
                                <p className="text-2xl font-bold">{orderStats.processing}</p>
                                <p className="text-xs text-blue-100 mt-1">In progress</p>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-indigo-100 mb-1">Shipped</p>
                                <p className="text-2xl font-bold">{orderStats.shipped}</p>
                                <p className="text-xs text-indigo-100 mt-1">On the way</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-green-100 mb-1">Delivered</p>
                                <p className="text-2xl font-bold">{orderStats.delivered}</p>
                                <p className="text-xs text-green-100 mt-1">Completed</p>
                            </div>

                            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-red-100 mb-1">Cancelled</p>
                                <p className="text-2xl font-bold">{orderStats.cancelled}</p>
                                <p className="text-xs text-red-100 mt-1">Cancelled orders</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-500/30 p-4 sm:p-6">
                                <div style={{ height: 520, width: '100%' }}>
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSize={5}
                                        rowsPerPageOptions={[5, 10, 25]}
                                        disableSelectionOnClick
                                        getRowId={(row) => row.id}
                                        sx={{
                                            border: 'none',
                                            '& .MuiDataGrid-main': {
                                                color: 'inherit',
                                            },
                                            '& .MuiDataGrid-virtualScroller': {
                                                backgroundColor: 'transparent',
                                            },
                                            '& .MuiDataGrid-cell': {
                                                borderBottom: '1px solid rgba(147, 51, 234, 0.08)',
                                            },
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: 'rgba(147, 51, 234, 0.06)',
                                                borderBottom: '2px solid rgba(147, 51, 234, 0.18)',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                            },
                                            '& .MuiDataGrid-row:hover': {
                                                backgroundColor: 'rgba(147, 51, 234, 0.03)',
                                            },
                                            '& .MuiDataGrid-footerContainer': {
                                                borderTop: '2px solid rgba(147, 51, 234, 0.18)',
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrdersList