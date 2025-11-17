import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { getToken } from '../../Utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductSalesChart from './ProductSalesChart';
import UserSalesChart from './UserSalesChart';
import MonthlySalesChart from './MonthlySalesChart';
import SalesRangeChart from './SalesRangeChart';
import { exportAllCharts } from '../../Utils/exportUtils';

const Dashboard = () => {

    const [products, setProducts] = useState([])
    const [error, setError] = useState('')
    const [users, setUsers] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalAmount, setTotalAmount] = useState(0)

    let outOfStock = 0;
    products.forEach(product => {
        if (product.stock === 0) {
            outOfStock += 1;
        }
    })

    const fetchDashboardData = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const [productsRes, ordersRes, usersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API}/admin/products`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/orders`, config),
                axios.get(`${import.meta.env.VITE_API}/admin/users`, config)
            ])

            const productsData = productsRes.data?.products || []
            const ordersData = ordersRes.data?.orders || []
            const usersData = usersRes.data?.users || []

            setProducts(productsData)
            setOrders(ordersData)
            setUsers(usersData)

            const total = ordersData.reduce((sum, order) => sum + (order?.totalPrice || 0), 0)
            setTotalAmount(total)
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to load dashboard data'
            setError(message)
            toast.error(message, {
                position: 'bottom-right'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
        // allOrders()
        // allUsers()
    }, [])

    return (
        <>
            <MetaData title={'Admin Dashboard'} />

            <div className="min-h-screen bg-white dark:bg-base-dark flex">
                <div className="w-64 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-ink mb-1">Dashboard</h1>
                                <p className="text-gray-600 dark:text-ink-muted">
                                    Overview of your Botany &amp; Co store performance
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        toast.info('Exporting charts...', { position: 'bottom-right' });
                                        await exportAllCharts([
                                            'product-sales-chart',
                                            'user-sales-chart',
                                            'monthly-sales-chart',
                                            'sales-range-chart'
                                        ]);
                                        toast.success('Charts exported successfully!', { position: 'bottom-right' });
                                    } catch (error) {
                                        toast.error('Failed to export charts: ' + error.message, { position: 'bottom-right' });
                                    }
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Charts
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader />
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 rounded-2xl p-5 text-white shadow-lg">
                                        <p className="text-sm text-purple-100 font-medium">Total Products</p>
                                        <p className="mt-2 text-3xl font-bold">{products.length}</p>
                                        <Link
                                            to="/admin/products"
                                            className="mt-3 inline-flex text-sm text-purple-100/90 hover:text-white underline-offset-2 hover:underline"
                                        >
                                            View products
                                        </Link>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-5 text-white shadow-lg">
                                        <p className="text-sm text-green-100 font-medium">Total Orders</p>
                                        <p className="mt-2 text-3xl font-bold">{orders.length}</p>
                                        <Link
                                            to="/admin/orders"
                                            className="mt-3 inline-flex text-sm text-green-100/90 hover:text-white underline-offset-2 hover:underline"
                                        >
                                            View orders
                                        </Link>
                                    </div>

                                    <div className="bg-gradient-to-br from-sky-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
                                        <p className="text-sm text-sky-100 font-medium">Total Customers</p>
                                        <p className="mt-2 text-3xl font-bold">{users.length}</p>
                                        <Link
                                            to="/admin/users"
                                            className="mt-3 inline-flex text-sm text-sky-100/90 hover:text-white underline-offset-2 hover:underline"
                                        >
                                            Manage users
                                        </Link>
                                    </div>

                                    <div className="bg-gradient-to-br from-rose-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg">
                                        <p className="text-sm text-rose-100 font-medium">Out of Stock</p>
                                        <p className="mt-2 text-3xl font-bold">{outOfStock}</p>
                                        <p className="mt-3 text-xs text-rose-100/90">
                                            Keep inventory healthy to avoid missed sales.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                    <div className="lg:col-span-2 bg-white dark:bg-gray-900/60 rounded-2xl p-5 shadow-lg border border-purple-100 dark:border-purple-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-ink">Revenue Overview</h2>
                                            <span className="text-sm text-gray-500 dark:text-ink-muted">
                                                Total revenue: ${totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-sky-950/40 p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-purple-700 dark:text-purple-200 uppercase tracking-wide">
                                                    Lifetime revenue
                                                </p>
                                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-ink">
                                                    ${totalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-4xl">
                                                💰
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-5 shadow-lg border border-purple-100 dark:border-purple-500/30">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-ink mb-3">Quick actions</h2>
                                        <div className="space-y-2 text-sm">
                                            <Link
                                                to="/admin/newproduct"
                                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                                            >
                                                <span>Add new product</span>
                                                <span className="text-lg">＋</span>
                                            </Link>
                                            <Link
                                                to="/admin/orders"
                                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
                                            >
                                                <span>Review recent orders</span>
                                                <span className="text-lg">📦</span>
                                            </Link>
                                            <Link
                                                to="/admin/users"
                                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition"
                                            >
                                                <span>Manage customers</span>
                                                <span className="text-lg">👥</span>
                                            </Link>
                                            <Link
                                                to="/admin/reviews"
                                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
                                            >
                                                <span>Check latest reviews</span>
                                                <span className="text-lg">⭐</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-5 shadow-lg border border-purple-100 dark:border-purple-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-ink">Sales by Product</h2>
                                            <span className="text-xs text-gray-500 dark:text-ink-muted">Top-performing items</span>
                                        </div>
                                        <div id="product-sales-chart" className="h-[260px]">
                                            <ProductSalesChart />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-5 shadow-lg border border-purple-100 dark:border-purple-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-ink">Sales by Customer</h2>
                                            <span className="text-xs text-gray-500 dark:text-ink-muted">Which customers spend the most</span>
                                        </div>
                                        <div id="user-sales-chart" className="h-[260px]">
                                            <UserSalesChart />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-5 shadow-lg border border-purple-100 dark:border-purple-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-ink">Monthly Sales (Current Year)</h2>
                                            <span className="text-xs text-gray-500 dark:text-ink-muted">Seasonality and trends</span>
                                        </div>
                                        <div id="monthly-sales-chart" className="h-[260px]">
                                            <MonthlySalesChart />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-5 shadow-lg border border-purple-100 dark:border-purple-500/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-ink">Sales by Month Range</h2>
                                            <span className="text-xs text-gray-500 dark:text-ink-muted">Compare custom periods</span>
                                        </div>
                                        <div id="sales-range-chart" className="h-[260px]">
                                            <SalesRangeChart />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard