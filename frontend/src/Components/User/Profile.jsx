import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getToken } from '../../utils/helpers'
import { motion } from 'framer-motion'

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState('')

  const getProfile = async () => {
    const config = {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
    try {
      const { data } = await axios.get(`http://localhost:4001/api/v1/me`, config)
      setUser(data.user)
      setLoading(false)
    } catch (error) {
      console.log(error)
      toast.error('Invalid user or password', { position: 'bottom-center' })
    }
  }

  useEffect(() => {
    getProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-base-dark">
        <motion.div
          className="w-20 h-20 border-4 border-purple-400 dark:border-purple-500 border-t-transparent rounded-full animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        ></motion.div>
      </div>
    )
  }

  return (
    <>
      <MetaData title={`${user.name}'s Profile`} />
      <div className="min-h-screen bg-white dark:bg-base-dark text-gray-900 dark:text-ink">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-400/20 via-violet-400/10 to-transparent dark:from-purple-500/10 dark:via-violet-500/5 py-12 border-b border-purple-200 dark:border-purple-500/20">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              className="flex flex-col md:flex-row items-center md:items-start gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Profile Picture - Instagram Style */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-violet-500 to-indigo-500 dark:from-purple-400 dark:via-violet-400 dark:to-indigo-400">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-base-dark">
                    <img
                      src={user.avatar ? user.avatar.url : '/default_avatar.png'}
                      alt={user.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Profile Info - Instagram Style */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-light text-gray-900 dark:text-ink">
                    {user.name}
                  </h1>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Link
                      to="/me/update"
                      className="px-4 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-gray-900 dark:text-ink text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition border border-purple-200 dark:border-purple-500/20"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>

                {/* Stats - Instagram Style */}
                <div className="flex gap-8 justify-center md:justify-start mb-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-ink">0</span>{' '}
                    <span className="text-gray-600 dark:text-ink-muted">posts</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-ink">0</span>{' '}
                    <span className="text-gray-600 dark:text-ink-muted">followers</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-ink">0</span>{' '}
                    <span className="text-gray-600 dark:text-ink-muted">following</span>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="text-sm text-gray-900 dark:text-ink">
                  <p className="font-medium mb-1">{user.email}</p>
                  <p className="text-gray-600 dark:text-ink-muted">
                    🌸 Flower enthusiast • Member since {String(user.createdAt).substring(0, 10)}
                  </p>
                  {user.role === 'admin' && (
                    <p className="mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white dark:text-base-dark text-xs font-medium">
                      ✨ Admin
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Grid - Instagram Style */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link
                to="/orders/me"
                className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/15 border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40 transition shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-base-dark flex items-center justify-center text-2xl border border-purple-200 dark:border-purple-500/20">
                    🛍️
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-ink">My Orders</h3>
                    <p className="text-sm text-gray-600 dark:text-ink-muted">View order history</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/me/update"
                className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/15 border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40 transition shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-base-dark flex items-center justify-center text-2xl border border-purple-200 dark:border-purple-500/20">
                    ✏️
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-ink">Edit Profile</h3>
                    <p className="text-sm text-gray-600 dark:text-ink-muted">Update your info</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/password/update"
                className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/15 border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/40 transition shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-base-dark flex items-center justify-center text-2xl border border-purple-200 dark:border-purple-500/20">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-ink">Security</h3>
                    <p className="text-sm text-gray-600 dark:text-ink-muted">Change password</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Account Details Card */}
            <div className="rounded-xl p-6 bg-purple-50 dark:bg-base-soft border border-purple-200 dark:border-purple-500/20 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-ink mb-4 flex items-center gap-2">
                <span>📋</span> Account Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-purple-200 dark:border-purple-500/20">
                  <span className="text-gray-600 dark:text-ink-muted">Full Name</span>
                  <span className="font-medium text-gray-900 dark:text-ink">{user.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-purple-200 dark:border-purple-500/20">
                  <span className="text-gray-600 dark:text-ink-muted">Email</span>
                  <span className="font-medium text-gray-900 dark:text-ink">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-purple-200 dark:border-purple-500/20">
                  <span className="text-gray-600 dark:text-ink-muted">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-ink">
                    {String(user.createdAt).substring(0, 10)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 dark:text-ink-muted">Account Type</span>
                  <span className="font-medium text-gray-900 dark:text-ink capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            {/* Empty State for Orders */}
            <div className="mt-8 text-center py-16">
              <div className="text-6xl mb-4">🌸</div>
              <p className="text-gray-600 dark:text-ink-muted mb-6">
                Start shopping for beautiful flowers!
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 text-white dark:text-base-dark font-medium hover:opacity-90 transition shadow-md"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Profile
