import { createSlice, PayloadAction, AsyncThunk } from '@reduxjs/toolkit'

export interface BaseState {
    loading: boolean
    error: string | null
}

export const baseInitialState: BaseState = {
    loading: false,
    error: null,
}

export const createBaseReducers = (sliceName: string) => ({
    clearError: (state: BaseState) => {
        state.error = null
    },
    setLoading: (state: BaseState, action: PayloadAction<boolean>) => {
        state.loading = action.payload
    },
})

export const createBaseExtraReducers = (builder: any, asyncThunk: AsyncThunk<any, any, any>, errorMessage: string) => {
    builder
        .addCase(asyncThunk.pending, (state: BaseState) => {
            state.loading = true
            state.error = null
        })
        .addCase(asyncThunk.rejected, (state: BaseState, action: any) => {
            state.loading = false
            state.error = action.error.message || errorMessage
        })
}

export const createBaseExtraReducersSuccess = (builder: any, asyncThunk: AsyncThunk<any, any, any>, successHandler: (state: any, action: any) => void) => {
    builder.addCase(asyncThunk.fulfilled, (state: any, action: any) => {
        state.loading = false
        successHandler(state, action)
    })
}