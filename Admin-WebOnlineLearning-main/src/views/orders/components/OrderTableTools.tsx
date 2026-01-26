import { Button, Select } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { HiOutlineDownload } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

interface OrderTableToolsProps {
    filters: {
        paymentStatus: string
    }
    onFiltersChange: (filters: {
        paymentStatus: string
    }) => void
    onExport: () => void
}

const OrderTableTools = ({
    filters,
    onFiltersChange,
    onExport,
}: OrderTableToolsProps) => {
    const { t } = useTranslation()

    const handleFilterChange = (key: string, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        })
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold">{t('orders.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('orders.description')}
                    </p>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlineDownload />}
                    onClick={onExport}
                >
                    {t('orders.exportExcel')}
                </Button>
            </div>

            <AdaptableCard className="mb-4">
                <div className="flex gap-4">
                    <div className="w-64">
                        <Select
                            placeholder={t('orders.paymentStatus.all') as string}
                            value={{
                                value: filters.paymentStatus,
                                label: filters.paymentStatus
                                    ? (t(
                                          `orders.status.${filters.paymentStatus.toLowerCase()}`
                                      ) as string)
                                    : (t('orders.paymentStatus.all') as string),
                            }}
                            options={[
                                {
                                    value: '',
                                    label: t('orders.paymentStatus.all') as string,
                                },
                                {
                                    value: 'PENDING',
                                    label: t('orders.status.pending') as string,
                                },
                                {
                                    value: 'COMPLETED',
                                    label: t(
                                        'orders.status.completed'
                                    ) as string,
                                },
                                {
                                    value: 'FAILED',
                                    label: t('orders.status.failed') as string,
                                },
                                {
                                    value: 'REFUNDED',
                                    label: t(
                                        'orders.status.refunded'
                                    ) as string,
                                },
                            ]}
                            onChange={(
                                option: { value: string; label: string } | null
                            ) =>
                                handleFilterChange(
                                    'paymentStatus',
                                    option?.value || ''
                                )
                            }
                        />
                    </div>
                </div>
            </AdaptableCard>
        </>
    )
}

export default OrderTableTools
