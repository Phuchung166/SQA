import { Dialog, Button, Spinner } from '@/components/ui'
import CourseDetailPage from './CourseDetailPage'
import { useTranslation } from 'react-i18next'
import { CourseDetail } from '@/@types/online-learning'
import { useState } from 'react'
import CourseDecisionDialog from './CourseDecisionDialog'
import toast from '@/components/ui/toast'
import { Notification } from '@/components/ui'
import { useAppDispatch } from '@/store'
import { approveOrRejectCourse } from '../store/courseSlice'

interface CourseDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    courseDetail: CourseDetail | null
    loading?: boolean
    onRefresh?: () => void
}

const CourseDetailDialog = ({
    isOpen,
    onClose,
    courseDetail,
    loading = false,
    onRefresh,
}: CourseDetailDialogProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const [decisionDialogOpen, setDecisionDialogOpen] = useState(false)
    const [approveLoading, setApproveLoading] = useState(false)
    const [rejectLoading, setRejectLoading] = useState(false)

    const handleApprove = async (reason: string) => {
        setApproveLoading(true)
        try {
            const status_data = {
                course_status: 'ACTIVE',
                reason,
            }
            await dispatch(
                approveOrRejectCourse({
                    id: courseDetail?.id,
                    data: status_data,
                })
            ).unwrap()

            setDecisionDialogOpen(false)

            toast.push(
                <Notification
                    title={t('courses.messages.approveSuccess') as string}
                    type="success"
                >
                    {t('courses.messages.approveSuccess')}
                </Notification>
            )

            setTimeout(() => {
                onClose()
                if (onRefresh) {
                    onRefresh()
                }
            }, 1500)
        } catch (error) {
            console.error('Failed to approve course:', error)
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('courses.messages.approveError')}
                </Notification>
            )
        } finally {
            setApproveLoading(false)
        }
    }

    const handleReject = async (reason: string) => {
        setRejectLoading(true)
        try {
            const status_data = {
                course_status: 'PUBLISHED',
                reason,
            }
            await dispatch(
                approveOrRejectCourse({
                    id: courseDetail?.id,
                    data: status_data,
                })
            ).unwrap()

            setDecisionDialogOpen(false)

            toast.push(
                <Notification
                    title={t('courses.messages.rejectSuccess') as string}
                    type="success"
                >
                    {t('courses.messages.rejectSuccess')}
                </Notification>
            )

            setTimeout(() => {
                onClose()
                if (onRefresh) {
                    onRefresh()
                }
            }, 1500)
        } catch (error) {
            console.error('Failed to reject course:', error)
            toast.push(
                <Notification title={t('common.error') as string} type="danger">
                    {t('courses.messages.rejectError')}
                </Notification>
            )
        } finally {
            setRejectLoading(false)
        }
    }

    const isPublished = courseDetail?.status === 'PUBLISHED'

    return (
        <>
            <Dialog
                isOpen={isOpen}
                width={1200}
                closable={false}
                shouldCloseOnOverlayClick={true}
                bodyOpenClassName="overflow-hidden"
                onClose={onClose}
                onRequestClose={onClose}
            >
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spinner size={40} />
                        </div>
                    ) : courseDetail ? (
                        <>
                            <CourseDetailPage course={courseDetail} />
                            <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
                                <Button variant="default" onClick={onClose}>
                                    {t('common.close') || 'Đóng'}
                                </Button>
                                {isPublished && (
                                    <Button
                                        variant="solid"
                                        onClick={() =>
                                            setDecisionDialogOpen(true)
                                        }
                                    >
                                        {t('courses.actions.decision') ||
                                            'Duyệt'}
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <p>Cannot find course detail</p>
                        </div>
                    )}
                </div>
            </Dialog>

            <CourseDecisionDialog
                isOpen={decisionDialogOpen}
                approveLoading={approveLoading}
                rejectLoading={rejectLoading}
                onClose={() => setDecisionDialogOpen(false)}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </>
    )
}

export default CourseDetailDialog
