import { Button, Dialog } from '@/components/ui'
import { HiOutlineShoppingCart } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { Order } from '@/@types/online-learning'
import dayjs from 'dayjs'

interface OrderItem {
    id?: string
    course_id: number
    course_type: 'GROUP' | 'INDIVIDUAL'
    course_title: string
    course_price: number
    thumbnail: string
}

interface OrderDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    order: Order | null
}

const OrderDetailDialog = ({
    isOpen,
    onClose,
    order,
}: OrderDetailDialogProps) => {
    const { t } = useTranslation()

    if (!order) return null

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
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs">
                        {t('orders.status.pending')}
                    </span>
                )
            case 'completed':
                return (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        {t('orders.status.completed')}
                    </span>
                )
            case 'failed':
                return (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                        {t('orders.status.failed')}
                    </span>
                )
            case 'refunded':
                return (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {t('orders.status.refunded')}
                    </span>
                )
            default:
                return (
                    <span className="px-2 py-1 rounded text-xs">{status}</span>
                )
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div className="p-6 w-full max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <HiOutlineShoppingCart className="text-2xl text-blue-500" />
                    <div>
                        <h5 className="text-xl font-semibold">
                            {t('orders.detail.title')}: {order.order_number}
                        </h5>
                        <p className="text-gray-600">
                            {dayjs(order.order_date).format('DD/MM/YYYY HH:mm')}
                        </p>
                        {getStatusBadge(order.payment_status)}
                    </div>
                </div>

                <div className="mb-6">
                    <h6 className="font-medium mb-3">
                        {t('orders.detail.customerInfo')}
                    </h6>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-500">
                                {t('orders.detail.username')}
                            </span>{' '}
                            {order.username}
                        </div>
                        <div>
                            <span className="text-gray-500">Email</span>{' '}
                            {order.email}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h6 className="font-medium mb-3">
                        {t('orders.detail.orderDetails')}
                    </h6>
                    {order.order_items?.map(
                        (item: OrderItem, index: number) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg mb-2"
                            >
                                <img
                                    src={item.thumbnail}
                                    alt={item.course_title}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {item.course_title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {item.course_type}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {formatCurrency(item.course_price)}
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="space-y-2">
                        <div className="flex justify-between font-semibold text-lg">
                            <span>{t('orders.detail.total')}</span>
                            <span className="text-green-600">
                                {formatCurrency(order.total_money)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="default" onClick={onClose}>
                        {t('orders.detail.close')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default OrderDetailDialog
