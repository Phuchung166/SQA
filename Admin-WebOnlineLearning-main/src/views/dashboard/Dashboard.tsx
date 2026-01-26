import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { AdaptableCard, Container } from '@/components/shared'
import {
    HiOutlineUserGroup,
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineShoppingCart,
    HiOutlineClock,
    HiOutlineStar,
    HiOutlineChartBar,
} from 'react-icons/hi'
import Chart from '@/components/shared/Chart'
import {
    apiGetDashboardStats,
    apiGetRevenueStats,
} from '@/services/AnalyticsService'
import { ApiResponse } from '@/@types/user'

interface DashboardStats {
    total_users: number
    total_instructors: number
    total_courses: number
    total_orders: number
    total_revenue: number
    system_income: number
    total_success_orders: number
    active_courses: number
}

interface RevenueData {
    monthly_revenue?: Array<{ revenue: number }>
    growth_rate?: number
}

interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    color: string
    badge?: {
        label: string
        value: number
        color: string
    }
}

const StatCard = ({ icon, label, value, color, badge }: StatCardProps) => (
    <AdaptableCard className="relative">
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-2xl ${color}`}>{icon}</span>
                    <h6 className="text-gray-600 dark:text-gray-400">
                        {label}
                    </h6>
                </div>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
            {badge && (
                <div className={`text-right`}>
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
                    >
                        {badge.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        {badge.value}
                    </div>
                </div>
            )}
        </div>
    </AdaptableCard>
)

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [statsResponse] = await Promise.all([apiGetDashboardStats()])

            const statsData = statsResponse.data as DashboardStats
            setStats(statsData)
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    const chartData = {
        series: [
            {
                name: 'Doanh thu',
                data:
                    revenueData?.monthly_revenue?.map((item) => item.revenue) ||
                    [],
            },
        ],
        options: {
            chart: {
                type: 'area' as const,
                toolbar: { show: false },
            },
            xaxis: {
                categories: [
                    'T1',
                    'T2',
                    'T3',
                    'T4',
                    'T5',
                    'T6',
                    'T7',
                    'T8',
                    'T9',
                    'T10',
                    'T11',
                    'T12',
                ],
            },
            stroke: {
                curve: 'smooth' as const,
                width: 2,
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                },
            },
            colors: ['#3B82F6'],
            dataLabels: { enabled: false },
            legend: { show: false },
        },
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center h-96">
                    <div className="text-lg">Đang tải...</div>
                </div>
            </Container>
        )
    }

    return (
        <Container className="h-full">
            <div className="mb-6">
                <h3 className="text-2xl font-bold">Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Tổng quan hệ thống Online Learning
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<HiOutlineUserGroup />}
                    label="Tổng người dùng"
                    value={stats?.total_users || 0}
                    color="text-blue-500"
                />
                <StatCard
                    icon={<HiOutlineAcademicCap />}
                    label="Giảng viên"
                    value={stats?.total_instructors || 0}
                    color="text-green-500"
                    badge={{
                        label: 'Chờ duyệt',
                        value: stats?.total_instructors || 0,
                        color: 'bg-orange-100 text-orange-600',
                    }}
                />
                <StatCard
                    icon={<HiOutlineBookOpen />}
                    label="Khóa học"
                    value={stats?.total_courses || 0}
                    color="text-purple-500"
                    badge={{
                        label: 'Đã xuất bản',
                        value: stats?.active_courses || 0,
                        color: 'bg-green-100 text-green-600',
                    }}
                />
                <StatCard
                    icon={<HiOutlineShoppingCart />}
                    label="Đơn hàng"
                    value={stats?.total_orders || 0}
                    color="text-pink-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2">
                    <AdaptableCard>
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold">
                                Doanh thu theo tháng
                            </h5>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats?.total_revenue || 0)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Tổng doanh thu
                                </div>
                            </div>
                        </div>
                        {revenueData && (
                            <Chart
                                series={chartData.series}
                                height={300}
                                type="area"
                            />
                        )}
                    </AdaptableCard>
                </div>

                {/* Quick Actions */}
                <div>
                    <AdaptableCard>
                        <h5 className="text-lg font-semibold mb-4">
                            Thao tác nhanh
                        </h5>
                        <div className="space-y-3">
                            <Button
                                variant="solid"
                                size="sm"
                                className="w-full justify-start"
                                icon={<HiOutlineClock />}
                            >
                                Phê duyệt giảng viên
                            </Button>
                            <Button
                                variant="solid"
                                size="sm"
                                className="w-full justify-start"
                                icon={<HiOutlineStar />}
                            >
                                Duyệt đánh giá
                            </Button>
                            <Button
                                variant="solid"
                                size="sm"
                                className="w-full justify-start"
                                icon={<HiOutlineChartBar />}
                            >
                                Xem báo cáo chi tiết
                            </Button>
                        </div>
                    </AdaptableCard>

                    <AdaptableCard className="mt-6">
                        <h5 className="text-lg font-semibold mb-4">
                            Thống kê nhanh
                        </h5>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Doanh thu tháng này
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(
                                        revenueData?.monthly_revenue?.[
                                            new Date().getMonth()
                                        ]?.revenue || 0
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Tăng trưởng
                                </span>
                                <span className="font-semibold text-green-600">
                                    +{revenueData?.growth_rate || 0}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Khóa học phổ biến
                                </span>
                                <span className="font-semibold">
                                    {stats?.active_courses || 0}
                                </span>
                            </div>
                        </div>
                    </AdaptableCard>
                </div>
            </div>
        </Container>
    )
}

export default Dashboard
