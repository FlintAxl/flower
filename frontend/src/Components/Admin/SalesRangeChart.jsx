import React, { useEffect, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { getToken } from "../../Utils/helpers"
import axios from 'axios'
import Loader from '../Layout/Loader'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

const SalesRangeChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [startMonthIndex, setStartMonthIndex] = useState(0)
    const [endMonthIndex, setEndMonthIndex] = useState(11)

    const fetchSales = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, config)

            const apiData = Array.isArray(data.salesPerMonth) ? data.salesPerMonth : []
            const monthMap = apiData.reduce((acc, item) => {
                if (item && item.month) {
                    acc[item.month] = item.total || 0
                }
                return acc
            }, {})

            const normalized = MONTHS.map((m) => ({
                month: m,
                total: monthMap[m] || 0,
            }))

            setSales(normalized)
        } catch (error) {
            setError(error?.response?.data?.message || 'Failed to load sales for range chart')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSales()
    }, [])

    const handleStartChange = (e) => {
        const value = Number(e.target.value)
        if (value <= endMonthIndex) {
            setStartMonthIndex(value)
        }
    }

    const handleEndChange = (e) => {
        const value = Number(e.target.value)
        if (value >= startMonthIndex) {
            setEndMonthIndex(value)
        }
    }

    const filteredSales = sales.slice(startMonthIndex, endMonthIndex + 1)

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div className="alert alert-danger my-3">{error}</div>
    }

    return (
        <div className="my-4">
            <h4 className="mb-3">Sales by Month Range</h4>

            <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: '1rem' }}>
                <div>
                    <label className="mr-2 font-weight-bold">From:</label>
                    <select value={startMonthIndex} onChange={handleStartChange} className="form-control d-inline-block" style={{ width: '150px' }}>
                        {MONTHS.map((m, idx) => (
                            <option key={m} value={idx}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mr-2 font-weight-bold">To:</label>
                    <select value={endMonthIndex} onChange={handleEndChange} className="form-control d-inline-block" style={{ width: '150px' }}>
                        {MONTHS.map((m, idx) => (
                            <option key={m} value={idx}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={filteredSales} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total Sales']} />
                    <Legend />
                    <Bar dataKey="total" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default SalesRangeChart
