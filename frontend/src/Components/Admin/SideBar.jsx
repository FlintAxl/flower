import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const toggleProducts = () => {
        setIsProductsOpen(!isProductsOpen);
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`h-screen bg-white dark:bg-base-dark ${isCollapsed ? 'w-20' : 'w-64'} border-r border-purple-200 dark:border-purple-500/20 transition-all duration-300 flex flex-col`}>
            {/* Header with Logo and Toggle */}
            <div className="p-4 border-b border-purple-200 dark:border-purple-500/20 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 dark:from-purple-400 dark:via-violet-400 dark:to-indigo-400 flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-ink">Botany & Co</h2>
                            <p className="text-xs text-purple-600 dark:text-purple-400">Admin Panel</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
                    title={isCollapsed ? 'Expand' : 'Collapse'}
                >
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {/* Dashboard */}
                <Link
                    to="/dashboard"
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        isActive('dashboard')
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white shadow-md'
                            : 'text-gray-700 dark:text-ink hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                    title={isCollapsed ? 'Dashboard' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {!isCollapsed && <span className="font-medium text-sm">Dashboard</span>}
                </Link>

                {/* Products Dropdown */}
                {!isCollapsed ? (
                    <div>
                        <button
                            onClick={toggleProducts}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 dark:text-ink hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span className="font-medium text-sm">Products</span>
                            </div>
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${isProductsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <Link
                                to="/admin/products"
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    isActive('/admin/products')
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                                        : 'text-gray-600 dark:text-ink-muted hover:bg-purple-50 dark:hover:bg-purple-900/10'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>All Products</span>
                            </Link>

                            <Link
                                to="/admin/newproduct"
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                    isActive('/admin/newproduct')
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                                        : 'text-gray-600 dark:text-ink-muted hover:bg-purple-50 dark:hover:bg-purple-900/10'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create Product</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Link
                        to="/admin/products"
                        className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive('/admin/products') || isActive('/admin/newproduct')
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white shadow-md'
                                : 'text-gray-700 dark:text-ink hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}
                        title="Products"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </Link>
                )}

                {/* Orders */}
                <Link
                    to="/admin/orders"
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive('/admin/orders')
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white shadow-md'
                            : 'text-gray-700 dark:text-ink hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                    title={isCollapsed ? 'Orders' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {!isCollapsed && <span className="font-medium text-sm">Orders</span>}
                </Link>

                {/* Users */}
                <Link
                    to="/admin/users"
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive('/admin/users')
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white shadow-md'
                            : 'text-gray-700 dark:text-ink hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                    title={isCollapsed ? 'Users' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {!isCollapsed && <span className="font-medium text-sm">Users</span>}
                </Link>

                {/* Reviews */}
                <Link
                    to="/admin/reviews"
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive('/admin/reviews')
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white shadow-md'
                            : 'text-gray-700 dark:text-ink hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                    title={isCollapsed ? 'Reviews' : ''}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {!isCollapsed && <span className="font-medium text-sm">Reviews</span>}
                </Link>
            </nav>

            {/* Footer with gradient accent */}
            <div className="p-3 border-t border-purple-200 dark:border-purple-500/20">
                <div className="h-1 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500"></div>
            </div>
        </div>
    )
}

export default Sidebar