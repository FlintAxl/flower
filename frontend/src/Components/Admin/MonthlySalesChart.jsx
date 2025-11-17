import React, { useState, useEffect } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getToken } from "../../Utils/helpers";
import axios from "axios";
import Loader from '../Layout/Loader';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

export default function MonthlySalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const monthlySales = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, config)

            const apiData = Array.isArray(data.salesPerMonth) ? data.salesPerMonth : []
            const monthMap = apiData.reduce((acc, item) => {
                if (item && item.month) {
                    acc[item.month] = item.total || 0
                }
                return acc
            }, {})

            const normalizedSales = MONTHS.map((m) => ({
                month: m,
                total: monthMap[m] || 0,
            }))

            setSales(normalizedSales)
        } catch (error) {
            setError(error?.response?.data?.message || 'Failed to load monthly sales')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        monthlySales()
    }, [])

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div className="alert alert-danger my-3">{error}</div>
    }

    return (
        <div className="my-4">
            <h4 className="mb-3">Monthly Sales (Current Year)</h4>
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={sales} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total Sales']} />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}