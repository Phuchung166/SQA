import { useEffect, useState } from 'react'
import { Notification } from '@/components/ui'
import { Container, ConfirmDialog } from '@/components/shared'
import { Role } from '@/@types/online-learning'
import toast from '@/components/ui/toast'
import { useTranslation } from 'react-i18next'
import RolesHeader from './components/RolesHeader'
import RolesTable from './components/RolesTable'
import RoleFormDialog from './components/RoleFormDialog'
import { injectReducer } from '@/store'
import reducer, {
    useAppSelector,
    useAppDispatch,
    getRoles,
    getPermissions,
    createRole,
    updateRole,
    deleteRole,
    setSelectedRole,
    toggleCreateDialog,
    toggleEditDialog,
    setFormData,
    resetFormData,
    SLICE_NAME,
} from './store'

injectReducer(SLICE_NAME, reducer)

const Roles = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const {
        roles,
        permissions,
        loading,
        selectedRole,
        createDialog,
        editDialog,
        formData,
    } = useAppSelector((state) => state.roles.data)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [pendingRoleId, setPendingRoleId] = useState<number | null>(null)

    useEffect(() => {
        dispatch(getRoles())
        dispatch(getPermissions())
    }, [dispatch])

    const handleCreate = () => {
        dispatch(resetFormData())
        dispatch(setSelectedRole(null))
        dispatch(toggleCreateDialog(true))
    }

    const handleEdit = (role: Role) => {
        dispatch(setSelectedRole(role))
        dispatch(
            setFormData({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions?.map((p) => p.id) || [],
            })
        )
        dispatch(toggleEditDialog(true))
    }

    const handleSubmit = async () => {
        try {
            if (selectedRole) {
                await dispatch(
                    updateRole({
                        id: selectedRole.id,
                        data: formData as unknown as Record<string, unknown>,
                    })
                ).unwrap()
                toast.push(
                    <Notification title="Thành công" type="success">
                        Cập nhật role thành công
                    </Notification>
                )
            } else {
                await dispatch(
                    createRole(formData as unknown as Record<string, unknown>)
                ).unwrap()
                toast.push(
                    <Notification title="Thành công" type="success">
                        Tạo role thành công
                    </Notification>
                )
            }
            dispatch(getRoles()) // Refresh data
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    Có lỗi xảy ra
                </Notification>
            )
        }
    }

    const handleDeleteClick = (id: number) => {
        setPendingRoleId(id)
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (pendingRoleId === null) return
        try {
            await dispatch(deleteRole(pendingRoleId)).unwrap()
            toast.push(
                <Notification
                    title={t('common.success') as string}
                    type="success"
                >
                    {t('roles.messages.deleteSuccess')}
                </Notification>
            )
            setDeleteConfirmOpen(false)
            setPendingRoleId(null)
        } catch (error) {
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('roles.messages.deleteError')}
                </Notification>
            )
        }
    }

    const handleFormDataChange = (data: Partial<typeof formData>) => {
        dispatch(setFormData(data))
    }

    const handleCloseDialog = () => {
        dispatch(toggleCreateDialog(false))
        dispatch(toggleEditDialog(false))
    }

    return (
        <Container className="h-full">
            <RolesHeader onCreateRole={handleCreate} />

            <RolesTable
                roles={roles}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <RoleFormDialog
                isOpen={createDialog || editDialog}
                editingRole={selectedRole}
                formData={formData}
                permissions={permissions}
                onFormDataChange={handleFormDataChange}
                onSubmit={handleSubmit}
                onClose={handleCloseDialog}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                title={t('roles.confirmDelete.title') as string}
                message={t('roles.confirmDelete.message') as string}
                type="danger"
                confirmText={t('roles.confirmDelete.confirm') as string}
                cancelText={t('roles.confirmDelete.cancel') as string}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </Container>
    )
}

export default Roles
