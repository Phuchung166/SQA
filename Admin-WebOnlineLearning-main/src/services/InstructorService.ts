import ApiService from './ApiService'
import type { Instructor } from '@/@types/online-learning'

export async function apiGetInstructors<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/admin/instructors',
        method: 'get',
        params,
    })
}

export async function apiGetInstructor<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/instructors/${id}`,
        method: 'get',
    })
}

export async function apiApproveInstructor<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/instructors/${id}/approve`,
        method: 'put',
    })
}

export async function apiRejectInstructor<T>(id: string, reason?: string) {
    return ApiService.fetchData<T>({
        url: `/instructors/${id}/reject`,
        method: 'put',
        data: { reason },
    })
}

export async function apiSuspendInstructor<T>(id: string, reason?: string) {
    return ApiService.fetchData<T>({
        url: `/instructors/${id}/suspend`,
        method: 'put',
        data: { reason },
    })
}

export async function apiActivateInstructor<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/instructors/${id}/activate`,
        method: 'put',
    })
}

export async function apiUpdateInstructor<T, U extends Record<string, unknown>>(
    id: string,
    data: U
) {
    return ApiService.fetchData<T>({
        url: `/instructors/${id}`,
        method: 'put',
        data,
    })
}

export async function apiGetInstructorCourses<T>(
    id: string,
    params?: Record<string, unknown>
) {
    return ApiService.fetchData<T>({
        url: `/instructors/${id}/courses`,
        method: 'get',
        params,
    })
}
