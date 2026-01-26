import internal from 'stream'

export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    id: number
    roles: string[]
    token: string
    token_type: string
    username: string
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    username: string
    email: string
    password: string
}

export type ForgotPassword = {
    username: string
    email: string
}

export type ForgotResponse = {
    code: number
    message: string
    data: string
}

export type ResetPassword = {
    password: string
}
