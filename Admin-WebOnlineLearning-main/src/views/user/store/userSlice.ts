import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiApproveUser, apiDeleteUser, apiGetListUsers } from '@/services/UserService'
import type { User } from '@/@types/user'

type GetUsersResponse = {
    code: number
    message: string
    data: User[]
}

type ApproveUserResponse = {
    code: number
    message: string
    data: boolean
}

type DeleteUserResponse = {
    code: number
    message: string
    data: boolean
}

export type UserState = {
    loading: boolean
    userList: User[]
    totalElements: number
    pageIndex: number
    pageSize: number
    selectedUser: User | null
    username: string
    email: string
    phone: string
    deleteDialog: boolean
    updateDialog: boolean
}

export const SLICE_NAME = 'users'

export const getUsers = createAsyncThunk(
    `${SLICE_NAME}/getUsers`,
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiGetListUsers<GetUsersResponse>(data)
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

export const approveUsers = createAsyncThunk(
    `${SLICE_NAME}/approveUsers`,
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiApproveUser<ApproveUserResponse>(data)
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
export const deleteUsers = createAsyncThunk(
    `${SLICE_NAME}/deleteUsers`,
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await apiDeleteUser<DeleteUserResponse>(data)
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
const initialState: UserState = {
    loading: false,
    userList: [],
    totalElements: 0,
    pageIndex: 1,
    pageSize: 10,
    selectedUser: null,
    username: '',
    email: '',
    phone: '',
    deleteDialog: false,
    updateDialog: false,
}

const userSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setUserList: (state, action) => {
            state.userList = action.payload
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload
        },
        setPageIndex: (state, action) => {
            state.pageIndex = action.payload
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload
        },
        setUsername: (state, action) => {
            state.username = action.payload
        },
        setEmail: (state, action) => {
            state.email = action.payload
        },
        setPhone: (state, action) => {
            state.phone = action.payload
        },
        toggleDeleteDialog: (state, action) => {
            state.deleteDialog = action.payload
        },
        toggleUpdateDialog: (state, action) => {
            state.updateDialog = action.payload
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(getUsers.pending, (state) => {
            state.loading = true
        })
        builder.addCase(getUsers.fulfilled, (state, action) => {
            state.loading = false
            state.userList = action.payload.data
        })
    },
})

export const {
    setSelectedUser,
    setPageIndex,
    setPageSize,
    setUsername,
    setEmail,
    setPhone,
    toggleDeleteDialog,
    toggleUpdateDialog,
    resetState,
} = userSlice.actions

export default userSlice.reducer
