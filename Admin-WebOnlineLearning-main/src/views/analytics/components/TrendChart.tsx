import { Card } from '@/components/ui'
import Chart from '@/components/shared/Chart'
import { useTranslation } from 'react-i18next'

interface ChartSeriesItem {
    name: string
    data: number[]
}

interface TrendChartProps {
    series: ChartSeriesItem[]
}

const TrendChart = ({ series }: TrendChartProps) => {
    const { t } = useTranslation()
    return (
        <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">
                {t('analytics.chart.trendTitle')}
            </h4>
            <Chart type="line" series={series} height={300} />
        </Card>
    )
}

export default TrendChart
