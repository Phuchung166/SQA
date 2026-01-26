import { Input, Select } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { HiOutlineSearch } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

interface InstructorsTableToolsProps {
    filters: {
        search: string
        sortBy: string
        sortOrder: string
    }
    onFiltersChange: (filters: {
        search: string
        sortBy: string
        sortOrder: string
    }) => void
}

const InstructorsTableTools = ({
    filters,
    onFiltersChange,
}: InstructorsTableToolsProps) => {
    const { t } = useTranslation()

    const handleFilterChange = (key: string, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        })
    }

    return (
        <AdaptableCard className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Input
                        placeholder={
                            t('instructors.searchPlaceholder') as string
                        }
                        prefix={<HiOutlineSearch />}
                        value={filters.search}
                        onChange={(e) =>
                            handleFilterChange('search', e.target.value)
                        }
                    />
                </div>
                <div>
                    <Select
                        placeholder="Sort By"
                        value={{
                            value: filters.sortBy,
                            label:
                                filters.sortBy === 'createdAt'
                                    ? 'Created At'
                                    : 'Name',
                        }}
                        options={[
                            {
                                value: 'createdAt',
                                label: 'Created At',
                            },
                            {
                                value: 'name',
                                label: 'Name',
                            },
                        ]}
                        onChange={(
                            option: { value: string; label: string } | null
                        ) =>
                            handleFilterChange(
                                'sortBy',
                                option?.value || 'createdAt'
                            )
                        }
                    />
                </div>
                <div>
                    <Select
                        placeholder="Sort Order"
                        value={{
                            value: filters.sortOrder,
                            label:
                                filters.sortOrder === 'desc'
                                    ? 'Descending'
                                    : 'Ascending',
                        }}
                        options={[
                            {
                                value: 'desc',
                                label: 'Descending',
                            },
                            {
                                value: 'asc',
                                label: 'Ascending',
                            },
                        ]}
                        onChange={(
                            option: { value: string; label: string } | null
                        ) =>
                            handleFilterChange(
                                'sortOrder',
                                option?.value || 'desc'
                            )
                        }
                    />
                </div>
            </div>
        </AdaptableCard>
    )
}

export default InstructorsTableTools
