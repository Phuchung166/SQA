import ApiService from './ApiService'

export async function apiGetDashboardStats<T>() {
    return ApiService.fetchData<T>({
        url: '/admin/statistics-system',
        method: 'get',
    })
}

export async function apiGetRevenueStats<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/analytics/revenue',
        method: 'get',
        params,
    })
}

export async function apiGetTopInstructors<T>(
    params?: Record<string, unknown>
) {
    return ApiService.fetchData<T>({
        url: '/analytics/top-instructors',
        method: 'get',
        params,
    })
}

export async function apiGetTopCourses<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/analytics/top-courses',
        method: 'get',
        params,
    })
}

export async function apiGetUserGrowth<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/analytics/user-growth',
        method: 'get',
        params,
    })
}

export async function apiGetEnrollmentStats<T>(
    params?: Record<string, unknown>
) {
    return ApiService.fetchData<T>({
        url: '/analytics/enrollments',
        method: 'get',
        params,
    })
}

export async function apiGetCategoryStats<T>() {
    return ApiService.fetchData<T>({
        url: '/analytics/categories',
        method: 'get',
    })
}
