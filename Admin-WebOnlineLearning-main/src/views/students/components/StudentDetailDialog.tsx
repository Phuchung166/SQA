import { Button, Avatar, Badge, Dialog } from '@/components/ui'
import { HiOutlineBookOpen, HiOutlineUserGroup } from 'react-icons/hi'
import { User, Enrollment, Student, avatar_default_url } from '@/@types/user'
import { useTranslation } from 'react-i18next'

interface StudentDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    student: Student | null
    enrollments: Enrollment[]
}

const StudentDetailDialog = ({
    isOpen,
    onClose,
    student,
    enrollments,
}: StudentDetailDialogProps) => {
    const { t } = useTranslation()

    if (!student) return null

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-600">
                        {t('students.status.active')}
                    </Badge>
                )
            case 'inactive':
                return (
                    <Badge className="bg-gray-100 text-gray-600">
                        {t('students.status.inactive')}
                    </Badge>
                )
            case 'banned':
                return (
                    <Badge className="bg-red-100 text-red-600">
                        {t('students.status.suspended')}
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    const getGenderText = (gender?: string) => {
        switch (gender) {
            case 'male':
                return 'Nam'
            case 'female':
                return 'Nữ'
            case 'other':
                return 'Khác'
            default:
                return 'Chưa cập nhật'
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div className="p-6 w-full max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <Avatar
                        src={student.avatar || avatar_default_url}
                        className="w-16 h-16"
                    />
                    <div>
                        <h5 className="text-xl font-semibold">
                            {student.account_name || 'Chưa cập nhật'}
                        </h5>
                        <p className="text-gray-600">{student.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h6 className="font-medium mb-3">
                            {t('students.detail.personalInfo')}
                        </h6>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500">
                                    Tên đăng nhập:
                                </span>{' '}
                                {student.account_name}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    {t('students.detail.phone')}:
                                </span>{' '}
                                {student.phone || 'Chưa cập nhật'}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Giới tính:
                                </span>{' '}
                                {getGenderText(student.gender || 'unknown')}
                            </div>
                            {student.date_of_birth && (
                                <div>
                                    <span className="text-gray-500">
                                        Ngày sinh:
                                    </span>{' '}
                                    {new Date(
                                        student.date_of_birth
                                    ).toLocaleDateString('vi-VN')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h6 className="font-medium mb-3">
                            Thông tin tài khoản
                        </h6>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500">
                                    {t('students.detail.joinDate')}:
                                </span>{' '}
                                {student.created_at
                                    ? new Date(
                                          student.created_at
                                      ).toLocaleDateString('vi-VN')
                                    : 'Chưa có'}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Cập nhật cuối:
                                </span>{' '}
                                {student.updated_at
                                    ? new Date(
                                          student.updated_at
                                      ).toLocaleDateString('vi-VN')
                                    : 'Chưa có'}
                            </div>
                            <div>
                                <span className="text-gray-500">Quyền:</span>{' '}
                                {/* {student.authority?.join(', ')} */}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h6 className="font-medium mb-3">
                        {t('students.detail.courseInfo')}
                    </h6>
                    {enrollments.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto">
                            <div className="grid gap-3">
                                {enrollments.map((enrollment: Enrollment) => (
                                    <div
                                        key={enrollment.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <HiOutlineBookOpen className="text-blue-500" />
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {enrollment.course?.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Tiến độ: {enrollment.progress}%
                                                - Đăng ký:{' '}
                                                {new Date(
                                                    enrollment.enrollment_date
                                                ).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                        {enrollment.completed_at && (
                                            <Badge className="bg-green-100 text-green-600">
                                                {t(
                                                    'students.detail.completedCourses'
                                                )}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <HiOutlineUserGroup className="mx-auto text-4xl mb-2" />
                            <p>Học viên chưa đăng ký khóa học nào</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="default" onClick={onClose}>
                        {t('students.detail.close')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default StudentDetailDialog
