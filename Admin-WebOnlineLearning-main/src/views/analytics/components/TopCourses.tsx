import { Card } from '@/components/ui'
import { useTranslation } from 'react-i18next'

interface TopCourse {
    id: number
    title: string
    students: number
    revenue: number
}

interface TopCoursesProps {
    courses: TopCourse[]
}

const TopCourses = ({ courses }: TopCoursesProps) => {
    const { t } = useTranslation()
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    return (
        <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">
                {t('analytics.topCourses.title')}
            </h4>
            <div className="space-y-4">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">
                                {course.students}{' '}
                                {t('analytics.topCourses.students')}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-green-600">
                                {formatCurrency(course.revenue)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default TopCourses
