import { Button } from '@/components/ui'
import { HiOutlineEye } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { Order } from '@/@types/online-learning'

interface OrderActionsProps {
    order: Order
    onView: (order: Order) => void
}

const OrderActions = ({ order, onView }: OrderActionsProps) => {
    const { t } = useTranslation()

    return (
        <div className="flex items-center gap-1">
            <Button
                size="xs"
                variant="twoTone"
                icon={<HiOutlineEye />}
                onClick={() => onView(order)}
            >
                {t('orders.actions.view')}
            </Button>
        </div>
    )
}

export default OrderActions
