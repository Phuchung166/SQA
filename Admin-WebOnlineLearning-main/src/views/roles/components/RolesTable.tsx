import { AdaptableCard, DataTable } from '@/components/shared'
import { HiOutlineShieldCheck } from 'react-icons/hi'
import { Role } from '@/@types/online-learning'
import { TableRow } from '@/@types/user'
import RoleActions from './RoleActions'

interface RolesTableProps {
    roles: Role[]
    loading: boolean
    onEdit: (role: Role) => void
    onDelete: (id: number) => void
}

const RolesTable = ({ roles, loading, onEdit, onDelete }: RolesTableProps) => {
    const columns = [
        {
            header: 'Tên Role',
            accessorKey: 'name',
            cell: ({ row }: { row: TableRow }) => (
                <div className="flex items-center gap-2">
                    <HiOutlineShieldCheck className="text-lg text-blue-500" />
                    <span className="font-medium">{row.original.name}</span>
                </div>
            ),
        },
        {
            header: 'Mô tả',
            accessorKey: 'description',
        },
        {
            header: 'Số quyền',
            accessorKey: 'permissions',
            cell: ({ row }: { row: TableRow }) => (
                <span className="text-sm text-gray-600">
                    {row.original.permissions?.length || 0} quyền
                </span>
            ),
        },
        {
            header: 'Ngày tạo',
            accessorKey: 'created_at',
            cell: ({ row }: { row: TableRow }) => (
                <span className="text-sm text-gray-600">
                    {new Date(row.original.created_at).toLocaleDateString(
                        'vi-VN'
                    )}
                </span>
            ),
        },
        {
            header: 'Thao tác',
            accessorKey: 'actions',
            cell: ({ row }: { row: TableRow }) => (
                <RoleActions
                    role={row.original}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        },
    ]

    return (
        <AdaptableCard>
            <DataTable columns={columns} data={roles} loading={loading} />
        </AdaptableCard>
    )
}

export default RolesTable
