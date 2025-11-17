import React, { useState } from 'react'
import { getUser, getToken } from '../../Utils/helpers'
import axios from 'axios'
import { toast } from 'react-toastify'

const ListReviews = ({ reviews, productId, onReviewUpdate }) => {
    const [editingReview, setEditingReview] = useState(null)
    const [editRating, setEditRating] = useState(0)
    const [editComment, setEditComment] = useState('')
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(null)
    
    const user = getUser()
    const isAdmin = user && user.role === 'admin'

    const handleEditClick = (review) => {
        setEditingReview(review._id)
        setEditRating(review.rating)
        setEditComment(review.comment)
    }

    const handleCancelEdit = () => {
        setEditingReview(null)
        setEditRating(0)
        setEditComment('')
    }

    const handleUpdateReview = async () => {
        if (editRating === 0) {
            toast.error('Please select a rating')
            return
        }
        if (!editComment.trim()) {
            toast.error('Please write a comment')
            return
        }

        try {
            setUpdating(true)
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.patch(
                `${import.meta.env.VITE_API}/review/update`,
                {
                    rating: editRating,
                    comment: editComment,
                    productId: productId
                },
                config
            )

            if (data.success) {
                toast.success('Review updated successfully')
                setEditingReview(null)
                onReviewUpdate() // Refresh reviews
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating review')
        } finally {
            setUpdating(false)
        }
    }

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return
        }

        try {
            setDeleting(reviewId)
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.delete(
                `${import.meta.env.VITE_API}/reviews?productId=${productId}&reviewId=${reviewId}`,
                config
            )

            if (data.success) {
                toast.success('Review deleted successfully')
                onReviewUpdate() // Refresh reviews
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting review')
        } finally {
            setDeleting(null)
        }
    }

    const renderStars = (rating, isEditable = false, onRatingChange = null) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`text-2xl transition-colors ${
                            isEditable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                        } ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                        onClick={() => isEditable && onRatingChange && onRatingChange(star)}
                        disabled={!isEditable}
                    >
                        ★
                    </button>
                ))}
            </div>
        )
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Reviews Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                    Be the first to share your experience with this product!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Customer Reviews ({reviews.length})
                </h3>
            </div>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        {editingReview === review._id ? (
                            // Edit Mode
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rating
                                    </label>
                                    {renderStars(editRating, true, setEditRating)}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Comment
                                    </label>
                                    <textarea
                                        value={editComment}
                                        onChange={(e) => setEditComment(e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Update your review..."
                                    />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleUpdateReview}
                                        disabled={updating}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {updating ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Review'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                                    {review.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {review.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(review.createdAt)}
                                                    {review.updatedAt && (
                                                        <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                                                            (edited)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-3">
                                            {renderStars(review.rating)}
                                        </div>
                                        
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-4">
                                        {user && user._id === review.user && (
                                            <button
                                                onClick={() => handleEditClick(review)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Edit Review"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        )}
                                        
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteReview(review._id)}
                                                disabled={deleting === review._id}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Review (Admin)"
                                            >
                                                {deleting === review._id ? (
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ListReviews