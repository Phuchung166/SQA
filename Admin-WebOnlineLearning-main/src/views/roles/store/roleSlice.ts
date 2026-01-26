import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetRoles,
    apiGetPermissions,
    apiCreateRole,
    apiUpdateRole,
    apiDeleteRole,
    apiAssignPermissionToRole,
} from '@/services/RoleService'
import {
    BaseState,
    baseInitialState,
    createBaseReducers,
    createBaseExtraReducers,
    createBaseExtraReducersSuccess,
} from '@/store/slices/base/baseSlice'
import type { Role, Permission } from '@/@types/online-learning'

type RoleResponse = {
    code: number
    message: string
    data: Role[] | Role | Permission[] | boolean
}

export type RoleState = BaseState & {
    roles: Role[]
    permissions: Permission[]
    selectedRole: Role | null
    createDialog: boolean
    editDialog: boolean
    deleteDialog: boolean
    formData: {
        name: string
        description: string
        permissions: number[]
    }
}

export const SLICE_NAME = 'roles'

// Async thunks
export const getRoles = createAsyncThunk(
    `${SLICE_NAME}/getRoles`,
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGetRoles<RoleResponse>()
            return response.data
        } catch (error: unknown) {
            return rejectWithValue({
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof Error ? error.name : 'UNKNOWN',
                status: 500,
            })
        }
    }
)

export const getPermissions = createAsyncThunk(
    `${SLICE_NAME}/getPermissions`,
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGetPermissions<RoleResponse>()
            return response.data
        } catch (error: unknown) {
            return rejectWithValue({
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof Error ? error.name : 'UNKNOWN',
                status: 500,
            })
        }
    }
)

export const createRole = createAsyncThunk(
    `${SLICE_NAME}/createRole`,
    async (data: Record<string, unknown>, { rejectWithValue }) => {
        try {
            const response = await apiCreateRole<
                RoleResponse,
                Record<string, unknown>
            >(data)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue({
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof Error ? error.name : 'UNKNOWN',
                status: 500,
            })
        }
    }
)

export const updateRole = createAsyncThunk(
    `${SLICE_NAME}/updateRole`,
    async (
        { id, data }: { id: number; data: Record<string, unknown> },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiUpdateRole<
                RoleResponse,
                Record<string, unknown>
            >(id, data)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue({
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof Error ? error.name : 'UNKNOWN',
                status: 500,
            })
        }
    }
)

export const deleteRole = createAsyncThunk(
    `${SLICE_NAME}/deleteRole`,
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await apiDeleteRole<RoleResponse>(id)
            return { id, data: response.data }
        } catch (error: unknown) {
            return rejectWithValue({
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof Error ? error.name : 'UNKNOWN',
                status: 500,
            })
        }
    }
)

export const assignPermissionToRole = createAsyncThunk(
    `${SLICE_NAME}/assignPermissionToRole`,
    async (
        { roleId, permissionIds }: { roleId: number; permissionIds: number[] },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiAssignPermissionToRole<RoleResponse>(
                roleId,
                permissionIds
            )
            return response.data
        } catch (error: unknown) {
            return rejectWithValue({
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                code: error instanceof Error ? error.name : 'UNKNOWN',
                status: 500,
            })
        }
    }
)

const initialState: RoleState = {
    ...baseInitialState,
    roles: [],
    permissions: [],
    selectedRole: null,
    createDialog: false,
    editDialog: false,
    deleteDialog: false,
    formData: {
        name: '',
        description: '',
        permissions: [],
    },
}

const roleSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        ...createBaseReducers('roles'),
        setSelectedRole: (state, action) => {
            state.selectedRole = action.payload
        },
        toggleCreateDialog: (state, action) => {
            state.createDialog = action.payload
        },
        toggleEditDialog: (state, action) => {
            state.editDialog = action.payload
        },
        toggleDeleteDialog: (state, action) => {
            state.deleteDialog = action.payload
        },
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload }
        },
        resetFormData: (state) => {
            state.formData = initialState.formData
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        // Get roles
        createBaseExtraReducers(builder, getRoles, 'Failed to fetch roles')
        createBaseExtraReducersSuccess(builder, getRoles, (state, action) => {
            if (action.payload.code === 0) {
                state.roles = action.payload.data as Role[]
            }
        })

        // Get permissions
        createBaseExtraReducers(
            builder,
            getPermissions,
            'Failed to fetch permissions'
        )
        createBaseExtraReducersSuccess(
            builder,
            getPermissions,
            (state, action) => {
                if (action.payload.code === 0) {
                    state.permissions = action.payload.data as Permission[]
                }
            }
        )

        // Create role
        createBaseExtraReducers(builder, createRole, 'Failed to create role')
        createBaseExtraReducersSuccess(builder, createRole, (state) => {
            state.createDialog = false
        })

        // Update role
        createBaseExtraReducers(builder, updateRole, 'Failed to update role')
        createBaseExtraReducersSuccess(builder, updateRole, (state) => {
            state.editDialog = false
        })

        // Delete role
        createBaseExtraReducers(builder, deleteRole, 'Failed to delete role')
        createBaseExtraReducersSuccess(builder, deleteRole, (state, action) => {
            state.roles = state.roles.filter(
                (role: Role) => role.id !== action.payload.id
            )
            state.deleteDialog = false
        })

        // Assign permissions to role - simplified
        builder.addCase(assignPermissionToRole.fulfilled, (state) => {
            state.loading = false
        })
    },
})

export const {
    clearError,
    setLoading,
    setSelectedRole,
    toggleCreateDialog,
    toggleEditDialog,
    toggleDeleteDialog,
    setFormData,
    resetFormData,
    resetState,
} = roleSlice.actions

export default roleSlice.reducer
