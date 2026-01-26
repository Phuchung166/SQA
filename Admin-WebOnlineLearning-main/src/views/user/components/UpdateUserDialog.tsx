import { Dialog, Button, toast, Notification } from '@/components/ui'
import {
    approveUsers,
    toggleUpdateDialog,
    useAppDispatch,
    useAppSelector,
    getUsers,
    setSelectedUser,
} from '../store'
import { apiApproveUser } from '@/services/UserService'
import { HTTP_STATUS_CODES } from '@/constants/code.constant'

const UpdateUserDialog = () => {
    const dispatch = useAppDispatch()
    const dialogOpen = useAppSelector((state) => state.users.data.updateDialog)
    const selectedUser = useAppSelector(
        (state) => state.users.data.selectedUser
    )

    const onDialogClose = () => {
        dispatch(toggleUpdateDialog(false))
    }

    const handleUpdate = async () => {
        if (!selectedUser) return
        try {
            await dispatch(
                approveUsers({ username: selectedUser.username })
            ).unwrap()
            dispatch(getUsers({}))
            toast.push(
                <Notification
                    title={'Thành công'}
                    type="success"
                    duration={2500}
                >
                    Đã cập nhật vai trò tài khoản thành công
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
            dispatch(toggleUpdateDialog(false))
        } catch (error: any) {
            if (error.response?.status === HTTP_STATUS_CODES.FORBIDDEN) {
                toast.push(
                    <Notification
                        title={'Thất bại'}
                        type="warning"
                        duration={2500}
                    >
                        Bạn không có quyền cập nhật tài khoản{' '}
                        <span className="font-bold">
                            {selectedUser?.username}
                        </span>
                    </Notification>,
                    {
                        placement: 'top-center',
                    }
                )
                dispatch(toggleUpdateDialog(false))
            } else {
                toast.push(
                    <Notification
                        title={'Thất bại'}
                        type="warning"
                        duration={2500}
                    >
                        Đã xảy ra lỗi khi cập nhật tài khoản
                    </Notification>
                )
                dispatch(toggleUpdateDialog(false))
            }
        } finally {
            dispatch(setSelectedUser(null))
        }
    }

    return (
        <Dialog
            isOpen={dialogOpen}
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            width={400}
        >
            <h4 className="text-lg font-semibold">
                Cập nhật vai trò tài khoản
            </h4>
            <div className="mt-4 flex flex-col gap-4">
                <div>
                    Bạn có chắc muốn cập nhật vai trò cho tài khoản{' '}
                    <b>{selectedUser?.username}</b>?
                </div>
                <Button variant="solid" onClick={handleUpdate}>
                    Xác nhận cập nhật
                </Button>
            </div>
        </Dialog>
    )
}

export default UpdateUserDialog
