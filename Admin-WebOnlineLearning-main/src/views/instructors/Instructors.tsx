import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/components/ui'
import { Container, ConfirmDialog } from '@/components/shared'
import {
    apiGetInstructors,
    apiApproveInstructor,
    apiRejectInstructor,
    apiSuspendInstructor,
    apiActivateInstructor,
} from '@/services/InstructorService'
import { Instructor } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'
import toast from '@/components/ui/toast'
import InstructorsHeader from './components/InstructorsHeader'
import InstructorsTableTools from './components/InstructorsTableTools'
import InstructorsTable from './components/InstructorsTable'
import InstructorDetailDialog from './components/InstructorDetailDialog'

const Instructors = () => {
    const { t } = useTranslation()

    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    })
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    })
    const [selectedInstructor, setSelectedInstructor] =
        useState<Instructor | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false)
    const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)
    const [suspendReason, setSuspendReason] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [pendingInstructorId, setPendingInstructorId] = useState<
        string | null
    >(null)
    const [actionType, setActionType] = useState<'suspend' | 'reject' | null>(
        null
    )

    const fetchInstructors = useCallback(async () => {
        setLoading(true)
        try {
            const params: any = {
                page: pagination.page,
                pageSize: pagination.pageSize,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            }

            // Chỉ thêm search nếu có giá trị
            if (filters.search) {
                params.search = filters.search
            }

            const response = await apiGetInstructors(params)
            const data = response.data as {
                current_page: number
                total_pages: number
                total_elements: number
                data: Instructor[]
            }

            setInstructors(data.data)
            setPagination((prev) => ({
                ...prev,
                total: data.total_elements,
            }))
        } catch (error) {
            console.error('Failed to fetch instructors:', error)
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('instructors.messages.fetchError')}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.pageSize, filters, t])

    useEffect(() => {
        fetchInstructors()
    }, [fetchInstructors])

    const handleApprove = async (id: string) => {
        try {
            const response = await apiApproveInstructor(id)
            const data = response.data as { success: boolean; message: string }
            if (data.success) {
                toast.push(
                    <Notification
                        title={
                            t('instructors.messages.approveSuccess') as string
                        }
                        type="success"
                    >
                        {t('instructors.messages.approveSuccess')}
                    </Notification>
                )
                fetchInstructors()
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('instructors.messages.approveError')}
                </Notification>
            )
        }
    }

    const handleRejectClick = (id: string) => {
        setPendingInstructorId(id)
        setRejectReason('')
        setActionType('reject')
        setRejectConfirmOpen(true)
    }

    const handleRejectConfirm = async () => {
        if (!pendingInstructorId || !rejectReason.trim()) return
        try {
            const response = await apiRejectInstructor(
                pendingInstructorId,
                rejectReason
            )
            const data = response.data as {
                success: boolean
                message: string
            }
            if (data.success) {
                toast.push(
                    <Notification
                        title={
                            t('instructors.messages.rejectSuccess') as string
                        }
                        type="success"
                    >
                        {t('instructors.messages.rejectSuccess')}
                    </Notification>
                )
                fetchInstructors()
                setRejectConfirmOpen(false)
                setRejectReason('')
                setPendingInstructorId(null)
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('instructors.messages.rejectError')}
                </Notification>
            )
        }
    }

    const handleSuspendClick = (id: string) => {
        setPendingInstructorId(id)
        setSuspendReason('')
        setActionType('suspend')
        setSuspendConfirmOpen(true)
    }

    const handleSuspendConfirm = async () => {
        if (!pendingInstructorId || !suspendReason.trim()) return
        try {
            const response = await apiSuspendInstructor(
                pendingInstructorId,
                suspendReason
            )
            const data = response.data as {
                success: boolean
                message: string
            }
            if (data.success) {
                toast.push(
                    <Notification
                        title={
                            t('instructors.messages.suspendSuccess') as string
                        }
                        type="success"
                    >
                        {t('instructors.messages.suspendSuccess')}
                    </Notification>
                )
                fetchInstructors()
                setSuspendConfirmOpen(false)
                setSuspendReason('')
                setPendingInstructorId(null)
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('instructors.messages.suspendError')}
                </Notification>
            )
        }
    }

    const handleActivate = async (id: string) => {
        try {
            const response = await apiActivateInstructor(id)
            const data = response.data as { success: boolean; message: string }
            if (data.success) {
                toast.push(
                    <Notification
                        title={
                            t('instructors.messages.activateSuccess') as string
                        }
                        type="success"
                    >
                        {t('instructors.messages.activateSuccess')}
                    </Notification>
                )
                fetchInstructors()
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('instructors.messages.activateError')}
                </Notification>
            )
        }
    }

    const handleViewDetail = (instructor: Instructor) => {
        setSelectedInstructor(instructor)
        setDetailDialogOpen(true)
    }

    const handlePaginationChange = (page: number) => {
        console.log(
            'handlePaginationChange called with:',
            page,
            'will set page to:',
            page
        )
        setPagination((prev) => ({
            ...prev,
            page: page,
        }))
    }

    const handleSearchChange = (search: string) => {
        setPagination((prev) => ({
            ...prev,
            page: 1,
        }))
        setFilters((prev) => ({
            ...prev,
            search,
        }))
    }

    const handleSortChange = (sortBy: string, sortOrder: string) => {
        setFilters((prev) => ({
            ...prev,
            sortBy,
            sortOrder,
        }))
    }

    return (
        <Container className="h-full">
            <InstructorsHeader />

            <InstructorsTableTools
                filters={filters}
                onFiltersChange={setFilters}
            />

            <InstructorsTable
                instructors={instructors}
                loading={loading}
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
                onView={handleViewDetail}
                onApprove={handleApprove}
                onReject={handleRejectClick}
                onSuspend={handleSuspendClick}
                onActivate={handleActivate}
            />

            <InstructorDetailDialog
                isOpen={detailDialogOpen}
                instructor={selectedInstructor}
                onClose={() => setDetailDialogOpen(false)}
            />

            <ConfirmDialog
                isOpen={suspendConfirmOpen}
                title={t('instructors.confirmSuspend.title') as string}
                message={t('instructors.confirmSuspend.message') as string}
                type="warning"
                confirmText={t('instructors.confirmSuspend.confirm') as string}
                cancelText={t('instructors.confirmSuspend.cancel') as string}
                onClose={() => setSuspendConfirmOpen(false)}
                onConfirm={handleSuspendConfirm}
            />

            <ConfirmDialog
                isOpen={rejectConfirmOpen}
                title={t('instructors.confirmReject.title') as string}
                message={t('instructors.confirmReject.message') as string}
                type="danger"
                confirmText={t('instructors.confirmReject.confirm') as string}
                cancelText={t('instructors.confirmReject.cancel') as string}
                onClose={() => setRejectConfirmOpen(false)}
                onConfirm={handleRejectConfirm}
            />
        </Container>
    )
}

export default Instructors
