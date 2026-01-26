import ApiService from './ApiService'
import {
    ChangePassword,
    ChangePasswordResponse,
    ProfileInfoResponse,
    UpdateProfileInfoResponse,
} from '@/@types/profile'

export async function apiGetProfileInfo() {
    return ApiService.fetchData<ProfileInfoResponse>({
        url: '/profile/info',
        method: 'POST',
    })
}

export async function apiUpdateProfileInfo(data: any) {
    return ApiService.fetchData<UpdateProfileInfoResponse>({
        url: '/profile/update-info',
        method: 'POST',
        data: data,
    })
}

export async function apiChangePassword(data: ChangePassword) {
    return ApiService.fetchData<ChangePasswordResponse>({
        url: '/profile/change-password',
        method: 'POST',
        data: data,
    })
}
