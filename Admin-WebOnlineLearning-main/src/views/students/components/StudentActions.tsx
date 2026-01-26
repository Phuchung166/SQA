import { Button } from '@/components/ui'
import {
    HiOutlineEye,
    HiOutlinePause,
    HiOutlinePlay,
    HiOutlineTrash,
} from 'react-icons/hi'
import { Student } from '@/@types/user'
import { useTranslation } from 'react-i18next'

interface StudentActionsProps {
    student: Student
    onView: (student: Student) => void
    // onSuspend: (email: string) => void
    // onActivate: (email: string) => void
    onDelete: (email: string) => void
}

const StudentActions = ({
    student,
    onView,
    // onSuspend,
    // onActivate,
    onDelete,
}: StudentActionsProps) => {
    const { t } = useTranslation()

    return (
        <div className="flex items-center gap-1">
            <Button
                size="xs"
                variant="twoTone"
                icon={<HiOutlineEye />}
                onClick={() => onView(student)}
            >
                {t('students.actions.view')}
            </Button>

            {/* <Button
                size="xs"
                variant="twoTone"
                color="orange-600"
                icon={<HiOutlinePause />}
                onClick={() => onSuspend(student.email)}
            >
                {t('students.actions.suspend')}
            </Button>

            <Button
                size="xs"
                variant="twoTone"
                color="green-600"
                icon={<HiOutlinePlay />}
                onClick={() => onActivate(student.email)}
            >
                {t('students.actions.activate')}
            </Button> */}

            <Button
                size="xs"
                variant="twoTone"
                color="red-600"
                icon={<HiOutlineTrash />}
                onClick={() => onDelete(student.email)}
            >
                {t('students.actions.delete')}
            </Button>
        </div>
    )
}

export default StudentActions
