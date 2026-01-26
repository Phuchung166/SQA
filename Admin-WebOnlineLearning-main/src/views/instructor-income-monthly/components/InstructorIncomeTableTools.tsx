import { Button, Select } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { HiOutlineDownload } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

interface InstructorIncomeTableToolsProps {
    filters: {
        year: number | null
        month: number | null
        paymentStatus: string
    }
    onFiltersChange: (filters: {
        year: number | null
        month: number | null
        paymentStatus: string
    }) => void
    onExport: () => void
}

const InstructorIncomeTableTools = ({
    filters,
    onFiltersChange,
    onExport,
}: InstructorIncomeTableToolsProps) => {
    const { t } = useTranslation()

    const handleFilterChange = (key: string, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        })
    }

    // Generate year options (last 5 years)
    const currentYear = new Date().getFullYear()
    const yearOptions = [
        {
            value: null,
            label: t('instructorIncome.filters.allYears') as string,
        },
        ...Array.from({ length: 5 }, (_, i) => ({
            value: currentYear - i,
            label: `${currentYear - i}`,
        })),
    ]

    // Generate month options
    const monthOptions = [
        {
            value: null,
            label: t('instructorIncome.filters.allMonths') as string,
        },
        ...Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: t(`instructorIncome.months.${i + 1}`) as string,
        })),
    ]

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold">
                        {t('instructorIncome.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('instructorIncome.description')}
                    </p>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlineDownload />}
                    onClick={onExport}
                >
                    {t('instructorIncome.exportExcel')}
                </Button>
            </div>

            <AdaptableCard className="mb-4">
                <div className="flex gap-4 flex-wrap">
                    <div className="w-48">
                        <Select
                            placeholder={
                                t(
                                    'instructorIncome.filters.selectYear'
                                ) as string
                            }
                            value={
                                filters.year !== null
                                    ? {
                                          value: filters.year,
                                          label: `${filters.year}`,
                                      }
                                    : {
                                          value: null,
                                          label: t(
                                              'instructorIncome.filters.allYears'
                                          ) as string,
                                      }
                            }
                            options={yearOptions}
                            onChange={(
                                option: {
                                    value: number | null
                                    label: string
                                } | null
                            ) =>
                                handleFilterChange(
                                    'year',
                                    option?.value ?? null
                                )
                            }
                        />
                    </div>

                    <div className="w-48">
                        <Select
                            placeholder={
                                t(
                                    'instructorIncome.filters.selectMonth'
                                ) as string
                            }
                            value={
                                filters.month !== null
                                    ? {
                                          value: filters.month,
                                          label: t(
                                              `instructorIncome.months.${filters.month}`
                                          ) as string,
                                      }
                                    : {
                                          value: null,
                                          label: t(
                                              'instructorIncome.filters.allMonths'
                                          ) as string,
                                      }
                            }
                            options={monthOptions}
                            onChange={(
                                option: {
                                    value: number | null
                                    label: string
                                } | null
                            ) =>
                                handleFilterChange(
                                    'month',
                                    option?.value ?? null
                                )
                            }
                        />
                    </div>

                    <div className="w-64">
                        <Select
                            placeholder={
                                t(
                                    'instructorIncome.filters.allStatus'
                                ) as string
                            }
                            value={{
                                value: filters.paymentStatus,
                                label: filters.paymentStatus
                                    ? (t(
                                          `instructorIncome.status.${filters.paymentStatus.toLowerCase()}`
                                      ) as string)
                                    : (t(
                                          'instructorIncome.filters.allStatus'
                                      ) as string),
                            }}
                            options={[
                                {
                                    value: '',
                                    label: t(
                                        'instructorIncome.filters.allStatus'
                                    ) as string,
                                },
                                {
                                    value: 'PENDING',
                                    label: t(
                                        'instructorIncome.status.pending'
                                    ) as string,
                                },
                                {
                                    value: 'PAID',
                                    label: t(
                                        'instructorIncome.status.paid'
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

export default InstructorIncomeTableTools
