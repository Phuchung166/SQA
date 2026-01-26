import { combineReducers } from '@reduxjs/toolkit'
import instructorIncome from './instructorIncomeSlice'
import { useSelector, useDispatch } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'

const reducer = combineReducers({
    data: instructorIncome,
})

export const useAppSelector: TypedUseSelectorHook<
    RootState & {
        instructorIncome: {
            data: ReturnType<typeof instructorIncome>
        }
    }
> = useSelector

export const useAppDispatch = () => useDispatch<AppDispatch>()

export * from './instructorIncomeSlice'

export default reducer
