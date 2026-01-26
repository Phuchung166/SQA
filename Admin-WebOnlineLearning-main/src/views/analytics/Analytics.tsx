import { useState, useEffect } from 'react'
import {
    HiOutlineAcademicCap,
    HiOutlineUsers,
    HiOutlineCurrencyDollar,
    HiOutlineChartBar,
} from 'react-icons/hi'
import AnalyticsHeader from './components/AnalyticsHeader'
import StatsCards from './components/StatsCards'
import TrendChart from './components/TrendChart'
import TopCourses from './components/TopCourses'
import RecentActivities from './components/RecentActivities'
import { useTranslation } from 'react-i18next'

interface StatCardType {
    title: string
    value: string | number
    change: number
    icon: React.ComponentType<{ className?: string }>
    color: string
}

interface TopCourse {
    id: number
    title: string
    students: number
    revenue: number
}

interface RecentActivity {
    id: number
    action: string
    course: string
    time: string
}

const Analytics = () => {
    const { t } = useTranslation()

    const [timeRange, setTimeRange] = useState('7d')
    const [analyticsData, setAnalyticsData] = useState<{
        stats: StatCardType[]
        topCourses: TopCourse[]
        recentActivities: RecentActivity[]
    }>({
        stats: [],
        topCourses: [],
        recentActivities: [],
    })

    useEffect(() => {
        const stats: StatCardType[] = [
            {
                title: t('analytics.stats.totalCourses') as string,
                value: 156,
                change: 12.5,
                icon: HiOutlineAcademicCap,
                color: 'blue',
            },
            {
                title: t('analytics.stats.activeStudents') as string,
                value: '2,847',
                change: 8.2,
                icon: HiOutlineUsers,
                color: 'green',
            },
            {
                title: t('analytics.stats.monthlyRevenue') as string,
                value: '₫125.6M',
                change: -3.1,
                icon: HiOutlineCurrencyDollar,
                color: 'yellow',
            },
            {
                title: t('analytics.stats.completionRate') as string,
                value: '78%',
                change: 5.4,
                icon: HiOutlineChartBar,
                color: 'purple',
            },
        ]

        setAnalyticsData({
            stats,
            topCourses: [
                {
                    id: 1,
                    title: 'React từ cơ bản đến nâng cao',
                    students: 1247,
                    revenue: 45600000,
                },
                {
                    id: 2,
                    title: 'Node.js Backend Development',
                    students: 892,
                    revenue: 32400000,
                },
                {
                    id: 3,
                    title: 'UI/UX Design Fundamentals',
                    students: 756,
                    revenue: 27800000,
                },
            ],
            recentActivities: [
                {
                    id: 1,
                    action: t(
                        'analytics.recentActivities.newCourseCreated'
                    ) as string,
                    course: 'Python for Data Science',
                    time: `2 ${t('analytics.recentActivities.hoursAgo')}`,
                },
                {
                    id: 2,
                    action: t(
                        'analytics.recentActivities.studentCompleted'
                    ) as string,
                    course: 'JavaScript ES6+',
                    time: `3 ${t('analytics.recentActivities.hoursAgo')}`,
                },
                {
                    id: 3,
                    action: t(
                        'analytics.recentActivities.ratingReceived'
                    ) as string,
                    course: 'React Hooks',
                    time: `5 ${t('analytics.recentActivities.hoursAgo')}`,
                },
            ],
        })
    }, [timeRange, t])

    const chartSeries = [
        {
            name: t('analytics.chart.newRegistrations') as string,
            data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
            name: t('analytics.chart.courseCompletions') as string,
            data: [28, 48, 40, 19, 86, 27, 90],
        },
    ]

    return (
        <div className="p-6 space-y-6">
            <AnalyticsHeader
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
            />

            <StatsCards stats={analyticsData.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart series={chartSeries} />
                <TopCourses courses={analyticsData.topCourses} />
            </div>

            <RecentActivities activities={analyticsData.recentActivities} />
        </div>
    )
}

export default Analytics
