import { Badge } from '@/components/ui'
import { AdaptableCard, DataTable } from '@/components/shared'
import { TableRow } from '@/@types/user'
import { useTranslation } from 'react-i18next'
import CourseActions from './CourseActions'

interface CoursesTableProps {
    courses: unknown[]
    loading: boolean
    pagination: {
        total: number
        page: number
        limit: number
    }
    onPaginationChange: (page: number) => void
    onDelete: (id: number) => void
    onRefresh?: () => void
}

const CoursesTable = ({
    courses,
    loading,
    pagination,
    onPaginationChange,
    onDelete,
    onRefresh,
}: CoursesTableProps) => {
    console.log('Courses in CoursesTable:', courses)
    const { t } = useTranslation()

    const getStatusBadge = (status: string) => {
        const statusMap = {
            DRAFT: { color: 'gray', text: t('courses.status.draft') },
            PUBLISHED: { color: 'green', text: t('courses.status.published') },
            ACTIVE: { color: 'orange', text: t('courses.status.active') },
            DEACTIVE: { color: 'red', text: t('courses.status.deactive') },
        }
        const config =
            statusMap[status as keyof typeof statusMap] || statusMap.DRAFT
        return (
            <Badge
                className={`bg-${config.color}-100 text-${config.color}-800`}
            >
                {config.text}
            </Badge>
        )
    }

    const columns = [
        {
            header: t('courses.table.course'),
            accessorKey: 'title',
            cell: ({ row }: { row: TableRow }) => {
                const course = row.original
                return (
                    <div className="flex items-center gap-3">
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                            <div className="font-medium text-gray-900">
                                {course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                                {course.category?.name || ''}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            header: t('courses.table.instructor'),
            accessorKey: 'instructor',
            cell: ({ row }: { row: TableRow }) => {
                const instructor = row.original.instructor
                return instructor ? (
                    <div className="flex items-center gap-2">
                        {instructor.avatar ? (
                            <img
                                src={instructor.avatar}
                                alt={instructor.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500">
                                no updated information
                            </span>
                        )}
                        <span className="font-medium text-gray-900">
                            {instructor.name}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-500">
                        {t('courses.messages.noInfo')}
                    </span>
                )
            },
        },
        {
            header: t('courses.table.price'),
            accessorKey: 'price',
            cell: ({ row }: { row: TableRow }) => {
                const course = row.original
                return (
                    <div className="text-sm font-medium">
                        {course.isFree
                            ? t('courses.table.free')
                            : `${course.price.toLocaleString('vi-VN')} ${
                                  course.currency
                              }`}
                        {course.originalPrice &&
                            course.originalPrice > course.price && (
                                <span className="ml-2 line-through text-gray-400 text-xs">
                                    {course.originalPrice.toLocaleString(
                                        'vi-VN'
                                    )}{' '}
                                    {course.currency}
                                </span>
                            )}
                    </div>
                )
            },
        },
        {
            header: t('courses.table.students'),
            accessorKey: 'totalStudents',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.original.totalStudents || 0}{' '}
                        {t('courses.table.studentsCount')}
                    </span>
                </div>
            ),
        },
        {
            header: t('courses.table.status'),
            accessorKey: 'status',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-center">
                    {getStatusBadge(row.original.status)}
                </div>
            ),
        },
        {
            header: t('courses.table.actions'),
            accessorKey: 'actions',
            cell: ({ row }: { row: TableRow }) => (
                <CourseActions
                    course={row.original}
                    onDelete={onDelete}
                    onRefresh={onRefresh}
                />
            ),
        },
    ]

    return (
        <AdaptableCard>
            <DataTable
                columns={columns}
                data={courses}
                loading={loading}
                pagingData={{
                    total: pagination.total,
                    pageIndex: pagination.page,
                    pageSize: pagination.limit,
                }}
                onPaginationChange={onPaginationChange}
            />
        </AdaptableCard>
    )
}

export default CoursesTable
