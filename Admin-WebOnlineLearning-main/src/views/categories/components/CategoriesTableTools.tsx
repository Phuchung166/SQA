import { Input, Select, Button } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'

interface CategoriesTableToolsProps {
    search: string
    isActive: boolean | null
    sortBy: string
    sortOrder: string
    onSearchChange: (value: string) => void
    onIsActiveChange: (value: boolean | null) => void
    onSortByChange: (value: string) => void
    onSortOrderChange: (value: string) => void
    onSearch: () => void
}

const CategoriesTableTools = ({
    search,
    isActive,
    sortBy,
    sortOrder,
    onSearchChange,
    onIsActiveChange,
    onSortByChange,
    onSortOrderChange,
    onSearch,
}: CategoriesTableToolsProps) => {
    const { t } = useTranslation()
    const [localSearch, setLocalSearch] = useState(search)

    const handleSearch = () => {
        onSearchChange(localSearch)
        onSearch()
    }

    const handleClearSearch = () => {
        setLocalSearch('')
        onSearchChange('')
        onSearch()
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const getStatusLabel = (statusValue: boolean | null) => {
        if (statusValue === true) return t('categories.status.active')
        if (statusValue === false) return t('categories.status.inactive')
        return t('categories.status.all')
    }

    return (
        <AdaptableCard className="mb-4">
            <div className="space-y-4">
                {/* First row: Input fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Input
                            placeholder={
                                t('categories.searchPlaceholder') as string
                            }
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    <div>
                        <Select
                            placeholder={t('categories.status.all') as string}
                            value={{
                                value:
                                    isActive === null
                                        ? 'all'
                                        : isActive.toString(),
                                label: getStatusLabel(isActive) as string,
                            }}
                            options={[
                                {
                                    value: 'all',
                                    label: t('categories.status.all') as string,
                                },
                                {
                                    value: 'true',
                                    label: t(
                                        'categories.status.active'
                                    ) as string,
                                },
                                {
                                    value: 'false',
                                    label: t(
                                        'categories.status.inactive'
                                    ) as string,
                                },
                            ]}
                            onChange={(
                                option: { value: string; label: string } | null
                            ) => {
                                const value = option?.value
                                if (value === 'all') {
                                    onIsActiveChange(null)
                                } else {
                                    onIsActiveChange(value === 'true')
                                }
                            }}
                        />
                    </div>
                    <div>
                        <Select
                            placeholder="Sort By"
                            value={{
                                value: sortBy,
                                label:
                                    sortBy === 'createdAt'
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
                            ) => onSortByChange(option?.value || 'createdAt')}
                        />
                    </div>
                    <div>
                        <Select
                            placeholder="Sort Order"
                            value={{
                                value: sortOrder,
                                label:
                                    sortOrder === 'desc'
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
                            ) => onSortOrderChange(option?.value || 'desc')}
                        />
                    </div>
                </div>

                {/* Second row: Buttons */}
                <div className="flex gap-2 justify-end">
                    <Button
                        size="sm"
                        variant="solid"
                        icon={<HiOutlineSearch />}
                        onClick={handleSearch}
                    >
                        {t('common.search')}
                    </Button>
                    {(localSearch || search) && (
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiOutlineX />}
                            onClick={handleClearSearch}
                        >
                            {t('common.clear')}
                        </Button>
                    )}
                </div>
            </div>
        </AdaptableCard>
    )
}

export default CategoriesTableTools
