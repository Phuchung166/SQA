import { Button } from '@/components/ui'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { Role } from '@/@types/online-learning'

interface RoleActionsProps {
    role: Role
    onEdit: (role: Role) => void
    onDelete: (id: number) => void
}

const RoleActions = ({ role, onEdit, onDelete }: RoleActionsProps) => {
    return (
        <div className="flex items-center gap-2">
            <Button
                size="xs"
                variant="twoTone"
                icon={<HiOutlinePencil />}
                onClick={() => onEdit(role)}
            >
                Sửa
            </Button>
            <Button
                size="xs"
                variant="twoTone"
                color="red-600"
                icon={<HiOutlineTrash />}
                onClick={() => onDelete(role.id)}
            >
                Xóa
            </Button>
        </div>
    )
}

export default RoleActions
