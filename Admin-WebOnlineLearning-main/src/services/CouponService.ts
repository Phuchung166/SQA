import ApiService from './ApiService'
import type { Coupon } from '@/@types/online-learning'

export async function apiGetCoupons<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/coupons',
        method: 'get',
        params,
    })
}

export async function apiGetCoupon<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/coupons/${id}`,
        method: 'get',
    })
}

export async function apiCreateCoupon<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/coupons',
        method: 'post',
        data,
    })
}

export async function apiUpdateCoupon<T, U extends Record<string, unknown>>(
    id: string,
    data: U
) {
    return ApiService.fetchData<T>({
        url: `/coupons/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteCoupon<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/coupons/${id}`,
        method: 'delete',
    })
}

export async function apiDeactivateCoupon<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/coupons/${id}/deactivate`,
        method: 'put',
    })
}

export async function apiActivateCoupon<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/coupons/${id}/activate`,
        method: 'put',
    })
}

export async function apiValidateCoupon<T>(code: string, courseId?: string) {
    return ApiService.fetchData<T>({
        url: '/coupons/validate',
        method: 'post',
        data: { code, course_id: courseId },
    })
}
