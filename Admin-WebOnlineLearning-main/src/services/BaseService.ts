import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess, signInSuccess } from '../store'

const unauthorizedCode = [401]
let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: any) => void
}> = []

const processQueue = (
    error: AxiosError | null,
    token: string | null = null
) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    failedQueue = []
}

const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        timeout: 60000,
        baseURL: appConfig.apiPrefix,
    })

    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
            const persistData = deepParseJson(rawPersistData)

            let accessToken = (persistData as any)?.auth?.session?.token

            if (!accessToken) {
                const { auth } = store.getState()
                accessToken = auth.session.accessToken
            }

            if (accessToken) {
                config.headers[
                    REQUEST_HEADER_AUTH_KEY
                ] = `${TOKEN_TYPE}${accessToken}`
            }

            return config
        },
        (error: AxiosError) => {
            return Promise.reject(error)
        }
    )

    instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest =
                error.config as InternalAxiosRequestConfig & {
                    _retry?: boolean
                }

            if (
                (console.log('error', error),
                error.response &&
                    unauthorizedCode.includes(error.response.status) &&
                    !originalRequest._retry)
            ) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    })
                        .then((token) => {
                            originalRequest.headers[
                                REQUEST_HEADER_AUTH_KEY
                            ] = `${TOKEN_TYPE}${token}`
                            return instance(originalRequest)
                        })
                        .catch((err) => {
                            return Promise.reject(err)
                        })
                }

                originalRequest._retry = true
                isRefreshing = true

                const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
                const persistData = deepParseJson(rawPersistData)
                const refreshToken = (persistData as any)?.auth?.session
                    ?.refreshToken

                if (!refreshToken) {
                    store.dispatch(signOutSuccess())
                    return Promise.reject(error)
                }

                try {
                    const response = await axios.post(
                        `${appConfig.apiPrefix}refresh?token=${refreshToken}`
                    )
                    const newAccessToken = response.data.data.access_token
                    const newRefreshToken = response.data.data.refresh_token

                    store.dispatch(
                        signInSuccess({
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        })
                    )

                    // Update token for the current request
                    originalRequest.headers[
                        REQUEST_HEADER_AUTH_KEY
                    ] = `${TOKEN_TYPE}${newAccessToken}`

                    processQueue(null, newAccessToken)
                    isRefreshing = false

                    return instance(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError as AxiosError, null)
                    isRefreshing = false
                    store.dispatch(signOutSuccess())
                    return Promise.reject(refreshError)
                }
            }

            return Promise.reject(error)
        }
    )

    return instance
}

const BaseService = createAxiosInstance()

export default BaseService
