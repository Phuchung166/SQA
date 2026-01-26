export interface GetAccountInfo {
    id: string
    full_name: string
    phone: string
    email: string
}

export interface User {
    id?: string
    username?: string
    fullName?: string
    email: string
    phone?: string
    password_hash?: string
    first_name?: string
    last_name?: string
    avatar?: string
    date_of_birth?: string
    gender?: string
    bio?: string
    provider?: string
    status: string
    email_verified?: boolean
    phone_verified?: boolean
    last_login?: string
    created_at?: string
    updated_at?: string
    authority?: string[]
    role?: string
}

export interface Student {
    email: string
    phone?: string | null
    first_name?: string | null
    last_name?: string | null
    avatar?: string | null
    date_of_birth?: string | null
    gender?: string | null
    bio?: string | null
    account_name: string
    created_at: string
    updated_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}

export interface PaginatedResponse<T> {
    list: T[]
    total: number
    page: number
    limit: number
}

export interface GetUsersResponse extends ApiResponse<PaginatedResponse<User>> {
    users: User[]
    totalUsers: number
}

// Removed ApproveUserResponse as it is equivalent to ApiResponse<boolean>

// Removed DeleteUserResponse as it is equivalent to ApiResponse<boolean>

// Table types
export interface TableRow {
    original: any
    index: number
}

export interface PaginationState {
    pageIndex: number
    pageSize: number
}

// Enrollment interface
export interface Enrollment {
    id: string
    course?: {
        title: string
    }
    progress: number
    enrollment_date: string
    completed_at?: string
}

export const avatar_default_url =
    'https://d32trhawgfkkkj.cloudfront.net/images/1761385146433_common-avatar'
