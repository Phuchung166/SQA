import { useState } from 'react'
import { Dialog, Button, Checkbox } from '@/components/ui'
import { InstructorIncome } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'

interface PaymentConfirmDialogProps {
    isOpen: boolean
    income: InstructorIncome | null
    onClose: () => void
    onConfirm: (income: InstructorIncome) => void
}

const PaymentConfirmDialog = ({
    isOpen,
    income,
    onClose,
    onConfirm,
}: PaymentConfirmDialogProps) => {
    const { t } = useTranslation()
    const [isConfirmed, setIsConfirmed] = useState(false)

    const handleClose = () => {
        setIsConfirmed(false)
        onClose()
    }

    const handleConfirm = () => {
        if (income && isConfirmed) {
            onConfirm(income)
            setIsConfirmed(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    if (!income) return null

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={600}>
            <div className="flex flex-col h-full">
                <h5 className="mb-4 text-xl font-bold">
                    {t('instructorIncome.confirmDialog.title')}
                </h5>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                                {t('instructorIncome.confirmDialog.instructor')}:
                            </span>
                            <span className="font-semibold">
                                {income.last_name} {income.first_name}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                                {t('instructorIncome.confirmDialog.period')}:
                            </span>
                            <span className="font-semibold">
                                {t(`instructorIncome.months.${income.month}`)} /{' '}
                                {income.year}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                                {t('instructorIncome.confirmDialog.amount')}:
                            </span>
                            <span className="font-semibold text-green-600 text-lg">
                                {formatCurrency(income.total_earning)}
                            </span>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {t('instructorIncome.confirmDialog.bankName')}:
                                </span>
                                <span className="font-medium">
                                    {income.bank_name}
                                </span>
                            </div>

                            <div className="flex justify-between mt-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {t(
                                        'instructorIncome.confirmDialog.bankAccount'
                                    )}
                                    :
                                </span>
                                <span className="font-medium font-mono">
                                    {income.bank_account}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Checkbox
                            checked={isConfirmed}
                            onChange={(checked) => setIsConfirmed(checked)}
                        />
                        <label
                            className="text-sm cursor-pointer select-none"
                            onClick={() => setIsConfirmed(!isConfirmed)}
                        >
                            {t('instructorIncome.confirmDialog.confirmCheckbox')}
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-auto">
                    <Button variant="plain" onClick={handleClose}>
                        {t('instructorIncome.confirmDialog.cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleConfirm}
                        disabled={!isConfirmed}
                    >
                        {t('instructorIncome.confirmDialog.confirm')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default PaymentConfirmDialog

