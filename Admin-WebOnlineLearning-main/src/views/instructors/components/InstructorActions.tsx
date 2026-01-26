import { Button } from '@/components/ui'
import {
    HiOutlineEye,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlinePause,
    HiOutlinePlay,
} from 'react-icons/hi'
import { Instructor } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'

interface InstructorActionsProps {
    instructor: Instructor
    onView: (instructor: Instructor) => void
    onApprove: (id: string) => void
    onReject: (id: string) => void
    onSuspend: (id: string) => void
    onActivate: (id: string) => void
}

const InstructorActions = ({
    instructor,
    onView,
    onApprove,
    onReject,
    onSuspend,
    onActivate,
}: InstructorActionsProps) => {
    const { t } = useTranslation()

    return (
        <div className="flex items-center gap-1">
            <Button
                size="xs"
                variant="twoTone"
                icon={<HiOutlineEye />}
                onClick={() => onView(instructor)}
            >
                {t('instructors.actions.view')}
            </Button>

            {instructor.approval_status === 'pending' && (
                <>
                    <Button
                        size="xs"
                        variant="twoTone"
                        color="green-600"
                        icon={<HiOutlineCheck />}
                        onClick={() => onApprove(instructor.id)}
                    >
                        {t('instructors.actions.approve')}
                    </Button>
                    <Button
                        size="xs"
                        variant="twoTone"
                        color="red-600"
                        icon={<HiOutlineX />}
                        onClick={() => onReject(instructor.id)}
                    >
                        {t('instructors.actions.suspend')}
                    </Button>
                </>
            )}

            {instructor.approval_status === 'approved' && (
                <Button
                    size="xs"
                    variant="twoTone"
                    color="orange-600"
                    icon={<HiOutlinePause />}
                    onClick={() => onSuspend(instructor.id)}
                >
                    {t('instructors.actions.suspend')}
                </Button>
            )}

            {instructor.user?.status === 'inactive' && (
                <Button
                    size="xs"
                    variant="twoTone"
                    color="blue-600"
                    icon={<HiOutlinePlay />}
                    onClick={() => onActivate(instructor.id)}
                >
                    {t('instructors.actions.activate')}
                </Button>
            )}
        </div>
    )
}

export default InstructorActions
