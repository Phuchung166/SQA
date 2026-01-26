import { Badge } from '@/components/ui'
import { AdaptableCard, DataTable } from '@/components/shared'
import { Order } from '@/@types/online-learning'
import { TableRow } from '@/@types/user'
import { useTranslation } from 'react-i18next'
import OrderActions from './OrderActions'
import dayjs from 'dayjs'

interface OrderTableProps {
    orders: Order[]
    loading: boolean
    pagination: {
        total: number
        page: number
        limit: number
    }
    onPaginationChange: (page: number) => void
    onView: (order: Order) => void
    onRefund?: (order: Order) => void
}

const OrderTable = ({
    orders,
    loading,
    pagination,
    onPaginationChange,
    onView,
}: OrderTableProps) => {
    const { t } = useTranslation()

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            PENDING: 'pending',
            COMPLETED: 'completed',
            FAILED: 'failed',
            REFUNDED: 'refunded',
        }
        const lowerStatus = statusMap[status] || status.toLowerCase()

        switch (lowerStatus) {
            case 'pending':
                return (
                    <Badge className="bg-orange-100 text-orange-600">
                        {t('orders.status.pending')}
                    </Badge>
                )
            case 'completed':
                return (
                    <Badge className="bg-green-100 text-green-600">
                        {t('orders.status.completed')}
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge className="bg-red-100 text-red-600">
                        {t('orders.status.failed')}
                    </Badge>
                )
            case 'refunded':
                return (
                    <Badge className="bg-gray-100 text-gray-600">
                        {t('orders.status.refunded')}
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
            header: t('orders.table.orderNumber'),
            accessorKey: 'order_number',
            cell: ({ row }: { row: TableRow }) => {
                const order = row.original
                return (
                    <div>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-gray-500">
                            {dayjs(order.order_date).format('DD/MM/YYYY HH:mm')}
                        </div>
                    </div>
                )
            },
        },
        {
            header: t('orders.table.customer'),
            accessorKey: 'username',
            cell: ({ row }: { row: TableRow }) => {
                const order = row.original
                return (
                    <div>
                        <div className="font-medium">{order.username}</div>
                        <div className="text-sm text-gray-500">
                            {order.email}
                        </div>
                    </div>
                )
            },
        },
        {
            header: t('orders.table.amount'),
            accessorKey: 'total_money',
            cell: ({ row }: { row: TableRow }) => {
                const order = row.original
                return (
                    <div className="text-right font-medium text-green-600">
                        {formatCurrency(order.total_money)}
                    </div>
                )
            },
        },
        {
            header: t('orders.table.status'),
            accessorKey: 'payment_status',
            cell: ({ row }: { row: TableRow }) =>
                getStatusBadge(row.original.payment_status),
        },
        {
            header: t('orders.table.actions'),
            accessorKey: 'actions',
            cell: ({ row }: { row: TableRow }) => {
                const order = row.original
                return <OrderActions order={order} onView={onView} />
            },
        },
    ]

    return (
        <AdaptableCard>
            <DataTable
                columns={columns}
                data={orders}
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

export default OrderTable
