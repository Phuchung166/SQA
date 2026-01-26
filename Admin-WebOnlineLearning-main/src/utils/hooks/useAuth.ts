import { apiSignIn, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const query = useQuery()

    const { accessToken, refreshToken, signedIn } = useAppSelector(
        (state) => state.auth.session
    )

    const signIn = async (
        values: SignInCredential
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        try {
            const resp = await apiSignIn(values)
            console.log('resp', resp)
            const data = resp.data
            if (resp.status === 200) {
                console.log('data', data)
                const accessToken = data.token
                const refreshToken = ''
                // const userInfo = data.data.user_login
                dispatch(signInSuccess({ accessToken, refreshToken }))
                dispatch(
                    setUser({
                        avatar: '/learning-cms/img/avatars/thumb-11.jpg',
                        // fullName: userInfo.full_name,
                        email: data.username,
                        authority: [data.roles[0]],
                    })
                )

                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
                )
                return {
                    status: 'success',
                    message: '',
                }
            } else {
                return {
                    status: 'failed',
                    message: 'Invalid credentials',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    // const signUp = async (values: SignUpCredential) => {
    //     try {
    //         const resp = await apiSignUp(values)
    //         const data = resp.data
    //         if (data.code === 0) {
    //             const accessToken = data.data.token_info.access_token
    //             const refreshToken = data.data.token_info.refresh_token
    //             const userInfo = data.data.user_login
    //             dispatch(signInSuccess({ accessToken, refreshToken }))
    //             dispatch(
    //                 setUser({
    //                     avatar: '/learning-cms/img/avatars/thumb-11.jpg',
    //                     fullName: userInfo.full_name,
    //                     email: userInfo.email,
    //                     authority: ['user'],
    //                 })
    //             )
    //             const redirectUrl = query.get(REDIRECT_URL_KEY)
    //             navigate(
    //                 redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath
    //             )
    //             return {
    //                 status: 'success',
    //                 message: '',
    //             }
    //         }
    //         // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    //     } catch (errors: any) {
    //         return {
    //             status: 'failed',
    //             message: errors?.response?.data?.message || errors.toString(),
    //         }
    //     }
    // }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                username: '',
                email: '',
                authority: [],
            })
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        // await apiSignOut()
        handleSignOut()
    }

    return {
        authenticated: accessToken && signedIn,
        signIn,
        // signUp,
        signOut,
    }
}

export default useAuth
