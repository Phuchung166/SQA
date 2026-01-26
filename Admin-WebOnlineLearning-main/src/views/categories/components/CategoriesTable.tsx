import { AdaptableCard, DataTable } from '@/components/shared'
import { HiOutlineCollection } from 'react-icons/hi'
import { Category } from '@/@types/online-learning'
import { TableRow } from '@/@types/user'
import { useTranslation } from 'react-i18next'
import CategoryActions from './CategoryActions'
import { formatDate } from '@/utils/handleDate'

interface CategoriesTableProps {
    categories: Category[]
    loading: boolean
    pagination: {
        total: number
        pageIndex: number
        pageSize: number
    }
    onPaginationChange: (page: number) => void
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
}

const CategoriesTable = ({
    categories,
    loading,
    pagination,
    onPaginationChange,
    onEdit,
    onDelete,
}: CategoriesTableProps) => {
    const { t } = useTranslation()

    const columns = [
        {
            header: t('categories.table.id'),
            accessorKey: 'id',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-center font-mono text-sm">
                    #{row.original.id}
                </div>
            ),
        },
        {
            header: t('categories.table.name'),
            accessorKey: 'name',
            cell: ({ row }: { row: TableRow }) => {
                const category = row.original
                return (
                    <div className="flex items-center gap-2">
                        <HiOutlineCollection className="text-lg text-blue-500" />
                        <div>
                            <div className="font-medium">{category.name}</div>
                        </div>
                    </div>
                )
            },
        },
        {
            header: t('categories.table.description'),
            accessorKey: 'description',
            cell: ({ row }: { row: TableRow }) => (
                <div
                    className="max-w-xs truncate"
                    title={row.original.description}
                >
                    {row.original.description || '-'}
                </div>
            ),
        },
        {
            header: t('categories.table.image'),
            accessorKey: 'image',
            cell: ({ row }: { row: TableRow }) => (
                <img
                    src={row.original.image}
                    alt={row.original.name}
                    className="w-16 h-16 object-cover rounded-lg"
                />
            ),
        },
        {
            header: t('categories.table.totalCourses'),
            accessorKey: 'totalCourses',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-center">
                    {row.original.totalCourses || 0}
                </div>
            ),
        },
        {
            header: t('categories.table.createdAt'),
            accessorKey: 'created_at',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-center text-sm">
                    {formatDate(row.original.created_at)}
                </div>
            ),
        },
        {
            header: t('categories.table.updatedAt'),
            accessorKey: 'updated_at',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-center text-sm">
                    {formatDate(row.original.updated_at)}
                </div>
            ),
        },
        // {
        //     header: t('categories.table.status'),
        //     accessorKey: 'isActive',
        //     cell: ({ row }: { row: TableRow }) => (
        //         <div className="text-center">
        //             {row.original.isActive ? (
        //                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        //                     {t('categories.table.active')}
        //                 </span>
        //             ) : (
        //                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        //                     {t('categories.table.inactive')}
        //                 </span>
        //             )}
        //         </div>
        //     ),
        // },
        {
            header: t('categories.table.actions'),
            accessorKey: 'actions',
            cell: ({ row }: { row: TableRow }) => (
                <CategoryActions
                    category={row.original}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        },
    ]

    return (
        <AdaptableCard>
            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
                pagingData={pagination}
                onPaginationChange={onPaginationChange}
            />
        </AdaptableCard>
    )
}

export default CategoriesTable
