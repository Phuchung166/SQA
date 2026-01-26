import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    id?: string
    username?: string
    avatar?: string
    fullName?: string
    email?: string
    authority?: string[]
}

const initialState: UserState = {
    id: '',
    username: '',
    avatar: '',
    fullName: '',
    email: '',
    authority: [],
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload?.id
            state.username = action.payload?.username
            state.avatar = action.payload?.avatar
            state.email = action.payload?.email
            state.fullName = action.payload?.fullName
            state.authority = action.payload?.authority
        },
    },
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
