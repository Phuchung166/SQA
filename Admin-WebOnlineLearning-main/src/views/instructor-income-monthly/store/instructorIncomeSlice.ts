import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type {
    InstructorIncome,
    InstructorIncomeResponse,
} from '@/@types/online-learning'

type GetInstructorIncomesParams = {
    page?: number
    size?: number
    year?: number
    month?: number
    paymentStatus?: string
    sortBy?: string
    sortOrder?: string
}

type ApiError = {
    message: string
    code?: string
    status?: number
}

export type InstructorIncomeState = {
    loading: boolean
    incomeList: InstructorIncome[]
    totalElements: number
    currentPage: number
    totalPages: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
    selectedIncome: InstructorIncome | null
    year: number | null
    month: number | null
    paymentStatus: string
    sortBy: string
    sortOrder: string
}

export const SLICE_NAME = 'instructorIncome'

// Mock data function - will be replaced with real API call
const mockGetInstructorIncomes = (
    params: GetInstructorIncomesParams
): Promise<{ data: InstructorIncomeResponse }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockData: InstructorIncome[] = [
                {
                    id: 1,
                    year: 2024,
                    month: 12,
                    email: 'instructor1@example.com',
                    account_name: 'instructor1',
                    first_name: 'Nguyễn',
                    last_name: 'Văn A',
                    bank_name: 'Vietcombank',
                    bank_account: '1234567890',
                    total_earning: 15000000,
                    payment_status: 'PAID',
                    paid_at: '2024-12-25T10:00:00Z',
                },
                {
                    id: 2,
                    year: 2024,
                    month: 12,
                    email: 'instructor2@example.com',
                    account_name: 'instructor2',
                    first_name: 'Trần',
                    last_name: 'Thị B',
                    bank_name: 'Techcombank',
                    bank_account: '0987654321',
                    total_earning: 22500000,
                    payment_status: 'PENDING',
                },
                {
                    id: 3,
                    year: 2024,
                    month: 11,
                    email: 'instructor3@example.com',
                    account_name: 'instructor3',
                    first_name: 'Lê',
                    last_name: 'Văn C',
                    bank_name: 'VPBank',
                    bank_account: '1122334455',
                    total_earning: 18000000,
                    payment_status: 'PAID',
                    paid_at: '2024-11-28T14:30:00Z',
                },
                {
                    id: 4,
                    year: 2024,
                    month: 11,
                    email: 'instructor4@example.com',
                    account_name: 'instructor4',
                    first_name: 'Phạm',
                    last_name: 'Thị D',
                    bank_name: 'ACB',
                    bank_account: '5566778899',
                    total_earning: 12000000,
                    payment_status: 'PENDING',
                },
                {
                    id: 5,
                    year: 2024,
                    month: 10,
                    email: 'instructor5@example.com',
                    account_name: 'instructor5',
                    first_name: 'Hoàng',
                    last_name: 'Văn E',
                    bank_name: 'MB Bank',
                    bank_account: '9988776655',
                    total_earning: 28000000,
                    payment_status: 'PAID',
                    paid_at: '2024-10-30T09:15:00Z',
                },
            ]

            // Filter by year
            let filteredData = mockData
            if (params.year) {
                filteredData = filteredData.filter(
                    (item) => item.year === params.year
                )
            }

            // Filter by month
            if (params.month) {
                filteredData = filteredData.filter(
                    (item) => item.month === params.month
                )
            }

            // Filter by payment status
            if (params.paymentStatus) {
                filteredData = filteredData.filter(
                    (item) => item.payment_status === params.paymentStatus
                )
            }

            const page = params.page || 1
            const size = params.size || 10
            const totalElements = filteredData.length
            const totalPages = Math.ceil(totalElements / size)
            const startIndex = (page - 1) * size
            const endIndex = startIndex + size
            const paginatedData = filteredData.slice(startIndex, endIndex)

            resolve({
                data: {
                    current_page: page,
                    total_pages: totalPages,
                    total_elements: totalElements,
                    page_size: size,
                    has_next: page < totalPages,
                    has_previous: page > 1,
                    data: paginatedData,
                },
            })
        }, 500)
    })
}

export const getInstructorIncomes = createAsyncThunk<
    InstructorIncomeResponse,
    GetInstructorIncomesParams
>(
    `${SLICE_NAME}/getInstructorIncomes`,
    async (data: GetInstructorIncomesParams, { rejectWithValue }) => {
        try {
            // TODO: Replace with real API call
            // const response = await apiGetInstructorIncomes(data)
            const response = await mockGetInstructorIncomes(data)
            return response.data as InstructorIncomeResponse
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

const initialState: InstructorIncomeState = {
    loading: false,
    incomeList: [],
    totalElements: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
    selectedIncome: null,
    year: null,
    month: null,
    paymentStatus: '',
    sortBy: 'month',
    sortOrder: 'desc',
}

const instructorIncomeSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setIncomeList: (state, action) => {
            state.incomeList = action.payload
        },
        setSelectedIncome: (state, action) => {
            state.selectedIncome = action.payload
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload
        },
        setYear: (state, action) => {
            state.year = action.payload
        },
        setMonth: (state, action) => {
            state.month = action.payload
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
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(getInstructorIncomes.pending, (state) => {
            state.loading = true
        })
        builder.addCase(
            getInstructorIncomes.fulfilled,
            (state, action: PayloadAction<InstructorIncomeResponse>) => {
                state.loading = false
                state.incomeList = action.payload.data
                state.totalElements = action.payload.total_elements
                state.currentPage = action.payload.current_page
                state.totalPages = action.payload.total_pages
                state.pageSize = action.payload.page_size
                state.hasNext = action.payload.has_next
                state.hasPrevious = action.payload.has_previous
            }
        )
        builder.addCase(getInstructorIncomes.rejected, (state) => {
            state.loading = false
        })
    },
})

export const {
    setIncomeList,
    setSelectedIncome,
    setCurrentPage,
    setPageSize,
    setYear,
    setMonth,
    setPaymentStatus,
    setSortBy,
    setSortOrder,
    resetState,
} = instructorIncomeSlice.actions

export default instructorIncomeSlice.reducer
