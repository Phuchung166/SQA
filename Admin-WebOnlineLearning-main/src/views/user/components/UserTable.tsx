import { useEffect, useMemo, useState } from 'react'
import DataTable from '@/components/shared/DataTable'
import {
    getUsers,
    setPageIndex,
    setPageSize,
    setSelectedUser,
    useAppDispatch,
    useAppSelector,
    toggleDeleteDialog,
    toggleUpdateDialog,
} from '../store'
import type { ColumnDef, Row } from '@/components/shared/DataTable'
import { User } from '@/@types/user'

import DeleteUserConfirmation from './DeleteUserConfirmation'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useTranslation } from 'react-i18next'
import { t } from 'i18next'

const ActionColumn = ({ row }: { row: User }) => {
    const dispatch = useAppDispatch()
    const { textTheme } = useThemeClass()

    const onDelete = () => {
        dispatch(setSelectedUser(row))
        dispatch(toggleDeleteDialog(true))
    }

    const onApprove = () => {
        dispatch(setSelectedUser(row))
        dispatch(toggleUpdateDialog(true))
    }

    const { t } = useTranslation()

    return (
        <div className="flex justify-center items-center gap-2">
            {row.role === 'admin' && (
                <button
                    className="bg-[#1677ff] text-white px-4 py-1.5 rounded-md font-medium text-sm 
                    border border-[#1677ff] hover:bg-[#0958d9] hover:border-[#0958d9] 
                    transition-colors duration-200 disabled:bg-gray-300 disabled:border-gray-300 
                    disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70 min-w-[122px]"
                    disabled
                >
                    {t('user.approved') ?? 'Đã phê duyệt'}
                </button>
            )}
            {row.role === 'new' && (
                <button
                    className="bg-white text-[#1677ff] px-4 py-1.5 rounded-md font-medium text-sm 
                    border border-[#1677ff] hover:bg-[#e6f4ff] hover:border-[#0958d9] 
                    transition-colors duration-200 min-w-[122px]"
                    onClick={onApprove}
                >
                    {t('user.approve') ?? 'Phê duyệt'}
                </button>
            )}
            <button
                className="bg-white text-[#ff4d4f] px-4 py-1.5 rounded-md font-medium text-sm 
                border border-[#ff4d4f]  hover:opacity-80
                transition-colors duration-200"
                onClick={onDelete}
            >
                {t('user.delete') ?? 'Xoá'}
            </button>
        </div>
    )
}

const UsersTable = () => {
    const dispatch = useAppDispatch()
    const { userList, pageIndex, pageSize, loading, username, email, phone } =
        useAppSelector((state) => state.users.data)

    // Thêm state cho từ khóa tìm kiếm

    useEffect(() => {
        dispatch(getUsers({}))
    }, [dispatch])

    const filteredUsers = useMemo(() => {
        return userList.filter((user) => {
            const matchesUsername = username
                ? user.username.toLowerCase().includes(username.toLowerCase())
                : true
            const matchesEmail = email
                ? user.email.toLowerCase().includes(email.toLowerCase())
                : true
            const matchesPhone = phone ? user.phone.includes(phone) : true
            const matchesRole = user.role !== 'removed'

            return (
                matchesUsername && matchesEmail && matchesPhone && matchesRole
            )
        })
    }, [userList, username, email, phone])

    const handlePageChange = (page: number) => {
        dispatch(setPageIndex(page))
    }

    const handleSizeChange = (size: number) => {
        dispatch(setPageIndex(1))
        dispatch(setPageSize(size))
    }

    const columns: ColumnDef<User>[] = useMemo(() => {
        const baseColumns = [
            {
                header: 'STT',
                accessorKey: 'index',
                enableSorting: false,
                cell: ({ row }: { row: Row<User> }) => (
                    <span>{(pageIndex - 1) * pageSize + row.index + 1}</span>
                ),
            },
            {
                header: t('user.account') ?? 'Tài khoản',
                accessorKey: 'username',
                enableSorting: false,
            },
            {
                header: t('user.fullName') ?? 'Họ và tên',
                accessorKey: 'fullName',
                enableSorting: false,
            },
            {
                header: 'Email',
                accessorKey: 'email',
                enableSorting: false,
            },
            {
                header: t('user.phone') ?? 'Số điện thoại',
                accessorKey: 'phone',
                enableSorting: false,
            },
            {
                header: t('user.role') ?? 'Vai trò',
                accessorKey: 'role',
                enableSorting: false,
            },

            {
                header: t('user.action') ?? 'Hành động',
                accessorKey: 'action',
                enableSorting: false,
                cell: ({ row }: { row: Row<User> }) => (
                    <ActionColumn row={row.original} />
                ),
            },
        ]
        return baseColumns
    }, [pageIndex, pageSize])

    return (
        <>
            <DataTable
                columns={columns}
                data={filteredUsers}
                loading={loading}
                pagingData={{
                    total: filteredUsers.length,
                    pageIndex: pageIndex,
                    pageSize: pageSize,
                }}
                onPaginationChange={handlePageChange}
                onSelectChange={handleSizeChange}
                isCenter={true}
            />
            <DeleteUserConfirmation />
        </>
    )
}

export default UsersTable
