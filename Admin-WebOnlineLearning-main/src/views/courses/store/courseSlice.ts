import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetCourses,
    apiCreateCourse,
    apiUpdateCourse,
    apiDeleteCourse,
    apiGetCourse,
    apiPublishCourse,
    apiUnpublishCourse,
    apiApproveOrRejectCourse,
} from '@/services/CourseService'
import type { Course, CourseDetail } from '@/@types/online-learning'

type GetCoursesResponse = {
    success: boolean
    data: {
        courses: Course[]
        total: number
        page: number
        pageSize: number
    }
}

type CourseResponse = {
    success: boolean
    message: string
    data: any
}

type GetCourseDetailResponse = {
    success: boolean
    data: CourseDetail
}

export type CourseState = {
    loading: boolean
    courseList: Course[]
    totalElements: number
    pageIndex: number
    pageSize: number
    selectedCourse: Course | null
    selectedCourseDetail: CourseDetail | null
    search: string
    status: string
    category: string
    instructor: string
    sortBy: string
    sortOrder: string
    deleteDialog: boolean
    createDialog: boolean
    updateDialog: boolean
    detailDialog: boolean
    confirmDialog: boolean
    confirmAction: (() => void) | null
    confirmMessage: string
    actionType: 'publish' | 'unpublish' | 'delete' | null
}

export const SLICE_NAME = 'courses'

