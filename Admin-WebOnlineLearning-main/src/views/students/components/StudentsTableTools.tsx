import { Input, Select } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { HiOutlineSearch } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

interface StudentsTableToolsProps {
    filters: {
        status: string
        search: string
    }
    onFiltersChange: (filters: { status: string; search: string }) => void
}

const StudentsTableTools = ({
    filters,
    onFiltersChange,
}: StudentsTableToolsProps) => {
    const { t } = useTranslation()

    const handleFilterChange = (key: string, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        })
    }

    const getStatusLabel = (statusValue: string) => {
        switch (statusValue) {
            case 'active':
                return t('students.status.active')
            case 'inactive':
                return t('students.status.inactive')
            case 'suspended':
                return t('students.status.suspended')
            default:
                return t('students.status.all')
        }
    }

    return (
        <AdaptableCard className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Input
                        placeholder={t('students.searchPlaceholder') as string}
                        prefix={<HiOutlineSearch />}
                        value={filters.search}
                        onChange={(e) =>
                            handleFilterChange('search', e.target.value)
                        }
                    />
                </div>
                <div>
                    <Select
                        placeholder={t('students.table.status') as string}
                        value={{
                            value: filters.status,
                            label: getStatusLabel(filters.status) as string,
                        }}
                        options={[
                            {
                                value: '',
                                label: t('students.status.all') as string,
                            },
                            {
                                value: 'active',
                                label: t('students.status.active') as string,
                            },
                            {
                                value: 'inactive',
                                label: t('students.status.inactive') as string,
                            },
                            {
                                value: 'suspended',
                                label: t('students.status.suspended') as string,
                            },
                        ]}
                        onChange={(
                            option: { value: string; label: string } | null
                        ) => handleFilterChange('status', option?.value || '')}
                    />
                </div>
            </div>
        </AdaptableCard>
    )
}

export default StudentsTableTools
