import { combineReducers } from '@reduxjs/toolkit'
import theme, { ThemeState as ThemeSliceState } from './themeSlice'

const reducer = combineReducers({
    theme,
})

export type ThemeState = {
    theme: ThemeSliceState
}

export * from './themeSlice'

export default reducer
