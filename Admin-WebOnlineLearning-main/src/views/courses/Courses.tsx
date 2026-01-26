import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/components/ui'
import { Container, ConfirmDialog } from '@/components/shared'
import { apiGetCourses, apiDeleteCourse } from '@/services/CourseService'
import { apiGetCategories } from '@/services/CategoryService'
import { Course, Category } from '@/@types/online-learning'
import { ApiResponse } from '@/@types/user'
import { useTranslation } from 'react-i18next'
import toast from '@/components/ui/toast'
import CoursesHeader from './components/CoursesHeader'
import CoursesTableTools from './components/CoursesTableTools'
import CoursesTable from './components/CoursesTable'
import CourseDetailDialog from './components/CourseDetailDialog'
import { useAppDispatch, useAppSelector, injectReducer } from '@/store'

import reducer, {
    toggleDetailDialog,
    setSelectedCourseDetail,
    SLICE_NAME,
} from './store/courseSlice'

injectReducer(SLICE_NAME, reducer)

interface CourseFilters {
    status: string
    categoryId: string
    search: string
    sortBy: string
    sortOrder: string
}

const Courses = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()

    // Redux state
    const detailDialog = useAppSelector(
        (state) => (state as any)[SLICE_NAME]?.detailDialog || false
    )
    const selectedCourseDetail = useAppSelector(
        (state) => (state as any)[SLICE_NAME]?.selectedCourseDetail || null
    )
    const courseDetailLoading = useAppSelector(
        (state) => (state as any)[SLICE_NAME]?.loading || false
    )

    const [courses, setCourses] = useState<Course[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    })
    const [filters, setFilters] = useState<CourseFilters>({
        status: '',
        categoryId: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    })
    const [searchInput, setSearchInput] = useState('')
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [pendingCourseId, setPendingCourseId] = useState<number | null>(null)

    const fetchCategories = useCallback(async () => {
        try {
            const response = await apiGetCategories()
            const data = response.data as ApiResponse<Category[]>
            console.log('Fetched categories:', data)
            setCategories(data.data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
    }, [])

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true)

            // Only include filters that have values
            const activeFilters: Partial<CourseFilters> = {}
            if (filters.status) activeFilters.status = filters.status
            if (filters.categoryId)
                activeFilters.categoryId = filters.categoryId
            if (filters.search) activeFilters.search = filters.search
            if (filters.sortBy) activeFilters.sortBy = filters.sortBy
            if (filters.sortOrder) activeFilters.sortOrder = filters.sortOrder

            const response = await apiGetCourses({
                page: pagination.page,
                pageSize: pagination.limit,
                ...activeFilters,
            })

            const body: unknown = response.data
            console.log(
                'API Response for courses page',
                pagination.page,
                ':',
                body
            )
            let list: Course[] = []
            let totalCount = 0

            if (body) {
                const resp = body as Record<string, unknown>

                // ApiResponse style: { code, message, data: {...} }
                // where data contains: { data: [], total_elements, current_page, etc }
                if ('code' in resp && resp.code === 0 && resp.data) {
                    const d = resp.data as Record<string, unknown>

                    // Standard pagination response with data array
                    if (Array.isArray(d.data)) {
                        list = d.data as Course[]
                        totalCount =
                            (d.total_elements as number) ??
                            (d.total as number) ??
                            list.length
                    }
                    // Legacy format: data.list
                    else if (Array.isArray(d.list)) {
                        list = d.list as Course[]
                        totalCount =
                            (d.total as number) ??
                            (d.totalElements as number) ??
                            list.length
                    }
                    // Direct array in data
                    else if (Array.isArray(d)) {
                        list = d as unknown as Course[]
                        totalCount = list.length
                    }
                }
                // Direct array response
                else if (Array.isArray(resp.data)) {
                    list = resp.data as Course[]
                    totalCount =
                        (resp.total_elements as number) ??
                        (resp.totalElements as number) ??
                        (resp.total as number) ??
                        list.length
                }
                // Handle nested structures
                else if (resp.data && typeof resp.data === 'object') {
                    const nested = resp.data as Record<string, unknown>
                    if (Array.isArray(nested.data)) {
                        list = nested.data as Course[]
                        totalCount =
                            (nested.total_elements as number) ??
                            (nested.total as number) ??
                            (nested.totalElements as number) ??
                            list.length
                    }
                }
                // Direct array response format
                else if (Array.isArray(body)) {
                    list = body as Course[]
                    totalCount = list.length
                }
            }

            setCourses(list)
            console.log(
                'Setting courses list with',
                list.length,
                'items, total:',
                totalCount
            )
            setPagination((prev) => ({
                ...prev,
                total: totalCount,
            }))
        } catch (error) {
            console.error('Failed to fetch courses:', error)
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('courses.messages.fetchError')}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    useEffect(() => {
        fetchCourses()
    }, [pagination.page, pagination.limit, filters])

    const handleDeleteClick = (id: number) => {
        setPendingCourseId(id)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (pendingCourseId === null) return
        try {
            const response = await apiDeleteCourse(pendingCourseId.toString())
            const data = response.data as ApiResponse
            if (data.code === 0) {
                toast.push(
                    <Notification
                        title={t('courses.messages.deleteSuccess') as string}
                        type="success"
                    >
                        {t('courses.messages.deleteSuccess')}
                    </Notification>
                )
                fetchCourses()
                setDeleteConfirmOpen(false)
                setPendingCourseId(null)
            }
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('courses.messages.deleteError')}
                </Notification>
            )
        }
    }

    const handlePaginationChange = (paginationData: number) => {
        console.log(
            'handlePaginationChange called with:',
            paginationData,
            'will set page to:',
            paginationData
        )
        setPagination((prev) => ({
            ...prev,
            page: paginationData,
        }))
    }

    const handleCloseDetailDialog = () => {
        dispatch(toggleDetailDialog(false))
        dispatch(setSelectedCourseDetail(null))
    }

    return (
        <Container className="h-full">
            <CoursesHeader />

            <CoursesTableTools
                filters={filters}
                categories={categories}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={() => setFilters({ ...filters, search: searchInput })}
                onFiltersChange={setFilters}
            />

            <CoursesTable
                courses={courses}
                loading={loading}
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
                onDelete={handleDeleteClick}
                onRefresh={fetchCourses}
            />

            <CourseDetailDialog
                isOpen={detailDialog}
                courseDetail={selectedCourseDetail}
                loading={courseDetailLoading}
                onClose={handleCloseDetailDialog}
                onRefresh={fetchCourses}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title={t('courses.confirmDelete.title') as string}
                message={t('courses.confirmDelete.message') as string}
                type="danger"
                confirmText={t('courses.confirmDelete.confirm') as string}
                cancelText={t('courses.confirmDelete.cancel') as string}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </Container>
    )
}

export default Courses
