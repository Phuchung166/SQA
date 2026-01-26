import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetCategories,
    apiCreateCategory,
    apiUpdateCategory,
    apiDeleteCategory,
    apiCreateImageUrl,
} from '@/services/CategoryService'
import {
    BaseState,
    baseInitialState,
    createBaseReducers,
    createBaseExtraReducers,
    createBaseExtraReducersSuccess,
} from '@/store/slices/base/baseSlice'
import type { Category } from '@/@types/online-learning'

type GetCategoriesResponse = {
    current_page: number
    total_pages: number
    total_elements: number
    page_size: number
    data: Category[]
}

type CategoryResponse = {
    data?: Category
    message?: string
}

type CategoryFormData = {
    name?: string
    description?: string
    image?: string
}

type GetCategoriesParams = {
    page?: number
    pageSize?: number
    search?: string
    sortBy?: string
    sortOrder?: string
    isActive?: boolean
}

type UploadResponse = {
    cloudFrontUrl: string
    filename: string
    presignedUrl: string
}

type UploadRequest = {
    variant: string
    extension: string
    file_name: string
}

export type CategoryState = BaseState & {
    categoryList: Category[]
    totalElements: number
    pageIndex: number
    pageSize: number
    selectedCategory: Category | null
    search: string
    sortBy: string
    sortOrder: string
    isActive: boolean | null
    deleteDialog: boolean
    createDialog: boolean
    updateDialog: boolean
    confirmDialog: boolean
    confirmAction: (() => void) | null
    confirmMessage: string
}

export const SLICE_NAME = 'categories'

export const getCategories = createAsyncThunk(
    `${SLICE_NAME}/getCategories`,
    async (data: GetCategoriesParams, { rejectWithValue }) => {
        try {
            const response = await apiGetCategories<GetCategoriesResponse>(data)
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

export const createCategory = createAsyncThunk(
    `${SLICE_NAME}/createCategory`,
    async (data: CategoryFormData, { rejectWithValue }) => {
        try {
            const response = await apiCreateCategory<
                CategoryResponse,
                CategoryFormData
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

export const updateCategory = createAsyncThunk(
    `${SLICE_NAME}/updateCategory`,
    async (
        { id, data }: { id: number; data: CategoryFormData },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiUpdateCategory<
                CategoryResponse,
                CategoryFormData
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

export const deleteCategory = createAsyncThunk(
    `${SLICE_NAME}/deleteCategory`,
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await apiDeleteCategory<CategoryResponse>(id)
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

export const createImageUrl = createAsyncThunk(
    `${SLICE_NAME}/createImageUrl`,
    async (data: UploadRequest, { rejectWithValue }) => {
        try {
            const response = await apiCreateImageUrl<
                UploadResponse,
                UploadRequest
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

const initialState: CategoryState = {
    ...baseInitialState,
    categoryList: [],
    totalElements: 0,
    pageIndex: 1,
    pageSize: 10,
    selectedCategory: null,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isActive: null,
    deleteDialog: false,
    createDialog: false,
    updateDialog: false,
    confirmDialog: false,
    confirmAction: null,
    confirmMessage: '',
}

const categorySlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        ...createBaseReducers('categories'),
        setCategoryList: (state, action) => {
            state.categoryList = action.payload
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload
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
        setIsActive: (state, action) => {
            state.isActive = action.payload
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
        toggleConfirmDialog: (state, action) => {
            state.confirmDialog = action.payload
        },
        setConfirmAction: (state, action) => {
            state.confirmAction = action.payload
        },
        setConfirmMessage: (state, action) => {
            state.confirmMessage = action.payload
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        // Get categories
        createBaseExtraReducers(
            builder,
            getCategories,
            'Failed to fetch categories'
        )
        createBaseExtraReducersSuccess(
            builder,
            getCategories,
            (state, action) => {
                state.categoryList = action.payload.data
                state.totalElements = action.payload.totalElements
            }
        )

        // Create category
        createBaseExtraReducers(
            builder,
            createCategory,
            'Failed to create category'
        )
        createBaseExtraReducersSuccess(builder, createCategory, (state) => {
            state.createDialog = false
        })

        // Update category
        createBaseExtraReducers(
            builder,
            updateCategory,
            'Failed to update category'
        )
        createBaseExtraReducersSuccess(builder, updateCategory, (state) => {
            state.updateDialog = false
        })

        // Delete category
        createBaseExtraReducers(
            builder,
            deleteCategory,
            'Failed to delete category'
        )
        createBaseExtraReducersSuccess(builder, deleteCategory, (state) => {
            state.deleteDialog = false
            state.confirmDialog = false
        })
    },
})

export const {
    clearError,
    setLoading,
    setCategoryList,
    setSelectedCategory,
    setPageIndex,
    setPageSize,
    setSearch,
    setSortBy,
    setSortOrder,
    setIsActive,
    toggleDeleteDialog,
    toggleCreateDialog,
    toggleUpdateDialog,
    toggleConfirmDialog,
    setConfirmAction,
    setConfirmMessage,
    resetState,
} = categorySlice.actions

export default categorySlice.reducer
