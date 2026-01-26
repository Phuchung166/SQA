import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/components/ui'
import { Container } from '@/components/shared'
import { Order } from '@/@types/online-learning'
import toast from '@/components/ui/toast'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { injectReducer } from '@/store'
import reducer, {
    useAppDispatch,
    useAppSelector,
    getOrders,
    setCurrentPage,
    SLICE_NAME,
} from './store'
import OrderTableTools from './components/OrderTableTools'
import OrderTable from './components/OrderTable'
import OrderDetailDialog from './components/OrderDetailDialog'

injectReducer(SLICE_NAME, reducer)

const Orders = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { orderList, loading, totalElements, currentPage, pageSize } =
        useAppSelector((state) => state.orders.data)

    const [filters, setFilters] = useState({
        paymentStatus: '',
    })
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    // Fetch orders function that only sends non-empty filters
    const fetchOrders = useCallback(() => {
        const params: any = {
            page: currentPage,
            size: pageSize,
        }

        // Only add filter if it has a value
        if (filters.paymentStatus) {
            params.paymentStatus = filters.paymentStatus
        }

        dispatch(getOrders(params))
    }, [dispatch, currentPage, pageSize, filters])

    // Fetch when page or filter changes
    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleExportOrders = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(
                orderList.map((order) => ({
                    [t('orders.table.orderNumber')]: order.order_number,
                    [t('orders.table.customer')]: order.username,
                    Email: order.email,
                    [t('orders.table.amount')]: order.total_money,
                    [t('orders.table.status')]: order.payment_status,
                    [t('orders.table.date')]: dayjs(order.order_date).format(
                        'DD/MM/YYYY HH:mm'
                    ),
                }))
            )
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, t('orders.title') as string)
            XLSX.writeFile(wb, `orders_${dayjs().format('YYYY-MM-DD')}.xlsx`)

            toast.push(
                <Notification
                    title={t('orders.messages.exportSuccess') as string}
                    type="success"
                >
                    {t('orders.messages.exportSuccess')}
                </Notification>
            )
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('orders.messages.exportError')}
                </Notification>
            )
        }
    }

    const handleView = (order: Order) => {
        setSelectedOrder(order)
        setDetailDialogOpen(true)
    }

    const handlePaginationChange = (page: number) => {
        // page from DataTable is 0-indexed, backend expects 1-indexed
        dispatch(setCurrentPage(page + 1))
    }

    const handleFiltersChange = (newFilters: any) => {
        setFilters(newFilters)
        // Reset to page 1 when filters change
        dispatch(setCurrentPage(1))
    }

    return (
        <Container className="h-full">
            <OrderTableTools
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onExport={handleExportOrders}
            />

            <OrderTable
                orders={orderList}
                loading={loading}
                pagination={{
                    total: totalElements,
                    page: currentPage,
                    limit: pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                onView={handleView}
            />

            <OrderDetailDialog
                isOpen={detailDialogOpen}
                order={selectedOrder}
                onClose={() => setDetailDialogOpen(false)}
            />
        </Container>
    )
}

export default Orders
