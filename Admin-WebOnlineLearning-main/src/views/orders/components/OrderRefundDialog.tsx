import { Button, Input, Dialog } from '@/components/ui'
import { HiOutlineExclamation } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { Order } from '@/@types/online-learning'

interface OrderRefundDialogProps {
    isOpen: boolean
    onClose: () => void
    order: Order | null
    refundData: {
        amount: number
        reason: string
    }
    onRefundDataChange: (data: { amount: number; reason: string }) => void
    onConfirm: () => void
}

const OrderRefundDialog = ({
    isOpen,
    onClose,
    order,
    refundData,
    onRefundDataChange,
    onConfirm,
}: OrderRefundDialogProps) => {
    const { t } = useTranslation()

    if (!order) return null

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onRefundDataChange({
            ...refundData,
            amount: parseFloat(e.target.value) || 0,
        })
    }

    const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onRefundDataChange({
            ...refundData,
            reason: e.target.value,
        })
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div className="p-6 w-full max-w-lg">
                <div className="flex items-center gap-3 mb-4">
                    <HiOutlineExclamation className="text-2xl text-orange-500" />
                    <h5 className="text-lg font-semibold">
                        {t('orders.refund.title')}
                    </h5>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        {t('orders.refund.orderLabel')}{' '}
                        <strong>{order.order_number}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                        {t('orders.refund.maxAmount')}{' '}
                        <strong>{formatCurrency(order.final_amount)}</strong>
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('orders.refund.amountLabel')}
                        </label>
                        <Input
                            type="number"
                            placeholder={
                                t('orders.refund.amountPlaceholder') as string
                            }
                            value={refundData.amount}
                            max={order.final_amount}
                            onChange={handleAmountChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('orders.refund.reasonLabel')}
                        </label>
                        <Input
                            placeholder={
                                t('orders.refund.reasonPlaceholder') as string
                            }
                            value={refundData.reason}
                            onChange={handleReasonChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="default" onClick={onClose}>
                        {t('orders.refund.cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        color="orange-600"
                        disabled={!refundData.amount || !refundData.reason}
                        onClick={onConfirm}
                    >
                        {t('orders.refund.confirm')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default OrderRefundDialog
