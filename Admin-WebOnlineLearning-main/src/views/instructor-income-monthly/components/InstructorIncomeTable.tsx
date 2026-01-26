import { Badge, Button } from '@/components/ui'
import { AdaptableCard, DataTable } from '@/components/shared'
import { InstructorIncome } from '@/@types/online-learning'
import { TableRow } from '@/@types/user'
import { useTranslation } from 'react-i18next'
import { HiOutlineCheckCircle } from 'react-icons/hi'
import dayjs from 'dayjs'

interface InstructorIncomeTableProps {
    incomes: InstructorIncome[]
    loading: boolean
    pagination: {
        total: number
        page: number
        limit: number
    }
    onPaginationChange: (page: number) => void
    onConfirmPayment: (income: InstructorIncome) => void
}

const InstructorIncomeTable = ({
    incomes,
    loading,
    pagination,
    onPaginationChange,
    onConfirmPayment,
}: InstructorIncomeTableProps) => {
    const { t } = useTranslation()

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Badge className="bg-orange-100 text-orange-600">
                        {t('instructorIncome.status.pending')}
                    </Badge>
                )
            case 'PAID':
                return (
                    <Badge className="bg-green-100 text-green-600">
                        {t('instructorIncome.status.paid')}
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    const columns = [
        {
            header: t('instructorIncome.table.period'),
            accessorKey: 'period',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                return (
                    <div>
                        <div className="font-medium">
                            {t(`instructorIncome.months.${income.month}`)}{' '}
                            {income.year}
                        </div>
                    </div>
                )
            },
        },
        {
            header: t('instructorIncome.table.fullName'),
            accessorKey: 'full_name',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                return (
                    <div className="font-medium">
                        {income.last_name} {income.first_name}
                    </div>
                )
            },
        },
        {
            header: t('instructorIncome.table.accountName'),
            accessorKey: 'account_name',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                return <div className="text-sm">{income.account_name}</div>
            },
        },
        {
            header: t('instructorIncome.table.email'),
            accessorKey: 'email',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                return <div className="text-sm">{income.email}</div>
            },
        },
        {
            header: t('instructorIncome.table.bankInfo'),
            accessorKey: 'bank_info',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                return (
                    <div>
                        <div className="font-medium">{income.bank_name}</div>
                        <div className="text-sm text-gray-500">
                            {income.bank_account}
                        </div>
                    </div>
                )
            },
        },
        {
            header: t('instructorIncome.table.totalEarning'),
            accessorKey: 'total_earning',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                return (
                    <div className="text-right font-medium text-green-600">
                        {formatCurrency(income.total_earning)}
                    </div>
                )
            },
        },
        {
            header: t('instructorIncome.table.paymentStatus'),
            accessorKey: 'payment_status',
            cell: ({ row }: { row: TableRow }) =>
                getStatusBadge(row.original.payment_status),
        },
        {
            header: t('instructorIncome.table.paidAt'),
            accessorKey: 'paid_at',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                return income.paid_at ? (
                    <div className="text-sm">
                        {dayjs(income.paid_at).format('DD/MM/YYYY HH:mm')}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400">
                        {t('instructorIncome.table.notPaid')}
                    </div>
                )
            },
        },
        {
            header: t('instructorIncome.table.actions'),
            accessorKey: 'actions',
            cell: ({ row }: { row: TableRow }) => {
                const income = row.original
                const isPaid = income.payment_status === 'PAID'

                return (
                    <div className="flex justify-center">
                        <Button
                            size="sm"
                            variant={isPaid ? 'plain' : 'solid'}
                            disabled={isPaid}
                            icon={<HiOutlineCheckCircle />}
                            onClick={() => onConfirmPayment(income)}
                        >
                            {isPaid
                                ? t('instructorIncome.table.paid')
                                : t('instructorIncome.table.confirmPayment')}
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <AdaptableCard>
            <DataTable
                columns={columns}
                data={incomes}
                loading={loading}
                pagingData={{
                    total: pagination.total,
                    pageIndex: pagination.page - 1,
                    pageSize: pagination.limit,
                }}
                onPaginationChange={(pageIndex: number) => {
                    // DataTable returns 0-based index, convert to 1-based for API
                    onPaginationChange(pageIndex + 1)
                }}
            />
        </AdaptableCard>
    )
}

export default InstructorIncomeTable
