import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/components/ui'
import { Container, ConfirmDialog } from '@/components/shared'
import {
    apiGetStudents,
    apiSuspendStudent,
    apiActivateStudent,
    apiDeleteStudent,
    apiGetStudentEnrollments,
} from '@/services/StudentService'
import {
    Student,
    User,
    ApiResponse,
    PaginatedResponse,
    Enrollment,
} from '@/@types/user'
import { useTranslation } from 'react-i18next'
import toast from '@/components/ui/toast'
import StudentsHeader from './components/StudentsHeader'
import StudentsTableTools from './components/StudentsTableTools'
import StudentsTable from './components/StudentsTable'
import StudentDetailDialog from './components/StudentDetailDialog'

const Students = () => {
    const { t } = useTranslation()
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    })
    const [filters, setFilters] = useState({
        status: '',
        search: '',
    })
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>(
        []
    )
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false)
    const [suspendReason, setSuspendReason] = useState('')
    const [pendingEmail, setPendingEmail] = useState<string | null>(null)

    const fetchStudents = useCallback(async () => {
        setLoading(true)
        try {
            const response = await apiGetStudents({
                page: pagination.page,
                pageSize: pagination.pageSize,
                search: filters.search || undefined,
            })

            const body: unknown = response.data
            let list: Student[] = []
            let totalCount = 0

            if (body) {
                const resp = body as Record<string, unknown>

                // ApiResponse style: { code, message, data: {...} }
                // where data contains: { data: [], total_elements, current_page, etc }
                if ('code' in resp && resp.code === 0 && resp.data) {
                    const d = resp.data as Record<string, unknown>

                    // Standard pagination response with data array
                    if (Array.isArray(d.data)) {
                        list = d.data as Student[]
                        totalCount =
                            (d.total_elements as number) ??
                            (d.total as number) ??
                            list.length
                    }
                    // Legacy format: data.list
                    else if (Array.isArray(d.list)) {
                        list = d.list as Student[]
                        totalCount =
                            (d.total as number) ??
                            (d.totalElements as number) ??
                            list.length
                    }
                    // Direct array in data
                    else if (Array.isArray(d)) {
                        list = d as unknown as Student[]
                        totalCount = list.length
                    }
                }
                // Direct array response
                else if (Array.isArray(resp.data)) {
                    list = resp.data as Student[]
                    totalCount =
                        (resp.total_elements as number) ??
                        (resp.totalElements as number) ??
                        (resp.total as number) ??
                        list.length
                }
            }

            setStudents(list)
            setPagination((prev) => ({
                ...prev,
                total: totalCount,
            }))
        } catch (error) {
            console.error('Failed to fetch students:', error)
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('students.messages.fetchError')}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.pageSize, filters, t])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    const fetchStudentEnrollments = async (studentEmail: string) => {
        try {
            const response = await apiGetStudentEnrollments(studentEmail)
            const data = response.data as ApiResponse<Enrollment[]>
            if (data.code === 0) {
                setStudentEnrollments(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error)
        }
    }

    const handleSuspendClick = (email: string) => {
        setPendingEmail(email)
        setSuspendReason('')
        setSuspendConfirmOpen(true)
    }

    const handleSuspendConfirm = async () => {
        if (!pendingEmail || !suspendReason.trim()) return

        try {
            const response = await apiSuspendStudent(
                pendingEmail,
                suspendReason
            )
            const data = response.data as ApiResponse
            if (data.code === 0) {
                toast.push(
                    <Notification
                        title={t('students.messages.suspendSuccess') as string}
                        type="success"
                    >
                        {t('students.messages.suspendSuccess')}
                    </Notification>
                )
                fetchStudents()
                setSuspendConfirmOpen(false)
                setSuspendReason('')
                setPendingEmail(null)
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('students.messages.suspendError')}
                </Notification>
            )
        }
    }

    const handleActivate = async (email: string) => {
        try {
            const response = await apiActivateStudent(email)
            const data = response.data as ApiResponse
            if (data.code === 0) {
                toast.push(
                    <Notification
                        title={t('students.messages.activateSuccess') as string}
                        type="success"
                    >
                        {t('students.messages.activateSuccess')}
                    </Notification>
                )
                fetchStudents()
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('students.messages.activateError')}
                </Notification>
            )
        }
    }

    const handleDeleteClick = (email: string) => {
        setPendingEmail(email)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!pendingEmail) return

        try {
            const response = await apiDeleteStudent(pendingEmail)
            const data = response.data as ApiResponse
            if (data.code === 0) {
                toast.push(
                    <Notification
                        title={t('students.messages.deleteSuccess') as string}
                        type="success"
                    >
                        {t('students.messages.deleteSuccess')}
                    </Notification>
                )
                fetchStudents()
                setDeleteConfirmOpen(false)
                setPendingEmail(null)
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('students.messages.deleteError')}
                </Notification>
            )
        }
    }

    const handleViewDetail = async (student: Student) => {
        setSelectedStudent(student)
        if (student.email) {
            await fetchStudentEnrollments(student.email)
        }
        setDetailDialogOpen(true)
    }

    const handlePaginationChange = (page: number) => {
        setPagination((prev) => ({
            ...prev,
            page: page,
        }))
    }

    return (
        <Container className="h-full">
            <StudentsHeader />

            <StudentsTableTools
                filters={filters}
                onFiltersChange={setFilters}
            />

            <StudentsTable
                students={students}
                loading={loading}
                pagination={{
                    total: pagination.total,
                    page: pagination.page,
                    limit: pagination.pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                onView={handleViewDetail}
                // onSuspend={handleSuspendClick}
                // onActivate={handleActivate}
                onDelete={handleDeleteClick}
            />

            <StudentDetailDialog
                isOpen={detailDialogOpen}
                student={selectedStudent}
                enrollments={studentEnrollments}
                onClose={() => setDetailDialogOpen(false)}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title={t('students.confirmDelete.title') as string}
                message={t('students.confirmDelete.message') as string}
                type="danger"
                confirmText={t('students.confirmDelete.confirm') as string}
                cancelText={t('students.confirmDelete.cancel') as string}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </Container>
    )
}

export default Students
