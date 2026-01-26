import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetInstructors,
    apiApproveInstructor,
    apiRejectInstructor,
    apiSuspendInstructor,
    apiActivateInstructor,
    apiUpdateInstructor,
    apiGetInstructor,
} from '@/services/InstructorService'
import type { Instructor } from '@/@types/online-learning'

type GetInstructorsResponse = {
    current_page: number
    total_pages: number
    total_elements: number
    page_size: number
    data: Instructor[]
}

type InstructorResponse = {
    success: boolean
    message: string
    data: any
}

export type InstructorState = {
    loading: boolean
    instructorList: Instructor[]
    totalElements: number
    pageIndex: number
    pageSize: number
    selectedInstructor: Instructor | null
    search: string
    status: string
    sortBy: string
    sortOrder: string
    deleteDialog: boolean
    createDialog: boolean
    updateDialog: boolean
    detailDialog: boolean
    confirmDialog: boolean
    confirmAction: (() => void) | null
    confirmMessage: string
    actionType: 'approve' | 'reject' | 'suspend' | 'activate' | 'delete' | null
}

export const SLICE_NAME = 'instructors'

export const getInstructors = createAsyncThunk(
    `${SLICE_NAME}/getInstructors`,
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiGetInstructors<GetInstructorsResponse>(
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

export const approveInstructor = createAsyncThunk(
    `${SLICE_NAME}/approveInstructor`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiApproveInstructor<InstructorResponse>(id)
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

export const rejectInstructor = createAsyncThunk(
    `${SLICE_NAME}/rejectInstructor`,
    async (
        { id, reason }: { id: string; reason?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiRejectInstructor<InstructorResponse>(
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

export const suspendInstructor = createAsyncThunk(
    `${SLICE_NAME}/suspendInstructor`,
    async (
        { id, reason }: { id: string; reason?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiSuspendInstructor<InstructorResponse>(
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

export const activateInstructor = createAsyncThunk(
    `${SLICE_NAME}/activateInstructor`,
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await apiActivateInstructor<InstructorResponse>(id)
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

// export const updateInstructor = createAsyncThunk(
//     `${SLICE_NAME}/updateInstructor`,
//     async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
//         try {
//             const response = await apiUpdateInstructor<InstructorResponse>(
//                 id,
//                 data
//             )
//             return response.data
//         } catch (error: any) {
//             return rejectWithValue({
//                 message: error.message,
//                 code: error.code,
//                 status: error.status,
//             })
//         }
//     }
// )

const initialState: InstructorState = {
    loading: false,
    instructorList: [],
    totalElements: 0,
    pageIndex: 1,
    pageSize: 10,
    selectedInstructor: null,
    search: '',
    status: '',
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

const instructorSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setInstructorList: (state, action) => {
            state.instructorList = action.payload
        },
        setSelectedInstructor: (state, action) => {
            state.selectedInstructor = action.payload
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
        builder.addCase(getInstructors.pending, (state) => {
            state.loading = true
        })
        builder.addCase(getInstructors.fulfilled, (state, action) => {
            state.loading = false
            if (action.payload) {
                state.instructorList = action.payload.data
                state.totalElements = action.payload.total_elements
                state.pageIndex = action.payload.current_page
                state.pageSize = action.payload.page_size
            }
        })
        builder.addCase(getInstructors.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(approveInstructor.pending, (state) => {
            state.loading = true
        })
        builder.addCase(approveInstructor.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(approveInstructor.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(rejectInstructor.pending, (state) => {
            state.loading = true
        })
        builder.addCase(rejectInstructor.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(rejectInstructor.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(suspendInstructor.pending, (state) => {
            state.loading = true
        })
        builder.addCase(suspendInstructor.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(suspendInstructor.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(activateInstructor.pending, (state) => {
            state.loading = true
        })
        builder.addCase(activateInstructor.fulfilled, (state) => {
            state.loading = false
            state.confirmDialog = false
        })
        builder.addCase(activateInstructor.rejected, (state) => {
            state.loading = false
        })
        // builder.addCase(updateInstructor.pending, (state) => {
        //     state.loading = true
        // })
        // builder.addCase(updateInstructor.fulfilled, (state) => {
        //     state.loading = false
        //     state.updateDialog = false
        // })
        // builder.addCase(updateInstructor.rejected, (state) => {
        //     state.loading = false
        // })
    },
})

export const {
    setInstructorList,
    setSelectedInstructor,
    setPageIndex,
    setPageSize,
    setSearch,
    setStatus,
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
} = instructorSlice.actions

export default instructorSlice.reducer
