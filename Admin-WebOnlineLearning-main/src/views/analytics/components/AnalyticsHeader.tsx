import { useTranslation } from 'react-i18next'

interface AnalyticsHeaderProps {
    timeRange: string
    onTimeRangeChange: (value: string) => void
}

const AnalyticsHeader = ({
    timeRange,
    onTimeRangeChange,
}: AnalyticsHeaderProps) => {
    const { t } = useTranslation()
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onTimeRangeChange(e.target.value)
    }

    return (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-2xl font-bold">{t('analytics.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('analytics.description')}
                </p>
            </div>
            <div>
                <select
                    value={timeRange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={handleChange}
                >
                    <option value="7d">{t('analytics.timeRange.7d')}</option>
                    <option value="30d">{t('analytics.timeRange.30d')}</option>
                    <option value="90d">{t('analytics.timeRange.90d')}</option>
                    <option value="1y">{t('analytics.timeRange.1y')}</option>
                </select>
            </div>
        </div>
    )
}

export default AnalyticsHeader
