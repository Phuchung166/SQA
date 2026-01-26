import ApiService from './ApiService'
import type { Role, Permission } from '@/@types/online-learning'

export async function apiGetRoles<T>() {
    return ApiService.fetchData<T>({
        url: '/roles',
        method: 'get',
    })
}

export async function apiCreateRole<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/roles',
        method: 'post',
        data,
    })
}

export async function apiUpdateRole<T, U extends Record<string, unknown>>(
    id: number,
    data: U
) {
    return ApiService.fetchData<T>({
        url: `/roles/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeleteRole<T>(id: number) {
    return ApiService.fetchData<T>({
        url: `/roles/${id}`,
        method: 'delete',
    })
}

export async function apiGetPermissions<T>() {
    return ApiService.fetchData<T>({
        url: '/permissions',
        method: 'get',
    })
}

export async function apiCreatePermission<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/permissions',
        method: 'post',
        data,
    })
}

export async function apiUpdatePermission<T, U extends Record<string, unknown>>(
    id: number,
    data: U
) {
    return ApiService.fetchData<T>({
        url: `/permissions/${id}`,
        method: 'put',
        data,
    })
}

export async function apiDeletePermission<T>(id: number) {
    return ApiService.fetchData<T>({
        url: `/permissions/${id}`,
        method: 'delete',
    })
}

export async function apiAssignPermissionToRole<T>(
    roleId: number,
    permissionIds: number[]
) {
    return ApiService.fetchData<T>({
        url: `/roles/${roleId}/permissions`,
        method: 'post',
        data: { permission_ids: permissionIds },
    })
}
