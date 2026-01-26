import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetStudents,
    apiGetStudent,
    apiSuspendStudent,
    apiActivateStudent,
    apiDeleteStudent,
    apiGetStudentEnrollments,
} from '@/services/StudentService'
import type { Student, User } from '@/@types/user'

type GetStudentsResponse = {
    current_page: number
    total_pages: number
    total_elements: number
    page_size: number
    students: Student[]
}

type StudentResponse = {
    success: boolean
    message: string
    data: any
}

export type StudentState = {
    loading: boolean
    studentList: Student[]
    totalElements: number
    pageIndex: number
    pageSize: number
    selectedStudent: Student | null
    search: string
    sortBy: string
    sortOrder: string
    detailDialog: boolean
    suspendDialog: boolean
    confirmDialog: boolean
    confirmAction: (() => void) | null
    confirmMessage: string
    suspensionReason: string
    enrollments: any[]
    enrollmentsLoading: boolean
}

export const SLICE_NAME = 'students'

export const getStudents = createAsyncThunk(
    `${SLICE_NAME}/getStudents`,
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiGetStudents<GetStudentsResponse>(data)
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

export const getStudent = createAsyncThunk(
    `${SLICE_NAME}/getStudent`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiGetStudent<StudentResponse>(id)
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

export const suspendStudent = createAsyncThunk(
    `${SLICE_NAME}/suspendStudent`,
    async (
        { id, reason }: { id: string; reason?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiSuspendStudent<StudentResponse>(
                id,
                reason
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

export const activateStudent = createAsyncThunk(
    `${SLICE_NAME}/activateStudent`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiActivateStudent<StudentResponse>(id)
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

export const deleteStudent = createAsyncThunk(
    `${SLICE_NAME}/deleteStudent`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiDeleteStudent<StudentResponse>(id)
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

export const getStudentEnrollments = createAsyncThunk(
    `${SLICE_NAME}/getStudentEnrollments`,
    async (
        { id, params }: { id: string; params?: any },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiGetStudentEnrollments<any>(id, params)
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

const initialState: StudentState = {
    loading: false,
    studentList: [],
    totalElements: 0,
    pageIndex: 1,
    pageSize: 10,
    selectedStudent: null,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    detailDialog: false,
    suspendDialog: false,
    confirmDialog: false,
    confirmAction: null,
    confirmMessage: '',
    suspensionReason: '',
    enrollments: [],
    enrollmentsLoading: false,
}

const studentSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setStudentList: (state, action) => {
            state.studentList = action.payload
        },
        setSelectedStudent: (state, action) => {
            state.selectedStudent = action.payload
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
        setSortBy: (state, action) => {
            state.sortBy = action.payload
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload
        },
        toggleDetailDialog: (state, action) => {
            state.detailDialog = action.payload
        },
        toggleSuspendDialog: (state, action) => {
            state.suspendDialog = action.payload
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
        setSuspensionReason: (state, action) => {
            state.suspensionReason = action.payload
        },
        setEnrollments: (state, action) => {
            state.enrollments = action.payload
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(getStudents.pending, (state) => {
            state.loading = true
        })
        builder.addCase(getStudents.fulfilled, (state, action) => {
            state.loading = false
            if (action.payload) {
                state.studentList = action.payload.students
                state.totalElements = action.payload.total_elements
                state.pageIndex = action.payload.current_page
                state.pageSize = action.payload.page_size
            }
        })
        builder.addCase(getStudents.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(getStudent.pending, (state) => {
            state.loading = true
        })
        builder.addCase(getStudent.fulfilled, (state, action) => {
            state.loading = false
            if (action.payload.success) {
                state.selectedStudent = action.payload.data
            }
        })
        builder.addCase(getStudent.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(suspendStudent.pending, (state) => {
            state.loading = true
        })
        builder.addCase(suspendStudent.fulfilled, (state) => {
            state.loading = false
            state.suspendDialog = false
            state.confirmDialog = false
        })
        builder.addCase(suspendStudent.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(activateStudent.pending, (state) => {
            state.loading = true
        })
        builder.addCase(activateStudent.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(activateStudent.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(deleteStudent.pending, (state) => {
            state.loading = true
        })
        builder.addCase(deleteStudent.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(deleteStudent.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(getStudentEnrollments.pending, (state) => {
            state.enrollmentsLoading = true
        })
        builder.addCase(getStudentEnrollments.fulfilled, (state, action) => {
            state.enrollmentsLoading = false
            if (action.payload.success) {
                state.enrollments = action.payload.data.enrollments || []
            }
        })
        builder.addCase(getStudentEnrollments.rejected, (state) => {
            state.enrollmentsLoading = false
        })
    },
})

export const {
    setStudentList,
    setSelectedStudent,
    setPageIndex,
    setPageSize,
    setSearch,
    setSortBy,
    setSortOrder,
    toggleDetailDialog,
    toggleSuspendDialog,
    toggleConfirmDialog,
    setConfirmAction,
    setConfirmMessage,
    setSuspensionReason,
    setEnrollments,
    resetState,
} = studentSlice.actions

export default studentSlice.reducer
