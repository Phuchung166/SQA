import { Input, Select, Button } from '@/components/ui'
import { HiOutlineSearch } from 'react-icons/hi'
import { AdaptableCard } from '@/components/shared'
import { Category } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'

interface CourseFilters {
    status: string
    categoryId: string
    search: string
    sortBy: string
    sortOrder: string
}

interface CoursesTableToolsProps {
    filters: CourseFilters
    categories: Category[]
    onFiltersChange: (filters: CourseFilters) => void
    searchInput: string
    setSearchInput: (val: string) => void
    onSearch: () => void
}

const CoursesTableTools = ({
    filters,
    categories,
    onFiltersChange,
    searchInput,
    setSearchInput,
    onSearch,
}: CoursesTableToolsProps) => {
    const { t } = useTranslation()

    console.log('Categories in CoursesTableTools:', categories)

    const handleFilterChange = (key: keyof CourseFilters, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        })
    }

    const getStatusLabel = (statusValue: string) => {
        // normalize to lowercase so function works whether statusValue is
        // stored as lowercase or uppercase (backend expects UPPERCASE)
        const v = (statusValue || '').toLowerCase()
        switch (v) {
            case 'draft':
                return t('courses.status.draft')
            case 'published':
                return t('courses.status.published')
            case 'active':
                return t('courses.status.active')
            case 'deactive':
                return t('courses.status.deactive')
            default:
                return t('courses.status.all')
        }
    }

    const getCategoryLabel = (categoryId: string) => {
        if (!categoryId) return t('courses.category.all')
        const category = categories.find(
            (cat) => cat.id.toString() === categoryId
        )
        return category?.name || t('courses.category.all')
    }
    return (
        <AdaptableCard className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {t('common.search')}
                    </label>
                    <Input
                        placeholder={t('courses.searchPlaceholder') as string}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {t('courses.table.status')}
                    </label>
                    <Select
                        placeholder={t('courses.status.all') as string}
                        value={{
                            value: filters.status,
                            label: getStatusLabel(filters.status) as string,
                        }}
                        options={[
                            {
                                value: '',
                                label: t('courses.status.all') as string,
                            },
                            {
                                value: 'DRAFT',
                                label: t('courses.status.draft') as string,
                            },
                            {
                                value: 'PUBLISHED',
                                label: t('courses.status.published') as string,
                            },
                            {
                                value: 'ACTIVE',
                                label: t('courses.status.active') as string,
                            },
                            {
                                value: 'DEACTIVE',
                                label: t('courses.status.deactive') as string,
                            },
                        ]}
                        onChange={(
                            option: { value: string; label: string } | null
                        ) => handleFilterChange('status', option?.value || '')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {t('courses.category.label')}
                    </label>
                    <Select
                        placeholder={t('courses.category.select') as string}
                        value={{
                            value: filters.categoryId,
                            label: getCategoryLabel(
                                filters.categoryId
                            ) as string,
                        }}
                        options={[
                            {
                                value: '',
                                label: t('courses.category.all') as string,
                            },
                            ...categories.map((category) => ({
                                value: category.id.toString(),
                                label: category.name,
                            })),
                        ]}
                        onChange={(
                            option: { value: string; label: string } | null
                        ) =>
                            handleFilterChange(
                                'categoryId',
                                option?.value || ''
                            )
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Sort By
                    </label>
                    <Select
                        placeholder="Sort By"
                        value={{
                            value: filters.sortBy,
                            label: filters.sortBy,
                        }}
                        options={[
                            { value: 'createdAt', label: 'createdAt' },
                            { value: 'title', label: 'title' },
                            { value: 'price', label: 'price' },
                            {
                                value: 'total_students',
                                label: 'total_students',
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
                    <label className="block text-sm font-medium mb-2">
                        Sort Order
                    </label>
                    <Select
                        placeholder="Sort Order"
                        value={{
                            value: filters.sortOrder,
                            label:
                                filters.sortOrder === 'asc'
                                    ? 'Ascending'
                                    : 'Descending',
                        }}
                        options={[
                            { value: 'asc', label: 'Ascending' },
                            { value: 'desc', label: 'Descending' },
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
            <div className="flex justify-end">
                <Button
                    variant="solid"
                    className="h-10"
                    icon={<HiOutlineSearch />}
                    onClick={onSearch}
                >
                    {t('common.search')}
                </Button>
            </div>
        </AdaptableCard>
    )
}

export default CoursesTableTools