export const getCourses = createAsyncThunk(
    `${SLICE_NAME}/getCourses`,
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiGetCourses<GetCoursesResponse>(data)
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

export const createCourse = createAsyncThunk(
    `${SLICE_NAME}/createCourse`,
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiCreateCourse<CourseResponse, any>(data)
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

export const updateCourse = createAsyncThunk(
    `${SLICE_NAME}/updateCourse`,
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiUpdateCourse<CourseResponse, any>(
                id,
                data
            )
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

export const deleteCourse = createAsyncThunk(
    `${SLICE_NAME}/deleteCourse`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiDeleteCourse<CourseResponse>(id)
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

export const publishCourse = createAsyncThunk(
    `${SLICE_NAME}/publishCourse`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiPublishCourse<CourseResponse>(id)
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

export const unpublishCourse = createAsyncThunk(
    `${SLICE_NAME}/unpublishCourse`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiUnpublishCourse<CourseResponse>(id)
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

export const getCourseDetail = createAsyncThunk(
    `${SLICE_NAME}/getCourseDetail`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiGetCourse<GetCourseDetailResponse>(id)
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

export const approveOrRejectCourse = createAsyncThunk(
    `${SLICE_NAME}/approveOrRejectCourse`,
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await apiApproveOrRejectCourse<
                CourseResponse,
                any
            >(id, data)
            return response.data
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                code: error.code,
                status: error.status,
            })
        }
    }
)

const initialState: CourseState = {
    loading: false,
    courseList: [],
    totalElements: 0,
    pageIndex: 1,
    pageSize: 10,
    selectedCourse: null,
    selectedCourseDetail: null,
    search: '',
    status: '',
    category: '',
    instructor: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    deleteDialog: false,
    createDialog: false,
    updateDialog: false,
    detailDialog: false,
    confirmDialog: false,
    confirmAction: null,
    confirmMessage: '',
    actionType: null,
}

const courseSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setCourseList: (state, action) => {
            state.courseList = action.payload
        },
        setSelectedCourse: (state, action) => {
            state.selectedCourse = action.payload
        },
        setSelectedCourseDetail: (state, action) => {
            state.selectedCourseDetail = action.payload
        },
        setPageIndex: (state, action) => {
            state.pageIndex = action.payload
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload
        },
        setSearch: (state, action) => {
            state.search = action.payload
        },
        setStatus: (state, action) => {
            state.status = action.payload
        },
        setCategory: (state, action) => {
            state.category = action.payload
        },
        setInstructor: (state, action) => {
            state.instructor = action.payload
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload
        },
        toggleDeleteDialog: (state, action) => {
            state.deleteDialog = action.payload
        },
        toggleCreateDialog: (state, action) => {
            state.createDialog = action.payload
        },
        toggleUpdateDialog: (state, action) => {
            state.updateDialog = action.payload
        },
        toggleDetailDialog: (state, action) => {
            state.detailDialog = action.payload
        },
        toggleConfirmDialog: (state, action) => {
            state.confirmDialog = action.payload
        },
        setConfirmAction: (state, action) => {
            state.confirmAction = action.payload
        },
        setConfirmMessage: (state, action) => {
            state.confirmMessage = action.payload
        },
        setActionType: (state, action) => {
            state.actionType = action.payload
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(getCourses.pending, (state) => {
            state.loading = true
        })
        builder.addCase(getCourses.fulfilled, (state, action) => {
            state.loading = false
            if (action.payload.success) {
                state.courseList = action.payload.data.courses
                state.totalElements = action.payload.data.total
            }
        })
        builder.addCase(getCourses.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(createCourse.pending, (state) => {
            state.loading = true
        })
        builder.addCase(createCourse.fulfilled, (state) => {
            state.loading = false
            state.createDialog = false
        })
        builder.addCase(createCourse.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(updateCourse.pending, (state) => {
            state.loading = true
        })
        builder.addCase(updateCourse.fulfilled, (state) => {
            state.loading = false
            state.updateDialog = false
        })
        builder.addCase(updateCourse.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(deleteCourse.pending, (state) => {
            state.loading = true
        })
        builder.addCase(deleteCourse.fulfilled, (state) => {
            state.loading = false
            state.deleteDialog = false
            state.confirmDialog = false
        })
        builder.addCase(deleteCourse.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(publishCourse.pending, (state) => {
            state.loading = true
        })
        builder.addCase(publishCourse.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(publishCourse.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(unpublishCourse.pending, (state) => {
            state.loading = true
        })
        builder.addCase(unpublishCourse.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(unpublishCourse.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(getCourseDetail.pending, (state) => {
            console.log('getCourseDetail.pending')
            state.loading = true
        })
        builder.addCase(getCourseDetail.fulfilled, (state, action) => {
            console.log('getCourseDetail.fulfilled', action.payload)
            state.loading = false
            state.detailDialog = true
            // Handle different API response formats
            if (action.payload) {
                // Format 1: { success: true, data: {...} }
                if (action.payload.success && action.payload.data) {
                    state.selectedCourseDetail = action.payload.data
                    console.log('Course detail loaded successfully (format 1)')
                }
                // Format 2: Direct data object
                else if ('id' in action.payload) {
                    state.selectedCourseDetail =
                        action.payload as unknown as CourseDetail
                    console.log('Course detail loaded successfully (format 2)')
                }
                // Format 3: { code: 0, data: {...} }
                else if (
                    'code' in action.payload &&
                    (action.payload as Record<string, unknown>).code === 0
                ) {
                    state.selectedCourseDetail = (
                        action.payload as Record<string, unknown>
                    ).data as CourseDetail
                    console.log('Course detail loaded successfully (format 3)')
                } else {
                    console.log('Unexpected response format:', action.payload)
                }
            }
        })
        builder.addCase(getCourseDetail.rejected, (state, action) => {
            console.log('getCourseDetail.rejected', action)
            state.loading = false
            // Keep dialog open to show error message
            state.detailDialog = true
            state.selectedCourseDetail = null
        })
        builder.addCase(approveOrRejectCourse.pending, (state) => {
            state.loading = true
        })
        builder.addCase(approveOrRejectCourse.fulfilled, (state) => {
            state.loading = false
        })
        builder.addCase(approveOrRejectCourse.rejected, (state) => {
            state.loading = false
        })
    },
})

export const {
    setCourseList,
    setSelectedCourse,
    setSelectedCourseDetail,
    setPageIndex,
    setPageSize,
    setSearch,
    setStatus,
    setCategory,
    setInstructor,
    setSortBy,
    setSortOrder,
    toggleDeleteDialog,
    toggleCreateDialog,
    toggleUpdateDialog,
    toggleDetailDialog,
    toggleConfirmDialog,
    setConfirmAction,
    setConfirmMessage,
    setActionType,
    resetState,
} = courseSlice.actions

export default courseSlice.reducer
