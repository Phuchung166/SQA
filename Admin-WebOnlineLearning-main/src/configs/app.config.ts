export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
}

interface Config {
    API_URL: string
}

declare global {
    interface Window {
        config: Config
    }
}

const appConfig: AppConfig = {
    apiPrefix: window.config.API_URL || 'https://ptit-online-api.site/api/v1',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/dashboard',
    locale: 'vi',
    enableMock: false,
}

export default appConfig
