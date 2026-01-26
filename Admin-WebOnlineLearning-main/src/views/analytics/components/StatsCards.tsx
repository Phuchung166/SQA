import { Card } from '@/components/ui'
import { HiOutlineArrowUp, HiOutlineArrowDown } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

interface StatCardType {
    title: string
    value: string | number
    change: number
    icon: React.ComponentType<{ className?: string }>
    color: string
}

interface StatsCardsProps {
    stats: StatCardType[]
}

const StatsCards = ({ stats }: StatsCardsProps) => {
    const { t } = useTranslation()
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stat.value}
                            </p>
                        </div>
                        <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                            <stat.icon
                                className={`h-6 w-6 text-${stat.color}-600`}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        {stat.change > 0 ? (
                            <HiOutlineArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                            <HiOutlineArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                            className={`ml-1 text-sm font-medium ${
                                stat.change > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}
                        >
                            {Math.abs(stat.change)}%
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                            {t('analytics.comparedToPrevious')}
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default StatsCards
