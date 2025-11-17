import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getToken } from '../../Utils/helpers'

const OrderDetails = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [order, setOrder] = useState({})
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [reviewProduct, setReviewProduct] = useState(null)
    const [reviewRating, setReviewRating] = useState(0)
    const [reviewComment, setReviewComment] = useState('')
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [checkingEligibility, setCheckingEligibility] = useState(false)
    const [canReview, setCanReview] = useState(false)
    const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState('')
    const [cancelling, setCancelling] = useState(false)

    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus } = order
    let { id } = useParams();

    const getOrderDetails = async (id) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
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

    const checkReviewEligibility = async (productId) => {
        try {
            setCheckingEligibility(true)
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(
                `${import.meta.env.VITE_API}/review/eligibility?productId=${productId}`,
                config
            )

            setCanReview(data.canReview)
            setReviewEligibilityMessage(data.message || '')
        } catch (err) {
            setCanReview(false)
            setReviewEligibilityMessage(
                err?.response?.data?.message || 'Unable to check review eligibility'
            )
        } finally {
            setCheckingEligibility(false)
        }
    }

    const openReviewModalForItem = (item) => {
        setReviewProduct(item)
        setReviewRating(0)
        setReviewComment('')
        setCanReview(false)
        setReviewEligibilityMessage('')
        setReviewModalOpen(true)
        if (item && item.product) {
            checkReviewEligibility(item.product)
        }
    }

    const closeReviewModal = () => {
        setReviewModalOpen(false)
        setReviewProduct(null)
        setReviewRating(0)
        setReviewComment('')
        setCanReview(false)
        setReviewEligibilityMessage('')
    }

    const handleReviewStarClick = (starValue) => {
        setReviewRating(starValue)
    }

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
                `${import.meta.env.VITE_API}/order/${id}/cancel`,
                {},
                config
            );

            toast.success(data.message || 'Order cancelled successfully', {
                position: 'bottom-right'
            });

            // Refresh order details
            getOrderDetails(id);
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to cancel order';
            toast.error(message, {
                position: 'bottom-right'
            });
        } finally {
            setCancelling(false);
        }
    }

    const submitReview = async () => {
        if (!reviewProduct || !reviewProduct.product) return

        if (reviewRating === 0) {
            toast.error('Please select a rating', {
                position: 'bottom-right'
            })
            return
        }

        if (!reviewComment.trim()) {
            toast.error('Please write a review comment', {
                position: 'bottom-right'
            })
            return
        }

        try {
            setReviewSubmitting(true)
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const body = {
                rating: reviewRating,
                comment: reviewComment,
                productId: reviewProduct.product
            }

            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/review`,
                body,
                config
            )

            toast.success(data?.message || 'Review submitted successfully', {
                position: 'bottom-right'
            })

            closeReviewModal()
        } catch (err) {
            const message = err?.response?.data?.message || 'Error submitting review'
            toast.error(message, {
                position: 'bottom-right'
            })
        } finally {
            setReviewSubmitting(false)
        }
    }

    useEffect(() => {
        getOrderDetails(id)

        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }
    }, [error, id])

    const shippingDetails = shippingInfo && `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`

    const isPaid = paymentInfo && paymentInfo.status === 'succeeded' ? true : false

    return (
        <>
            <MetaData title={'Order Details'} />

            {loading ? <Loader /> : (
                <div className="min-h-screen bg-white dark:bg-base-dark px-4 py-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-ink">Order Details</h1>
                                <p className="text-sm text-gray-600 dark:text-ink-muted">Order # {order._id}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-ink-muted">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        order.orderStatus && String(order.orderStatus).includes('Delivered') 
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                                            : order.orderStatus && String(order.orderStatus).includes('Cancelled')
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                    }`}>
                                        {orderStatus}
                                    </span>
                                </div>
                                {order.orderStatus && !['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus) && (
                                    <button
                                        onClick={cancelOrder}
                                        disabled={cancelling}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        {cancelling ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Cancelling...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-times" />
                                                <span>Cancel Order</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Cancel Order Alert - Only for Pending orders */}
                        {order.orderStatus && !['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus) && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                        <i className="fa fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-red-900 dark:text-red-200">Order is Pending</p>
                                        <p className="text-sm text-red-700 dark:text-red-300">You can cancel this order before it starts processing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={cancelOrder}
                                    disabled={cancelling}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                                >
                                    {cancelling ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Cancelling...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-times" />
                                            <span>Cancel Order</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-md border border-purple-100 dark:border-purple-500/30 p-5">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-ink mb-3">Shipping Info</h4>
                                <div className="space-y-1 text-sm text-gray-700 dark:text-ink">
                                    <p><span className="font-medium">Name:</span> {user && user.name}</p>
                                    <p><span className="font-medium">Phone:</span> {shippingInfo && shippingInfo.phoneNo}</p>
                                    <p><span className="font-medium">Address:</span> {shippingDetails}</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-md border border-purple-100 dark:border-purple-500/30 p-5 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-ink mb-3">Payment</h4>
                                    <p className={`text-sm font-semibold ${isPaid ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}`}>
                                        {isPaid ? 'PAID' : 'NOT PAID'}
                                    </p>
                                    {order.paymentMethod && (
                                        <p className="text-xs text-gray-600 dark:text-ink-muted mt-1">
                                            Method: <span className="font-medium capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-gray-500 dark:text-ink-muted mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-ink">${totalPrice}</p>
                                </div>
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
                                            {orderStatus && String(orderStatus).includes('Delivered') && (
                                                <div className="mt-3">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition"
                                                        onClick={() => openReviewModalForItem(item)}
                                                    >
                                                        Review this product
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {reviewModalOpen && reviewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Review {reviewProduct.name}
                            </h5>
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                                onClick={closeReviewModal}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {checkingEligibility ? (
                                <div className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center gap-2 text-sm">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Checking review eligibility...
                                </div>
                            ) : canReview ? (
                                <>
                                    <div className="flex justify-center mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`text-3xl mx-1 cursor-pointer transition-colors ${
                                                    star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                                                } hover:text-yellow-300`}
                                                onClick={() => handleReviewStarClick(star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        name="review"
                                        id="review"
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="4"
                                        placeholder="Write your review here..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-200"
                                            onClick={closeReviewModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 font-semibold disabled:opacity-60"
                                            onClick={submitReview}
                                            disabled={reviewSubmitting}
                                        >
                                            {reviewSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full py-3 px-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-200 dark:border-orange-800 text-sm">
                                    {reviewEligibilityMessage || 'You can only review products you have purchased and received.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default OrderDetails