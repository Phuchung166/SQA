import { Button, Avatar, Badge, Dialog } from '@/components/ui'
import { Instructor } from '@/@types/online-learning'
import { useTranslation } from 'react-i18next'

interface InstructorDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    instructor: Instructor | null
}

const InstructorDetailDialog = ({
    isOpen,
    onClose,
    instructor,
}: InstructorDetailDialogProps) => {
    const { t } = useTranslation()

    if (!instructor) return null

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge className="bg-orange-100 text-orange-600">
                        {t('instructors.status.pending')}
                    </Badge>
                )
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-600">
                        {t('instructors.status.active')}
                    </Badge>
                )
            case 'inactive':
                return (
                    <Badge className="bg-red-100 text-red-600">
                        {t('instructors.status.inactive')}
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <div className="p-6 w-full max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <Avatar
                        src={instructor.user?.avatar}
                        className="w-16 h-16"
                    />
                    <div>
                        <h5 className="text-xl font-semibold">
                            {instructor.user?.fullName}
                        </h5>
                        <p className="text-gray-600">
                            {instructor.user?.email}
                        </p>
                        {getStatusBadge(instructor.approval_status)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h6 className="font-medium mb-3">
                            {t('instructors.detail.personalInfo')}
                        </h6>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500">
                                    {t('instructors.detail.phone')}:
                                </span>{' '}
                                {instructor.user?.phone}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    {t('instructors.detail.specialization')}:
                                </span>{' '}
                                {instructor.expertise}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    {t('instructors.detail.experience')}:
                                </span>{' '}
                                {instructor.experience_years}{' '}
                                {t('instructors.table.years')}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    {t('instructors.detail.education')}:
                                </span>{' '}
                                {instructor.qualification}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h6 className="font-medium mb-3">
                            Thông tin ngân hàng
                        </h6>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500">
                                    Ngân hàng:
                                </span>{' '}
                                {instructor.bank_name}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Số tài khoản:
                                </span>{' '}
                                {instructor.bank_account}
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Mã số thuế:
                                </span>{' '}
                                {instructor.tax_code}
                            </div>
                            <div>
                                <span className="text-gray-500">Hoa hồng:</span>{' '}
                                {instructor.commission_rate}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h6 className="font-medium mb-3">
                        {t('instructors.detail.performanceInfo')}
                    </h6>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {instructor.total_courses}
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('instructors.detail.totalCourses')}
                            </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {instructor.total_students}
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('instructors.detail.totalStudents')}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {formatCurrency(instructor.total_revenue)}
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('instructors.detail.totalRevenue')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="default" onClick={onClose}>
                        {t('instructors.detail.close')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default InstructorDetailDialog
