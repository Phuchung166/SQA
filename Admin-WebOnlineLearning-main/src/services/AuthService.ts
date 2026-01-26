import ApiService from './ApiService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
    ForgotResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    // console.log('data', data)
    return ApiService.fetchData<SignInResponse>({
        url: 'auth/login',
        method: 'post',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: '/sign-up',
        method: 'post',
        data,
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData<ForgotResponse>({
        url: '/forgot-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data,
    })
}
