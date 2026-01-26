import ApiService from './ApiService'
import type { User } from '@/@types/user'

export async function apiGetStudents<T>(params?: Record<string, unknown>) {
    return ApiService.fetchData<T>({
        url: '/admin/students',
        method: 'get',
        params,
    })
}

export async function apiGetStudent<T>(email: string) {
    return ApiService.fetchData<T>({
        url: `/students/${email}`,
        method: 'get',
    })
}

export async function apiSuspendStudent<T>(email: string, reason?: string) {
    return ApiService.fetchData<T>({
        url: `/students/${email}/suspend`,
        method: 'put',
        data: { reason },
    })
}

export async function apiActivateStudent<T>(email: string) {
    return ApiService.fetchData<T>({
        url: `/students/${email}/activate`,
        method: 'put',
    })
}

export async function apiDeleteStudent<T>(email: string) {
    return ApiService.fetchData<T>({
        url: `/students/${email}`,
        method: 'delete',
    })
}

export async function apiGetStudentEnrollments<T>(
    email: string,
    params?: Record<string, unknown>
) {
    return ApiService.fetchData<T>({
        url: `/students/${email}/enrollments`,
        method: 'get',
        params,
    })
}
