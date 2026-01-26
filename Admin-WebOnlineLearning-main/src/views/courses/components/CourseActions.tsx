import { useState } from 'react'
import { Button, toast, Notification } from '@/components/ui'
import {
    HiOutlineEye,
    HiOutlinePause,
    HiOutlineCheckCircle,
} from 'react-icons/hi'
import { Course } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/store'
import { getCourseDetail, approveOrRejectCourse } from '../store/courseSlice'
import CourseDecisionDialog from './CourseDecisionDialog'

interface CourseActionsProps {
    course: Course
    onDelete: (id: number) => void
    onRefresh?: () => void
}

const CourseActions = ({ course, onDelete, onRefresh }: CourseActionsProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const [decisionDialogOpen, setDecisionDialogOpen] = useState(false)
    const [approveLoading, setApproveLoading] = useState(false)
    const [rejectLoading, setRejectLoading] = useState(false)

    const handleView = () => {
        dispatch(getCourseDetail(course.id))
    }

    const handleManageDecision = () => {
        setDecisionDialogOpen(true)
    }

    const handleApprove = async (reason: string) => {
        setApproveLoading(true)
        try {
            console.log('Approving course:', course.id, 'Reason:', reason)
            const status_data = {
                course_status: 'ACTIVE',
                reason,
            }
            await dispatch(
                approveOrRejectCourse({ id: course.id, data: status_data })
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
                if (onRefresh) {
                    onRefresh()
                }
            }, 1500)
        } catch (error) {
            console.error('Failed to approve course:', error)
        } finally {
            setApproveLoading(false)
        }
    }

    const handleReject = async (reason: string) => {
        setRejectLoading(true)
        try {
            console.log('Rejecting course:', course.id, 'Reason:', reason)
            const status_data = {
                course_status: 'PUBLISHED',
                reason,
            }

            await dispatch(
                approveOrRejectCourse({ id: course.id, data: status_data })
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
                if (onRefresh) {
                    onRefresh()
                }
            }, 1500)
        } catch (error) {
            console.error('Failed to reject course:', error)
        } finally {
            setRejectLoading(false)
        }
    }

    const isPublished = course.status === 'PUBLISHED'
    const isActive = course.status === 'ACTIVE'

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    size="xs"
                    variant="twoTone"
                    icon={<HiOutlineEye />}
                    onClick={handleView}
                >
                    {t('courses.actions.view')}
                </Button>
                <Button
                    size="xs"
                    variant="twoTone"
                    icon={<HiOutlineCheckCircle />}
                    disabled={!isPublished}
                    onClick={handleManageDecision}
                >
                    {t('courses.actions.decision')}
                </Button>
                <Button
                    size="xs"
                    variant="twoTone"
                    color="red-600"
                    icon={<HiOutlinePause />}
                    disabled={!isActive}
                    onClick={() => onDelete(Number(course.id) || 0)}
                >
                    {t('courses.actions.deactivate')}
                </Button>
            </div>

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

export default CourseActions
