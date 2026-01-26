import { Button } from '@/components/ui'
import { HiOutlinePlus } from 'react-icons/hi'

interface RolesHeaderProps {
    onCreateRole: () => void
}

const RolesHeader = ({ onCreateRole }: RolesHeaderProps) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-2xl font-bold">Quản lý nhóm quyền</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Quản lý vai trò và phân quyền trong hệ thống
                </p>
            </div>
            <Button
                variant="solid"
                icon={<HiOutlinePlus />}
                onClick={onCreateRole}
            >
                Tạo Role
            </Button>
        </div>
    )
}

export default RolesHeader
