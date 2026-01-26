import AdaptableCard from '@/components/shared/AdaptableCard'
import TableTool from './components/UserTableTools'
import UserTable from './components/UserTable'
import { injectReducer } from '@/store'
import reducer, { resetState, useAppDispatch } from './store'
import UpdateUserDialog from './components/UpdateUserDialog'
import { useEffect } from 'react'
injectReducer('users', reducer)

const User = () => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        return () => {
            dispatch(resetState())
        }
    }, [dispatch])

    return (
        <>
            <AdaptableCard className="h-full" bodyClass="h-full">
                <h3>Quản lý tài khoản</h3>
                <div className="mb-4">
                    <TableTool />
                </div>
                <UserTable />
            </AdaptableCard>
            <UpdateUserDialog />
        </>
    )
}

export default User
