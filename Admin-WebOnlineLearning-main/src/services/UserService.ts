import ApiService from './ApiService'

export async function apiGetListUsers<T>(data: any) {
    return ApiService.fetchData<T>({
        url: '/user/list',
        method: 'POST',
        data: data,
    })
}

export async function apiApproveUser<T>(data: any) {
    return ApiService.fetchData<T>({
        url: `/user/approve`,
        method: 'POST',
        data: data,
    })
}

export async function apiDeleteUser<T>(data: any) {
    return ApiService.fetchData<T>({
        url: `/user/remove`,
        method: 'POST',
        data: data,
    })
}
