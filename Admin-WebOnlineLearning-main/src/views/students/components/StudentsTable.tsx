import { Badge, Avatar } from '@/components/ui'
import { AdaptableCard, DataTable } from '@/components/shared'
import { Student, TableRow, avatar_default_url } from '@/@types/user'
import { useTranslation } from 'react-i18next'
import StudentActions from './StudentActions'
import { formatDate } from '@/utils/handleDate'

interface StudentsTableProps {
    students: Student[]
    loading: boolean
    pagination: {
        total: number
        page: number
        limit: number
    }
    onPaginationChange: (page: number) => void
    onView: (student: Student) => void
    // onSuspend: (id: string) => void
    // onActivate: (id: string) => void
    onDelete: (email: string) => void
}

const StudentsTable = ({
    students,
    loading,
    pagination,
    onPaginationChange,
    onView,
    // onSuspend,
    // onActivate,
    onDelete,
}: StudentsTableProps) => {
    const { t } = useTranslation()

    const columns = [
        {
            header: t('students.table.student'),
            accessorKey: 'account_name',
            cell: ({ row }: { row: TableRow }) => {
                const student = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={student.avatar || avatar_default_url}
                            alt={student.account_name}
                            className="w-10 h-10"
                        />
                        <div>
                            <div className="font-medium">
                                {student.account_name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {student.email}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            header: t('students.table.email'),
            accessorKey: 'email',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-sm">{row.original.email}</div>
            ),
        },
        {
            header: t('students.table.joinDate'),
            accessorKey: 'created_at',
            cell: ({ row }: { row: TableRow }) => (
                <div className="text-sm text-center">
                    {row.original.created_at
                        ? formatDate(row.original.created_at)
                        : 'Chưa có'}
                </div>
            ),
        },
        {
            header: t('students.table.actions'),
            accessorKey: 'actions',
            cell: ({ row }: { row: TableRow }) => {
                const student = row.original
                return (
                    <StudentActions
                        student={student}
                        onView={onView}
                        // onSuspend={onSuspend}
                        // onActivate={onActivate}
                        onDelete={onDelete}
                    />
                )
            },
        },
    ]

    return (
        <AdaptableCard>
            <DataTable
                columns={columns}
                data={students}
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

export default StudentsTable
