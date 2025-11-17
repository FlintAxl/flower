import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getToken } from '../../Utils/helpers'

import {
    
    Button
} from '@mui/material'


import { DataGrid, GridToolbar } from '@mui/x-data-grid'

const ListOrders = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [myOrdersList, setMyOrdersList] = useState([])
    const [updatingId, setUpdatingId] = useState(null)
    const [cancellingId, setCancellingId] = useState(null)

    const myOrders = async () => {
        try {
            const config = {
                headers: {

                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, config)
            console.log(data)
            setMyOrdersList(data.orders)
            setLoading(false)

        } catch (error) {
            setError(error.response.data.message)
        }
    }
    useEffect(() => {
        myOrders();
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }
    }, [error])

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
                `${import.meta.env.VITE_API}/order/${id}/cancel`,
                {},
                config
            );

            toast.success(data.message || 'Order cancelled successfully', {
                position: 'bottom-right'
            });

            // Refresh orders list
            myOrders();
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to cancel order';
            toast.error(message, {
                position: 'bottom-right'
            });
        } finally {
            setCancellingId(null);
        }
    }

    const markOrderDelivered = async (id) => {
        try {
            setUpdatingId(id);

            // Optimistically update UI
            setMyOrdersList(prev =>
                prev.map(order =>
                    order._id === id ? { ...order, orderStatus: 'Delivered' } : order
                )
            );

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            await axios.put(
                `${import.meta.env.VITE_API}/admin/order/${id}`,
                { status: 'Delivered' },
                config
            );

            toast.success('Order marked as delivered', {
                position: 'bottom-right'
            });
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to update order status';
            toast.error(message, {
                position: 'bottom-right'
            });

            // Revert optimistic update by refetching latest orders
            myOrders();
        } finally {
            setUpdatingId(null);
        }
    }

    const columns = [
        {
            field: 'preview',
            headerName: 'Photo',
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                params.value ? (
                    <img
                        src={params.value}
                        alt="Product"
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                    />
                ) : null
            )
        },
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numOfItems',
            headerName: 'Num of Items',
            type: 'number',
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
            width: 160,
            renderCell: (params) =>
                (params.value && String(params.value).includes('Delivered'))
                    ? <span style={{ color: 'green' }}>{params.value}</span>
                    : <span style={{ color: 'red' }}>{params.value}</span>
        },
        {
            field: 'delivery',
            headerName: 'Delivery',
            width: 170,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const status = params.row.status || '';
                const isShipped = String(status).includes('Shipped');

                if (!isShipped) return null;

                return (
                    <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        disabled={updatingId === params.id}
                        onClick={() => markOrderDelivered(params.id)}
                    >
                        {updatingId === params.id ? 'Marking...' : 'Mark delivered'}
                    </Button>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const order = myOrdersList.find(o => o._id === params.id);
                const canCancel = order && !['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus);
                
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            component={Link}
                            to={`/order/${params.id}`}
                            variant="contained"
                            size="small"
                            sx={{ minWidth: 'auto', px: 1 }}
                        >
                            <i className="fa fa-eye" />
                        </Button>
                        {canCancel && (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                disabled={cancellingId === params.id}
                                onClick={() => cancelOrder(params.id)}
                                sx={{ minWidth: 'auto', px: 2 }}
                                title="Cancel Order"
                            >
                                {cancellingId === params.id ? (
                                    <span className="text-xs">...</span>
                                ) : (
                                    <>
                                        <i className="fa fa-times mr-1" />
                                        <span className="text-xs">Cancel</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    const rows = myOrdersList.map(order => ({
        id: order._id,
        preview: order.orderItems && order.orderItems[0] ? order.orderItems[0].image : '',
        numOfItems: order.orderItems.length,
        amount: `$${order.totalPrice}`,
        status: order.orderStatus || ''
    }));

   

    return (
        <>
            <MetaData title={'My Orders'} />

            <div className="min-h-screen bg-white dark:bg-base-dark px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-1">My Orders</h1>
                        <p className="text-sm text-gray-600 dark:text-ink-muted">
                            Track your recent Botany &amp; Co purchases.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-500/30 p-4 sm:p-6">
                            <div style={{ height: 480, width: '100%' }}>
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
        </>
    )
}

export default ListOrders