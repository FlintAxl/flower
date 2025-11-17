import React, { useState, useEffect } from 'react'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import Swal from 'sweetalert2'
import { getToken, errMsg } from '../../Utils/helpers'
import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'

const ProductReviews = () => {
    const [listReviews, setListReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [isDeleted, setIsDeleted] = useState(false)

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    }

    const fetchAllReviews = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config)

            const flattened = []

            data.products?.forEach(product => {
                (product.reviews || []).forEach(review => {
                    flattened.push({
                        id: review._id,
                        comment: review.comment,
                        rating: review.rating,
                        reviewer: review.name || review.user,
                        product: product.name,
                        productId: product._id,
                        productRating: product.ratings || 0,
                    })
                })
            })

            setListReviews(flattened)
        } catch (error) {
            setListReviews([])
            setError(error.response?.data?.message || 'Failed to load reviews')
        } finally {
            setLoading(false)
        }
    }

    const deleteReview = async (reviewId, productId) => {
        try {
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/reviews?reviewId=${reviewId}&productId=${productId}`, config)

            if (data.success) {
                setListReviews(prev => prev.filter(review => !(review.id === reviewId && review.productId === productId)))
                setIsDeleted(true)
            }
        } catch (error) {
            setDeleteError(error.response?.data?.message || 'Failed to delete review');
        }
    }

    const deleteReviewHandler = (row) => {
        Swal.fire({
            title: 'Delete Review',
            icon: 'info',
            text: 'Do you want to delete this review',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteReview(row.id, row.productId)
            }
        })
    }

    useEffect(() => {
        fetchAllReviews()
    }, [])

    useEffect(() => {
        if (error) {
            errMsg(error)
            setError('')
        }
    }, [error])

    useEffect(() => {
        if (deleteError) {
            errMsg(deleteError)
            setDeleteError('')
        }
    }, [deleteError])

    useEffect(() => {
        if (isDeleted) {
            errMsg('Review deleted successfully')
            setIsDeleted(false)
        }
    }, [isDeleted])

    const columns = [
        {
            field: 'id',
            headerName: 'Review ID',
            flex: 1.2,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'product',
            headerName: 'Product',
            flex: 1.2,
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 110,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'comment',
            headerName: 'Comment',
            flex: 1.5,
        },
        {
            field: 'reviewer',
            headerName: 'Reviewer',
            width: 160,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <button
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => deleteReviewHandler(params.row)}
                >
                    <i className="fa fa-trash" />
                </button>
            )
        }
    ];

    const rows = listReviews;

    // Calculate review statistics
    const reviewStats = {
        total: listReviews.length,
        fiveStar: listReviews.filter(r => r.rating === 5).length,
        fourStar: listReviews.filter(r => r.rating === 4).length,
        threeStar: listReviews.filter(r => r.rating === 3).length,
        twoStar: listReviews.filter(r => r.rating === 2).length,
        oneStar: listReviews.filter(r => r.rating === 1).length,
        highRated: listReviews.filter(r => r.rating >= 4).length,
        lowRated: listReviews.filter(r => r.rating <= 2).length,
    };

    // Get products with 5 star reviews
    const productsWithFiveStars = [...new Set(
        listReviews
            .filter(r => r.rating === 5)
            .map(r => r.product)
    )];

    // Get products with low star reviews (1-2 stars)
    const productsWithLowStars = [...new Set(
        listReviews
            .filter(r => r.rating <= 2)
            .map(r => r.product)
    )];

    return (
        <>
            <MetaData title={'Product Reviews'} />

            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-1">All Product Reviews</h1>
                                <p className="text-sm text-gray-600 dark:text-ink-muted">
                                    View and manage every review across your store. Each row shows the product and who reviewed it.
                                </p>
                            </div>
                        </div>

                        {/* Review Statistics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-purple-100 mb-1">Total Reviews</p>
                                <p className="text-2xl font-bold">{reviewStats.total}</p>
                                <p className="text-xs text-purple-100 mt-1">All reviews</p>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-yellow-100 mb-1">5 Stars</p>
                                <p className="text-2xl font-bold">{reviewStats.fiveStar}</p>
                                <p className="text-xs text-yellow-100 mt-1">Excellent</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-blue-100 mb-1">4 Stars</p>
                                <p className="text-2xl font-bold">{reviewStats.fourStar}</p>
                                <p className="text-xs text-blue-100 mt-1">Very Good</p>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-indigo-100 mb-1">3 Stars</p>
                                <p className="text-2xl font-bold">{reviewStats.threeStar}</p>
                                <p className="text-xs text-indigo-100 mt-1">Average</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-orange-100 mb-1">2 Stars</p>
                                <p className="text-2xl font-bold">{reviewStats.twoStar}</p>
                                <p className="text-xs text-orange-100 mt-1">Poor</p>
                            </div>

                            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-red-100 mb-1">1 Star</p>
                                <p className="text-2xl font-bold">{reviewStats.oneStar}</p>
                                <p className="text-xs text-red-100 mt-1">Very Poor</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-green-100 mb-1">High Rated</p>
                                <p className="text-2xl font-bold">{reviewStats.highRated}</p>
                                <p className="text-xs text-green-100 mt-1">4+ stars</p>
                            </div>

                            <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-4 text-white shadow-lg">
                                <p className="text-sm font-medium text-red-100 mb-1">Low Rated</p>
                                <p className="text-2xl font-bold">{reviewStats.lowRated}</p>
                                <p className="text-xs text-red-100 mt-1">1-2 stars</p>
                            </div>
                        </div>

                        {/* Products with 5 Stars and Low Stars */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-500/30 rounded-xl p-5">
                                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    Products with 5 Star Reviews
                                </h3>
                                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">{productsWithFiveStars.length}</p>
                                {productsWithFiveStars.length > 0 ? (
                                    <div className="mt-3 space-y-1">
                                        {productsWithFiveStars.slice(0, 3).map((product, idx) => (
                                            <p key={idx} className="text-sm text-yellow-800 dark:text-yellow-200">• {product}</p>
                                        ))}
                                        {productsWithFiveStars.length > 3 && (
                                            <p className="text-xs text-yellow-600 dark:text-yellow-400">+{productsWithFiveStars.length - 3} more</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">No products with 5 star reviews yet</p>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-300 dark:border-red-500/30 rounded-xl p-5">
                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">⚠️</span>
                                    Products with Low Reviews
                                </h3>
                                <p className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">{productsWithLowStars.length}</p>
                                {productsWithLowStars.length > 0 ? (
                                    <div className="mt-3 space-y-1">
                                        {productsWithLowStars.slice(0, 3).map((product, idx) => (
                                            <p key={idx} className="text-sm text-red-800 dark:text-red-200">• {product}</p>
                                        ))}
                                        {productsWithLowStars.length > 3 && (
                                            <p className="text-xs text-red-600 dark:text-red-400">+{productsWithLowStars.length - 3} more</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-700 dark:text-red-300">No products with low reviews</p>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader />
                            </div>
                        ) : listReviews && listReviews.length > 0 ? (
                            <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-500/30 p-4 sm:p-6">
                                <div className="mb-3 text-xs text-gray-600 dark:text-ink-muted">
                                    Showing {rows.length} review(s) in total.
                                </div>
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
                        ) : (
                            <p className="mt-5 text-center text-sm text-gray-600 dark:text-ink-muted">
                                No reviews found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductReviews