import { Avatar } from '@/components/ui'
import { AdaptableCard, DataTable } from '@/components/shared'
import { Instructor } from '@/@types/online-learning'
import { TableRow, avatar_default_url } from '@/@types/user'
import { useTranslation } from 'react-i18next'
import InstructorActions from './InstructorActions'

interface InstructorsTableProps {
    instructors: Instructor[]
    loading: boolean
    pagination: {
        total: number
        page: number
        pageSize: number
    }
    onPaginationChange: (page: number) => void
    onView: (instructor: Instructor) => void
    onApprove: (id: string) => void
    onReject: (id: string) => void
    onSuspend: (id: string) => void
    onActivate: (id: string) => void
}

const InstructorsTable = ({
    instructors,
    loading,
    pagination,
    onPaginationChange,
    onView,
    onApprove,
    onReject,
    onSuspend,
    onActivate,
}: InstructorsTableProps) => {
    const { t } = useTranslation()
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    const columns = [
        {
            header: t('instructors.table.instructor'),
            accessorKey: 'user',
            cell: ({ row }: { row: TableRow }) => {
                const instructor = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={instructor.avatar || avatar_default_url}
                            alt={instructor.user?.fullName}
                            className="w-10 h-10"
                        />
                        <div>
                            <div className="font-medium">
                                {instructor.account_name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {instructor.email}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        ...(instructors.some((i) => i.expertise)
            ? [
                  {
                      header: t('instructors.detail.specialization'),
                      accessorKey: 'expertise',
                      cell: ({ row }: { row: TableRow }) => (
                          <div>
                              <div className="font-medium">
                                  {row.original.expertise || '-'}
                              </div>
                              {row.original.experience_years && (
                                  <div className="text-sm text-gray-500">
                                      {row.original.experience_years}{' '}
                                      {t('instructors.table.years')}{' '}
                                      {t('instructors.table.experience')}
                                  </div>
                              )}
                          </div>
                      ),
                  },
              ]
            : []),
        ...(instructors.some((i) => i.total_courses !== undefined)
            ? [
                  {
                      header: t('instructors.table.courses'),
                      accessorKey: 'total_courses',
                      cell: ({ row }: { row: TableRow }) => (
                          <div className="text-center">
                              <div className="font-medium">
                                  {row.original.total_courses || 0}
                              </div>
                              <div className="text-sm text-gray-500">
                                  {t('instructors.table.coursesCount')}
                              </div>
                          </div>
                      ),
                  },
              ]
            : []),
        ...(instructors.some((i) => i.total_students !== undefined)
            ? [
                  {
                      header: t('instructors.table.students'),
                      accessorKey: 'total_students',
                      cell: ({ row }: { row: TableRow }) => (
                          <div className="text-center">
                              <div className="font-medium">
                                  {row.original.total_students || 0}
                              </div>
                              <div className="text-sm text-gray-500">
                                  {t('instructors.table.studentsCount')}
                              </div>
                          </div>
                      ),
                  },
              ]
            : []),
        ...(instructors.some((i) => i.total_revenue !== undefined)
            ? [
                  {
                      header: t('instructors.detail.totalRevenue'),
                      accessorKey: 'total_revenue',
                      cell: ({ row }: { row: TableRow }) => (
                          <div className="text-right">
                              <div className="font-medium text-green-600">
                                  {formatCurrency(
                                      row.original.total_revenue || 0
                                  )}
                              </div>
                          </div>
                      ),
                  },
              ]
            : []),
        {
            header: t('instructors.table.actions'),
            accessorKey: 'actions',
            cell: ({ row }: { row: TableRow }) => {
                const instructor = row.original
                return (
                    <InstructorActions
                        instructor={instructor}
                        onView={onView}
                        onApprove={onApprove}
                        onReject={onReject}
                        onSuspend={onSuspend}
                        onActivate={onActivate}
                    />
                )
            },
        },
    ]

    return (
        <AdaptableCard>
            <DataTable
                columns={columns}
                data={instructors}
                loading={loading}
                pagingData={{
                    total: pagination.total,
                    pageIndex: pagination.page,
                    pageSize: pagination.pageSize,
                }}
                onPaginationChange={onPaginationChange}
            />
        </AdaptableCard>
    )
}

export default InstructorsTable
