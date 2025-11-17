import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { getToken } from '../../Utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
import { exportProductsToPDF } from '../../Utils/exportUtils'

const ProductsList = () => {
    const [products, setProducts] = useState([])
    const [error, setError] = useState('')

    const [loading, setLoading] = useState(true)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [bulkDeleting, setBulkDeleting] = useState(false)

    let navigate = useNavigate()
    const getAdminProducts = async () => {
        try {

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config)
            console.log(data)
            setProducts(data.products)
            setLoading(false)
        } catch (error) {

            setError(error.response.data.message)

        }
    }
    useEffect(() => {
        getAdminProducts()

        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }

    }, [error])

    const bulkDeleteProducts = async (productIds) => {
        try {
            setBulkDeleting(true)
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
            
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/products/bulk`, {
                ...config,
                data: { productIds }
            })

            if (data.success) {
                toast.success(`${productIds.length} products deleted successfully`, {
                    position: 'bottom-right'
                })
                setSelectedProducts([])
                getAdminProducts() // Refresh the products list
            }
            setBulkDeleting(false)
        } catch (error) {
            setBulkDeleting(false)
            toast.error(error.response?.data?.message || 'Failed to delete products', {
                position: 'bottom-right'
            })
        }
    }



    


    const handleBulkDelete = () => {
        if (selectedProducts.length === 0) {
            toast.warning('Please select products to delete', {
                position: 'bottom-right'
            })
            return
        }

        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`)) {
            bulkDeleteProducts(selectedProducts)
        }
    }

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedProducts(products.map(product => product._id))
        } else {
            setSelectedProducts([])
        }
    }

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId)
            } else {
                return [...prev, productId]
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
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
            ),
            renderCell: (params) => (
                <input
                    type="checkbox"
                    checked={selectedProducts.includes(params.id)}
                    onChange={() => handleSelectProduct(params.id)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
            )
        },
        {
            field: 'image',
            headerName: '🖼️ Image',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <div className="flex items-center justify-center h-full">
                    <img 
                        src={params.value} 
                        alt="Product" 
                        className="w-14 h-14 object-cover rounded-lg border-2 border-purple-200 dark:border-purple-500/20 shadow-sm"
                    />
                </div>
            )
        },
        {
            field: 'name',
            headerName: '🌸 Product Name',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{params.value}</span>
            )
        },
        {
            field: 'category',
            headerName: '📦 Category',
            width: 150,
            renderCell: (params) => (
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                    {params.value}
                </span>
            )
        },
        {
            field: 'price',
            headerName: '💰 Price',
            width: 120,
            renderCell: (params) => (
                <span className="font-semibold text-green-600 dark:text-green-400">${params.value}</span>
            )
        },
        {
            field: 'stock',
            headerName: '📊 Stock',
            width: 100,
            renderCell: (params) => (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    params.value > 10 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : params.value > 0 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: '⚙️ Actions',
            width: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="flex items-center justify-center">
                    <Link 
                        to={`/admin/product/${params.id}`} 
                        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Edit Product"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                </div>
            )
        }
    ];

    const rows = products.map(product => ({
        id: product._id,
        image: product.images && product.images[0] ? product.images[0].url : '/images/default-product.png',
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
    }));

    return (
        <>
            <MetaData title={'All Products'} />
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
                                        🌺 All Products
                                    </h1>
                                    <p className="text-gray-600 dark:text-ink-muted">
                                        Manage your flower shop inventory
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                toast.info('Exporting products to PDF...', {
                                                    position: 'bottom-right'
                                                });
                                                await exportProductsToPDF(products);
                                                toast.success('Products exported successfully!', {
                                                    position: 'bottom-right'
                                                });
                                            } catch (error) {
                                                toast.error('Failed to export products: ' + error.message, {
                                                    position: 'bottom-right'
                                                });
                                            }
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export Products
                                    </button>
                                    <Link
                                        to="/admin/newproduct"
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New Product
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Bulk Actions */}
                            {selectedProducts.length > 0 && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-purple-700 dark:text-purple-300 font-medium">
                                            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedProducts([])}
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

                        {/* Products Table */}
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
                                            '@media (prefers-color-scheme: dark)': {
                                                '& .MuiDataGrid-columnHeaders': {
                                                    backgroundColor: 'rgba(147, 51, 234, 0.3)',
                                                    borderBottom: '2px solid rgba(147, 51, 234, 0.4)',
                                                },
                                                '& .MuiDataGrid-cell': {
                                                    borderColor: 'rgba(147, 51, 234, 0.2)',
                                                },
                                                '& .MuiDataGrid-row': {
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                                    },
                                                },
                                            },
                                            '& .MuiDataGrid-row': {
                                                backgroundColor: 'inherit',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(147, 51, 234, 0.05)',
                                                },
                                            },
                                            '& .MuiDataGrid-root': {
                                                backgroundColor: 'inherit',
                                                borderColor: 'rgba(147, 51, 234, 0.2)',
                                            },
                                            '& .MuiDataGrid-cell': {
                                                borderColor: 'rgba(147, 51, 234, 0.1)',
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
                                            '& .MuiDataGrid-selectedRowCount': {
                                                color: 'inherit',
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Total Products</p>
                                        <p className="text-3xl font-bold mt-1">{products.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">📦</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">In Stock</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {products.filter(p => p.stock > 0).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {products.filter(p => p.stock === 0).length}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <span className="text-2xl">⚠️</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductsList