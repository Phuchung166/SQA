import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/components/ui'
import { Container } from '@/components/shared'
import { InstructorIncome } from '@/@types/online-learning'
import toast from '@/components/ui/toast'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { injectReducer } from '@/store'
import reducer, {
    useAppDispatch,
    useAppSelector,
    getInstructorIncomes,
    setCurrentPage,
    SLICE_NAME,
} from './store'
import InstructorIncomeTableTools from './components/InstructorIncomeTableTools'
import InstructorIncomeTable from './components/InstructorIncomeTable'
import PaymentConfirmDialog from './components/PaymentConfirmDialog'

injectReducer(SLICE_NAME, reducer)

const InstructorIncomeMonthly = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { incomeList, loading, totalElements, currentPage, pageSize } =
        useAppSelector((state) => state.instructorIncome.data)

    const [filters, setFilters] = useState<{
        year: number | null
        month: number | null
        paymentStatus: string
    }>({
        year: null,
        month: null,
        paymentStatus: '',
    })

    const [selectedIncome, setSelectedIncome] =
        useState<InstructorIncome | null>(null)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

    // Fetch instructor incomes function that only sends non-empty filters
    const fetchInstructorIncomes = useCallback(() => {
        const params: any = {
            page: currentPage,
            size: pageSize,
        }

        // Only add filters if they have values
        if (filters.year !== null) {
            params.year = filters.year
        }
        if (filters.month !== null) {
            params.month = filters.month
        }
        if (filters.paymentStatus) {
            params.paymentStatus = filters.paymentStatus
        }

        dispatch(getInstructorIncomes(params) as any)
    }, [dispatch, currentPage, pageSize, filters])

    // Fetch when page or filter changes
    useEffect(() => {
        fetchInstructorIncomes()
    }, [fetchInstructorIncomes])

    const handleExportIncomes = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(
                incomeList.map((income) => ({
                    [t('instructorIncome.table.period')]: `${t(
                        `instructorIncome.months.${income.month}`
                    )} ${income.year}`,
                    [t(
                        'instructorIncome.table.instructor'
                    )]: `${income.last_name} ${income.first_name}`,
                    [t('instructorIncome.table.accountName')]:
                        income.account_name,
                    Email: income.email,
                    [t('instructorIncome.table.bankName')]: income.bank_name,
                    [t('instructorIncome.table.bankAccount')]:
                        income.bank_account,
                    [t('instructorIncome.table.totalEarning')]:
                        income.total_earning,
                    [t('instructorIncome.table.paymentStatus')]: t(
                        `instructorIncome.status.${income.payment_status.toLowerCase()}`
                    ),
                    [t('instructorIncome.table.paidAt')]: income.paid_at
                        ? dayjs(income.paid_at).format('DD/MM/YYYY HH:mm')
                        : t('instructorIncome.table.notPaid'),
                }))
            )
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(
                wb,
                ws,
                t('instructorIncome.title') as string
            )
            XLSX.writeFile(
                wb,
                `instructor_income_${dayjs().format('YYYY-MM-DD')}.xlsx`
            )

            toast.push(
                <Notification
                    title={
                        t('instructorIncome.messages.exportSuccess') as string
                    }
                    type="success"
                >
                    {t('instructorIncome.messages.exportSuccess')}
                </Notification>
            )
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('instructorIncome.messages.exportError')}
                </Notification>
            )
        }
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

    const handleConfirmPayment = (income: InstructorIncome) => {
        setSelectedIncome(income)
        setConfirmDialogOpen(true)
    }

    const handleConfirmPaymentSubmit = (income: InstructorIncome) => {
        // TODO: Call API to update payment status
        console.log('Confirming payment for:', income)

        toast.push(
            <Notification
                title={t('instructorIncome.messages.paymentSuccess') as string}
                type="success"
            >
                {t('instructorIncome.messages.paymentSuccessDesc', {
                    instructor: `${income.last_name} ${income.first_name}`,
                })}
            </Notification>
        )

        setConfirmDialogOpen(false)
        setSelectedIncome(null)

        // Refresh data
        fetchInstructorIncomes()
    }

    return (
        <Container className="h-full">
            <InstructorIncomeTableTools
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onExport={handleExportIncomes}
            />

            <InstructorIncomeTable
                incomes={incomeList}
                loading={loading}
                pagination={{
                    total: totalElements,
                    page: currentPage,
                    limit: pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                onConfirmPayment={handleConfirmPayment}
            />

            <PaymentConfirmDialog
                isOpen={confirmDialogOpen}
                income={selectedIncome}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmPaymentSubmit}
            />
        </Container>
    )
}

export default InstructorIncomeMonthly
