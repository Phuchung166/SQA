export type ProfileInfoResponse = {
    code: number
    message: string
    data: {
        full_name: string
        phone: string
        email: string
    }
}

export type UpdateProfileInfoResponse = ProfileInfoResponse

export type ChangePassword = {
    old_password: string
    new_password: string
    confirm_new_password: string
}

export type ChangePasswordResponse = {
    code: number
    message: string
}