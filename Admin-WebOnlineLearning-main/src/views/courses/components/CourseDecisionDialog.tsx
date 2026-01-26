import { Dialog, Button } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

interface CourseDecisionDialogProps {
    isOpen: boolean
    approveLoading?: boolean
    rejectLoading?: boolean
    onClose: () => void
    onApprove: (reason: string) => void
    onReject: (reason: string) => void
}

const CourseDecisionDialog = ({
    isOpen,
    approveLoading = false,
    rejectLoading = false,
    onClose,
    onApprove,
    onReject,
}: CourseDecisionDialogProps) => {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')

    const handleApprove = () => {
        onApprove(reason)
        setReason('') // Reset after action
    }

    const handleReject = () => {
        onReject(reason)
        setReason('') // Reset after action
    }

    const handleClose = () => {
        setReason('') // Reset when closing
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            width={600}
            closable={true}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <div className="p-6">
                <h5 className="text-lg font-semibold mb-4">
                    {t('courses.decision.title') || 'Course Decision'}
                </h5>

                <div className="mb-6">
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={5}
                        placeholder={
                            t('courses.decision.reasonPlaceholder') ||
                            'Enter your reason here...'
                        }
                        value={reason}
                        // disabled={loading}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {t('courses.decision.reasonHint') ||
                            'Please provide a reason for your decision'}
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="default"
                        // disabled={loading}
                        onClick={handleClose}
                    >
                        {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button
                        variant="solid"
                        color="red-600"
                        loading={rejectLoading}
                        disabled={!reason.trim() || rejectLoading}
                        onClick={handleReject}
                    >
                        {t('courses.actions.reject') || 'Reject'}
                    </Button>
                    <Button
                        variant="solid"
                        color="green-600"
                        loading={approveLoading}
                        disabled={!reason.trim() || approveLoading}
                        onClick={handleApprove}
                    >
                        {t('courses.actions.approve') || 'Approve'}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default CourseDecisionDialog
