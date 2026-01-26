import ApiService from './ApiService'
import type { Review } from '@/@types/online-learning'

export async function apiGetReviews<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/reviews',
        method: 'get',
        params,
    })
}

export async function apiGetReview<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/reviews/${id}`,
        method: 'get',
    })
}

export async function apiApproveReview<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/reviews/${id}/approve`,
        method: 'put',
    })
}

export async function apiRejectReview<T>(id: string, reason?: string) {
    return ApiService.fetchData<T>({
        url: `/reviews/${id}/reject`,
        method: 'put',
        data: { reason },
    })
}

export async function apiDeleteReview<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/reviews/${id}`,
        method: 'delete',
    })
}

export async function apiHideReview<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/reviews/${id}/hide`,
        method: 'put',
    })
}

export async function apiShowReview<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/reviews/${id}/show`,
        method: 'put',
    })
}
