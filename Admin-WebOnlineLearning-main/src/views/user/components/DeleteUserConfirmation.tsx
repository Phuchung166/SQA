import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    toggleDeleteDialog,
    useAppDispatch,
    useAppSelector,
    setSelectedUser,
    getUsers,
    deleteUsers,
} from '../store'
import { HTTP_STATUS_CODES } from '@/constants/code.constant'

const DeleteUserConfirmation = () => {
    const dispatch = useAppDispatch()
    const { deleteDialog, selectedUser } = useAppSelector(
        (state) => state.users.data
    )
    const onDialogClose = () => {
        dispatch(toggleDeleteDialog(false))
    }

    const onDelete = async () => {
        if (!selectedUser) return
        try {
            await dispatch(
                deleteUsers({ username: selectedUser.username })
            ).unwrap()
            dispatch(getUsers({}))
            toast.push(
                <Notification
                    title={'Thành công'}
                    type="success"
                    duration={2500}
                >
                    Đã xóa tài khoản thành công
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
            dispatch(toggleDeleteDialog(false))
        } catch (error: any) {
            if (error.response.status === HTTP_STATUS_CODES.FORBIDDEN) {
                toast.push(
                    <Notification
                        title={'Thất bại'}
                        type="warning"
                        duration={2500}
                    >
                        Bạn không có quyền xóa tài khoản{' '}
                        <span className="font-bold">
                            {selectedUser?.username}
                        </span>
                    </Notification>,
                    {
                        placement: 'top-center',
                    }
                )
            } else {
                toast.push(
                    <Notification
                        title={'Thất bại'}
                        type="warning"
                        duration={2500}
                    >
                        Đã xảy ra lỗi khi xóa tài khoản
                    </Notification>
                )
            }
        } finally {
            dispatch(setSelectedUser(null))
        }
    }

    return (
        <ConfirmDialog
            isOpen={deleteDialog}
            type="danger"
            title="Xác nhận xóa người dùng"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>
                Bạn có chắc chắn muốn xóa tài khoản{' '}
                <span className="font-bold">{selectedUser?.username}</span>
                không?
            </p>
        </ConfirmDialog>
    )
}

export default DeleteUserConfirmation
