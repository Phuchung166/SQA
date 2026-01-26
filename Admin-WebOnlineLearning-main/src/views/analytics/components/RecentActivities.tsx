import { Card } from '@/components/ui'
import { useTranslation } from 'react-i18next'

interface RecentActivity {
    id: number
    action: string
    course: string
    time: string
}

interface RecentActivitiesProps {
    activities: RecentActivity[]
}

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
    const { t } = useTranslation()
    return (
        <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">
                {t('analytics.recentActivities.title')}
            </h4>
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-500">
                                {activity.course}
                            </p>
                        </div>
                        <span className="text-sm text-gray-400">
                            {activity.time}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default RecentActivities
