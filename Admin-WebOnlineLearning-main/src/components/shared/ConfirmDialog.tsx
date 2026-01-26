import { Dialog, Button } from '@/components/ui'
import { HiOutlineExclamationTriangle } from 'react-icons/hi2'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'info'
    loading?: boolean
}

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'warning',
    loading = false,
}: ConfirmDialogProps) => {
    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    iconColor: 'text-red-600',
                    buttonColor: 'red-600',
                    bgColor: 'bg-red-50',
                }
            case 'warning':
                return {
                    iconColor: 'text-orange-600',
                    buttonColor: 'orange-600',
                    bgColor: 'bg-orange-50',
                }
            case 'info':
                return {
                    iconColor: 'text-blue-600',
                    buttonColor: 'blue-600',
                    bgColor: 'bg-blue-50',
                }
            default:
                return {
                    iconColor: 'text-orange-600',
                    buttonColor: 'orange-600',
                    bgColor: 'bg-orange-50',
                }
        }
    }

    const styles = getTypeStyles()

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div className="p-6 w-full max-w-md">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`${styles.bgColor} p-3 rounded-full`}>
                        <HiOutlineExclamationTriangle
                            className={`w-6 h-6 ${styles.iconColor}`}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="solid"
                        color={styles.buttonColor}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default ConfirmDialog
