import React, {  useState, useEffect } from 'react'
import { Link, useParams, useNavigate,  } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import { getToken } from '../../Utils/helpers'

const ProcessOrder = () => {

    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState('')
    const [order, setOrder] = useState({})
    const [isUpdated, setIsUpdated] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    let navigate = useNavigate()

    let { id } = useParams();
    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus } = order
    const orderId = id;
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-center'
    });

    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });

    const getOrderDetails = async (id) => {
        try {
            const config = {
                headers: {
                   
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${id}`, config)
            setOrder(data.order)
            setLoading(false)
        } catch (error) {
            setError(error.response.data.message)
        }
    }
    const updateOrder = async (id, formData) => {
        setUpdating(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/order/${id}`, formData, config)
            setIsUpdated(data)
            setUpdating(false);

        } catch (error) {
            setError(error.response.data.message)
            setUpdating(false);
        }
    }

    useEffect(() => {
        getOrderDetails(orderId)
        if (error) {
            errMsg(error);
            setError('')
        }
        if (isUpdated && isUpdated.success) {
            // Show detailed success message including email notification status
            const message = isUpdated.message || 'Order updated successfully';
            successMsg(message);
            setIsUpdated(false)
            navigate('/admin/orders')
        }
    }, [error, isUpdated, orderId])

    const cancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            setCancelling(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/admin/order/${order._id}/cancel`,
                {},
                config
            );

            successMsg(data.message || 'Order cancelled successfully');
            
            // Refresh order details
            getOrderDetails(order._id);
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to cancel order';
            errMsg(message);
        } finally {
            setCancelling(false);
        }
    }

    const updateOrderHandler = (id) => {
        const formData = new FormData();
        formData.set('status', status);
        updateOrder(id, formData)
    }

    const shippingDetails = shippingInfo && `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`
    const isPaid = paymentInfo && paymentInfo.status === 'succeeded' ? true : false
    return (
        <>
            <MetaData title={`Process Order # ${order && order._id}`} />

            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-ink">Process Order</h1>
                                        <p className="text-sm text-gray-600 dark:text-ink-muted">Order # {order._id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-ink-muted">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            order.orderStatus && String(order.orderStatus).includes('Delivered') 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                                                : order.orderStatus && String(order.orderStatus).includes('Cancelled')
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                                                : order.orderStatus && String(order.orderStatus).includes('Shipped')
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                                : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                                        }`}>
                                            {orderStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-md border border-purple-100 dark:border-purple-500/30 p-5">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-ink mb-3">Shipping Info</h4>
                                            <div className="space-y-1 text-sm text-gray-700 dark:text-ink">
                                                <p><span className="font-medium">Name:</span> {user && user.name}</p>
                                                <p><span className="font-medium">Phone:</span> {shippingInfo && shippingInfo.phoneNo}</p>
                                                <p><span className="font-medium">Address:</span> {shippingDetails}</p>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-xs font-medium text-gray-500 dark:text-ink-muted mb-1">Total Amount</p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-ink">${totalPrice}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-md border border-purple-100 dark:border-purple-500/30 p-5">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-ink mb-3">Payment</h4>
                                            <p className={`text-sm font-semibold ${isPaid ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}`}>
                                                {isPaid ? 'PAID' : 'NOT PAID'}
                                            </p>
                                            {order.paymentMethod && (
                                                <p className="text-xs text-gray-600 dark:text-ink-muted mt-1">
                                                    Method: <span className="font-medium capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</span>
                                                </p>
                                            )}
                                            <div className="mt-3">
                                                <p className="text-xs font-medium text-gray-500 dark:text-ink-muted mb-1">
                                                    {order.paymentMethod === 'cod' ? 'Payment ID' : 'Stripe ID'}
                                                </p>
                                                <p className="text-xs text-gray-700 dark:text-ink break-all">{paymentInfo && paymentInfo.id}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-md border border-purple-100 dark:border-purple-500/30 p-5">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-ink mb-4">Order Items</h4>
                                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                                {orderItems && orderItems.map(item => (
                                                    <div key={item.product} className="flex flex-col sm:flex-row items-start sm:items-center py-4 gap-4">
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <Link to={`/products/${item.product}`} className="text-sm font-medium text-purple-700 dark:text-purple-300 hover:underline">
                                                                {item.name}
                                                            </Link>
                                                            <div className="mt-1 text-xs text-gray-500 dark:text-ink-muted">
                                                                <span>${item.price}</span>
                                                                <span className="mx-1">•</span>
                                                                <span>{item.quantity} piece(s)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:mt-0 mt-2">
                                        <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-md border border-purple-100 dark:border-purple-500/30 p-5 space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-ink mb-3">Update Status</h4>
                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-ink-muted mb-1">Next status</label>
                                                <select
                                                    className="w-full rounded-lg border border-gray-300 dark:border-purple-500/40 bg-white dark:bg-gray-900/80 px-3 py-2 text-sm text-gray-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    name='status'
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    disabled={order.orderStatus === 'Cancelled'}
                                                >
                                                    <option value="">Select status</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            </div>
                                            <button
                                                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-md hover:opacity-90 transition disabled:opacity-60"
                                                onClick={() => updateOrderHandler(order._id)}
                                                disabled={updating || !status || order.orderStatus === 'Cancelled'}
                                            >
                                                {updating ? (
                                                    <>
                                                        <span className="mr-2 inline-block h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                                                        {status === 'Processing' || status === 'Shipped' || status === 'Delivered' ?
                                                            `Updating to ${status} & Sending Email with PDF...` :
                                                            `Updating to ${status}...`
                                                        }
                                                    </>
                                                ) : (
                                                    'Update Status'
                                                )}
                                            </button>
                                            
                                            {order.orderStatus && !['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus) && (
                                                <button
                                                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition disabled:opacity-60"
                                                    onClick={cancelOrder}
                                                    disabled={cancelling}
                                                >
                                                    {cancelling ? (
                                                        <>
                                                            <span className="mr-2 inline-block h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                                                            Cancelling...
                                                        </>
                                                    ) : (
                                                        'Cancel Order'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
export default ProcessOrder