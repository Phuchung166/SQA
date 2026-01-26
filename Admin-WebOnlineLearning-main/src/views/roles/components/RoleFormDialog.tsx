import { Button, Input, Dialog, Checkbox } from '@/components/ui'
import { Role, Permission } from '@/@types/online-learning'

interface RoleFormData {
    name: string
    description: string
    permissions: number[]
}

interface RoleFormDialogProps {
    isOpen: boolean
    onClose: () => void
    editingRole: Role | null
    formData: RoleFormData
    onFormDataChange: (data: RoleFormData) => void
    permissions: Permission[]
    onSubmit: () => void
}

const RoleFormDialog = ({
    isOpen,
    onClose,
    editingRole,
    formData,
    onFormDataChange,
    permissions,
    onSubmit,
}: RoleFormDialogProps) => {
    const handleInputChange = (
        field: keyof RoleFormData,
        value: string | number[]
    ) => {
        onFormDataChange({
            ...formData,
            [field]: value,
        })
    }

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        const newPermissions = checked
            ? [...formData.permissions, permissionId]
            : formData.permissions.filter((id) => id !== permissionId)

        handleInputChange('permissions', newPermissions)
    }

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = []
        }
        acc[permission.module].push(permission)
        return acc
    }, {} as Record<string, Permission[]>)

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div className="p-6 w-full max-w-2xl">
                <h5 className="text-lg font-semibold mb-4">
                    {editingRole ? 'Chỉnh sửa Role' : 'Tạo Role mới'}
                </h5>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tên Role
                        </label>
                        <Input
                            placeholder="Nhập tên role"
                            value={formData.name}
                            onChange={(e) =>
                                handleInputChange('name', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Mô tả
                        </label>
                        <Input
                            placeholder="Nhập mô tả"
                            value={formData.description}
                            onChange={(e) =>
                                handleInputChange('description', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phân quyền
                        </label>
                        <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                            {Object.entries(groupedPermissions).map(
                                ([module, modulePermissions]) => (
                                    <div key={module} className="mb-4">
                                        <h6 className="font-medium text-gray-700 mb-2 capitalize">
                                            {module}
                                        </h6>
                                        <div className="grid grid-cols-2 gap-2">
                                            {modulePermissions.map(
                                                (permission) => (
                                                    <Checkbox
                                                        key={permission.id}
                                                        checked={formData.permissions.includes(
                                                            permission.id
                                                        )}
                                                        onChange={(checked) =>
                                                            handlePermissionChange(
                                                                permission.id,
                                                                checked
                                                            )
                                                        }
                                                    >
                                                        <span className="text-sm">
                                                            {
                                                                permission.description
                                                            }
                                                        </span>
                                                    </Checkbox>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="default" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="solid" onClick={onSubmit}>
                        {editingRole ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default RoleFormDialog
