import ApiService from './ApiService'
import type { Course } from '@/@types/online-learning'

export async function apiGetCourses<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/courses',
        method: 'get',
        params,
    })
}

export async function apiGetCourse<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/courses/${id}`,
        method: 'get',
    })
}

export async function apiCreateCourse<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/courses',
        method: 'post',
        data,
    })
}

export async function apiUpdateCourse<T, U extends Record<string, unknown>>(
    id: string,
    data: U
) {
    return ApiService.fetchData<T>({
        url: `/courses/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteCourse<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/courses/${id}`,
        method: 'delete',
    })
}

export async function apiPublishCourse<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/courses/${id}/publish`,
        method: 'put',
    })
}

export async function apiUnpublishCourse<T>(id: string) {
    return ApiService.fetchData<T>({
        url: `/courses/${id}/unpublish`,
        method: 'put',
    })
}

export async function apiApproveOrRejectCourse<
    T,
    U extends Record<string, unknown>
>(id: string, data: U) {
    console.log('apiApproveOrRejectCourse called with id:', id, 'data:', data)
    return ApiService.fetchData<T>({
        url: `/courses/${id}/status`,
        method: 'patch',
        data,
    })
}

export async function apiGetCourseModules<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/admin/course-modules',
        method: 'get',
        params,
    })
}
