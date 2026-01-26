import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiGetOrders, apiGetOrder } from '@/services/OrderService'
import type { Order } from '@/@types/online-learning'

type GetOrdersParams = {
    page?: number
    size?: number
    paymentStatus?: string
    sortBy?: string
    sortOrder?: string
}

type GetOrdersResponse = {
    current_page: number
    total_pages: number
    total_elements: number
    page_size: number
    has_next: boolean
    has_previous: boolean
    data: Order[]
}

type OrderResponse = {
    order_number: string
    currency: string
    payment_status: string
    order_date: string
    total_money: number
    order_items: Order['order_items']
}

type ApiError = {
    message: string
    code?: string
    status?: number
}

export type OrderState = {
    loading: boolean
    orderList: Order[]
    totalElements: number
    currentPage: number
    totalPages: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
    selectedOrder: Order | null
    paymentStatus: string
    sortBy: string
    sortOrder: string
    detailDialog: boolean
}

export const SLICE_NAME = 'orders'

export const getOrders = createAsyncThunk<GetOrdersResponse, GetOrdersParams>(
    `${SLICE_NAME}/getOrders`,
    async (data: GetOrdersParams, { rejectWithValue }) => {
        try {
            const response = await apiGetOrders(data)
            return response.data as GetOrdersResponse
        } catch (error: unknown) {
            const apiError = error as ApiError
            return rejectWithValue({
                message: apiError.message,
                code: apiError.code,
                status: apiError.status,
            })
        }
    }
)

export const getOrder = createAsyncThunk<OrderResponse, string>(
    `${SLICE_NAME}/getOrder`,
    async (orderNumber: string, { rejectWithValue }) => {
        try {
            const response = await apiGetOrder(orderNumber)
            return response.data as OrderResponse
        } catch (error: unknown) {
            const apiError = error as ApiError
            return rejectWithValue({
                message: apiError.message,
                code: apiError.code,
                status: apiError.status,
            })
        }
    }
)

const initialState: OrderState = {
    loading: false,
    orderList: [],
    totalElements: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
    selectedOrder: null,
    paymentStatus: '',
    sortBy: 'order_date',
    sortOrder: 'desc',
    detailDialog: false,
}

const orderSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setOrderList: (state, action) => {
            state.orderList = action.payload
        },
        setSelectedOrder: (state, action) => {
            state.selectedOrder = action.payload
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload
        },
        setPaymentStatus: (state, action) => {
            state.paymentStatus = action.payload
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
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(getOrders.pending, (state) => {
            state.loading = true
        })
        builder.addCase(
            getOrders.fulfilled,
            (state, action: PayloadAction<GetOrdersResponse>) => {
                state.loading = false
                state.orderList = action.payload.data
                state.totalElements = action.payload.total_elements
                state.currentPage = action.payload.current_page
                state.totalPages = action.payload.total_pages
                state.pageSize = action.payload.page_size
                state.hasNext = action.payload.has_next
                state.hasPrevious = action.payload.has_previous
            }
        )
        builder.addCase(getOrders.rejected, (state) => {
            state.loading = false
        })
        builder.addCase(getOrder.pending, (state) => {
            state.loading = true
        })
        builder.addCase(
            getOrder.fulfilled,
            (state, action: PayloadAction<OrderResponse>) => {
                state.loading = false
                state.selectedOrder = action.payload as any
            }
        )
        builder.addCase(getOrder.rejected, (state) => {
            state.loading = false
        })
    },
})

export const {
    setOrderList,
    setSelectedOrder,
    setCurrentPage,
    setPageSize,
    setPaymentStatus,
    setSortBy,
    setSortOrder,
    toggleDetailDialog,
    resetState,
} = orderSlice.actions

export default orderSlice.reducer
