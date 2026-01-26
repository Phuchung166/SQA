import { CourseDetail } from '@/@types/online-learning'
import { Card, Avatar, Badge } from '@/components/ui'
import CourseModulesSection from './CourseModulesSection'
import {
    HiOutlineUser,
    HiOutlineClock,
    HiOutlineBookOpen,
    HiOutlineUserGroup,
    HiOutlineStar,
    HiOutlineVideoCamera,
    HiOutlineCheckCircle,
    HiOutlineCalendar,
    HiOutlineGlobe,
    HiOutlineAcademicCap,
    HiOutlineCurrencyDollar,
} from 'react-icons/hi'

interface CourseDetailPageProps {
    course: CourseDetail
}

const CourseDetailPage = ({ course }: CourseDetailPageProps) => {
    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: currency || 'VND',
        }).format(price)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa cập nhật'
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatDuration = (milliseconds?: number) => {
        if (!milliseconds) return '0 phút'
        const totalSeconds = Math.floor(milliseconds / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        if (hours > 0) {
            return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`
        }
        return `${minutes} phút`
    }

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'published':
                return (
                    <Badge className="bg-green-100 text-blue-600">
                        {status}
                    </Badge>
                )
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-600">
                        {status}
                    </Badge>
                )
            case 'draft':
                return (
                    <Badge className="bg-gray-100 text-gray-600">
                        {status}
                    </Badge>
                )
            case 'deactivated':
                return (
                    <Badge className="bg-red-100 text-red-600">{status}</Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    const getLevelBadge = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return (
                    <Badge className="bg-blue-100 text-blue-600">{level}</Badge>
                )
            case 'intermediate':
                return (
                    <Badge className="bg-purple-100 text-purple-600">
                        {level}
                    </Badge>
                )
            case 'advanced':
                return (
                    <Badge className="bg-orange-100 text-orange-600">
                        {level}
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-600">{level}</Badge>
                )
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-80 h-48 object-cover rounded-lg shadow-md"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        {course.title}
                                    </h3>
                                    <div
                                        className="text-gray-600 mb-3 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: course.short_description,
                                        }}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {getStatusBadge(course.status)}
                                    {course.is_priority && (
                                        <Badge className="bg-amber-100 text-amber-600">
                                            Ưu tiên
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Thông tin tóm tắt */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <HiOutlineAcademicCap className="text-blue-500 text-lg" />
                                    <span className="text-gray-500">
                                        Danh mục:
                                    </span>
                                    <span className="font-medium">
                                        {course.category.name ||
                                            'Chưa phân loại'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <HiOutlineGlobe className="text-green-500 text-lg" />
                                    <span className="text-gray-500">
                                        Ngôn ngữ:
                                    </span>
                                    <span className="font-medium">
                                        {course.language}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <HiOutlineBookOpen className="text-purple-500 text-lg" />
                                    <span className="text-gray-500">
                                        Cấp độ:
                                    </span>
                                    {getLevelBadge(course.level)}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <HiOutlineVideoCamera className="text-red-500 text-lg" />
                                    <span className="text-gray-500">
                                        Loại khóa học:
                                    </span>
                                    <span className="font-medium">
                                        {course.course_type}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <HiOutlineCurrencyDollar className="text-green-600 text-xl" />
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatPrice(
                                            course.price,
                                            course.currency
                                        )}
                                    </span>
                                </div>
                                {course.original_price &&
                                    course.original_price > course.price && (
                                        <span className="text-lg text-gray-400 line-through">
                                            {formatPrice(
                                                course.original_price,
                                                course.currency
                                            )}
                                        </span>
                                    )}
                                {course.is_free && (
                                    <Badge className="bg-green-100 text-green-600">
                                        Free
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div
                className={`grid ${
                    course.status.toLowerCase() === 'draft' ||
                    course.status.toLowerCase() === 'published'
                        ? 'grid-cols-2'
                        : 'grid-cols-4'
                } gap-4`}
            >
                {course.status.toLowerCase() !== 'draft' &&
                    course.status.toLowerCase() !== 'published' && (
                        <Card>
                            <div className="p-6 text-center">
                                <HiOutlineUserGroup className="text-4xl text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold">
                                    {course.total_students.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Học viên
                                </div>
                            </div>
                        </Card>
                    )}
                <Card>
                    <div className="p-6 text-center">
                        <HiOutlineBookOpen className="text-4xl text-purple-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                            {course.total_lessons}
                        </div>
                        <div className="text-sm text-gray-500">Bài học</div>
                    </div>
                </Card>
                <Card>
                    <div className="p-6 text-center">
                        <HiOutlineClock className="text-4xl text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                            {formatDuration(course.duration)}
                        </div>
                        <div className="text-sm text-gray-500">Thời lượng</div>
                    </div>
                </Card>
                {course.status.toLowerCase() !== 'draft' &&
                    course.status.toLowerCase() !== 'published' && (
                        <Card>
                            <div className="p-6 text-center">
                                <HiOutlineStar className="text-4xl text-amber-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold">
                                    {course.review?.avg_rating || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                    ({course.review?.total_reviews} đánh giá)
                                </div>
                            </div>
                        </Card>
                    )}
            </div>

            {/* Instructor Information */}
            <Card>
                <div className="p-6">
                    <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <HiOutlineUser className="text-blue-500" />
                        Giảng viên
                    </h5>
                    <div className="flex items-start gap-4">
                        <Avatar
                            src={course.instructor.avatar || undefined}
                            alt={
                                course.instructor.first_name ||
                                course.instructor.last_name
                                    ? `${course.instructor.first_name || ''} ${
                                          course.instructor.last_name || ''
                                      }`
                                    : course.instructor.account_name
                            }
                            className="w-20 h-20"
                        />
                        <div className="flex-1">
                            <h6 className="text-xl font-semibold mb-1">
                                {course.instructor.first_name ||
                                course.instructor.last_name
                                    ? `${course.instructor.first_name || ''} ${
                                          course.instructor.last_name || ''
                                      }`
                                    : 'Chưa cập nhật'}
                            </h6>
                            <p className="text-gray-600 mb-2">
                                @{course.instructor.account_name}
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">
                                        Chuyên môn:
                                    </span>
                                    <span
                                        className={
                                            course.instructor.expertise
                                                ? 'font-medium'
                                                : 'text-gray-400 italic'
                                        }
                                    >
                                        {course.instructor.expertise ||
                                            'Chưa cập nhật'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">
                                        Trình độ:
                                    </span>
                                    <span
                                        className={
                                            course.instructor.qualification
                                                ? 'font-medium'
                                                : 'text-gray-400 italic'
                                        }
                                    >
                                        {course.instructor.qualification ||
                                            'Chưa cập nhật'}
                                    </span>
                                </div>
                                {course.instructor.bio ? (
                                    <div className="text-sm text-gray-600 mt-3">
                                        <p>{course.instructor.bio}</p>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic mt-3">
                                        <p>Chưa có thông tin giới thiệu</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Course Description */}
            <Card>
                <div className="p-6">
                    <h5 className="text-lg font-semibold mb-4">
                        Mô tả khóa học
                    </h5>
                    <div
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{
                            __html: course.description,
                        }}
                    ></div>
                </div>
            </Card>

            {/* Course Modules */}
            <CourseModulesSection courseId={parseInt(course.id)} />

            {course.what_you_learn && (
                <Card>
                    <div className="p-6">
                        <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <HiOutlineCheckCircle className="text-green-500" />
                            Bạn sẽ học được gì
                        </h5>
                        <div className="prose max-w-none text-gray-700">
                            <p>{course.what_you_learn}</p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
                {/* Requirements */}
                {course.requirements && (
                    <Card>
                        <div className="p-6">
                            <h5 className="text-lg font-semibold mb-4">
                                Yêu cầu
                            </h5>
                            <div className="prose max-w-none text-gray-700">
                                <p>{course.requirements}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Target Audience */}
                {course.target_audience && (
                    <Card>
                        <div className="p-6">
                            <h5 className="text-lg font-semibold mb-4">
                                Đối tượng phù hợp
                            </h5>
                            <div className="prose max-w-none text-gray-700">
                                <p>{course.target_audience}</p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {course.preview_video && (
                <Card>
                    <div className="p-6">
                        <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <HiOutlineVideoCamera className="text-red-500" />
                            Video giới thiệu
                        </h5>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <video
                                controls
                                src={course.preview_video}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Additional Information */}
            <Card>
                <div className="p-6">
                    <h5 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <HiOutlineCalendar className="text-blue-500" />
                        Thông tin bổ sung
                    </h5>
                    <div className="grid grid-cols-3 gap-6">
                        {/* <div>
                            <span className="text-gray-500 text-sm">ID:</span>
                            <p className="font-medium">{course.id}</p>
                        </div> */}
                        {/* <div>
                            <span className="text-gray-500 text-sm">Slug:</span>
                            <p className="font-medium">{course.slug}</p>
                        </div> */}
                        <div>
                            <span className="text-gray-500 text-sm">
                                Ngày tạo:
                            </span>
                            <p className="font-medium">
                                {formatDate(course.created_at)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">
                                Cập nhật:
                            </span>
                            <p className="font-medium">
                                {formatDate(course.updated_at)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm">
                                Xuất bản:
                            </span>
                            <p className="font-medium">
                                {formatDate(course.published_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default CourseDetailPage
