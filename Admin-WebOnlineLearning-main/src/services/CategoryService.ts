import ApiService from './ApiService'

export async function apiGetCategories<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/categories',
        method: 'get',
        params,
    })
}

export async function apiGetCategory<T>(id: number) {
    return ApiService.fetchData<T>({
        url: `/categories/${id}`,
        method: 'get',
    })
}

export async function apiCreateCategory<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/categories',
        method: 'post',
        data,
    })
}

export async function apiUpdateCategory<T, U extends Record<string, unknown>>(
    id: number,
    data: U
) {
    return ApiService.fetchData<T>({
        url: `/categories/${id}`,
        method: 'patch',
        data,
    })
}

export async function apiDeleteCategory<T>(id: number) {
    return ApiService.fetchData<T>({
        url: `/categories/${id}`,
        method: 'delete',
    })
}

export async function apiCreateImageUrl<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/files/pre-signed-url',
        method: 'post',
        data,
    })
}
