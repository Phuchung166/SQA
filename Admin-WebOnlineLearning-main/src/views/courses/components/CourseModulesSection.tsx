import { useEffect, useState } from 'react'
import { Card, Spinner, Dialog, Button } from '@/components/ui'
import {
    CourseModule,
    CourseModulesResponse,
    Lesson,
} from '@/@types/online-learning'
import { apiGetCourseModules } from '@/services/CourseService'
import { useTranslation } from 'react-i18next'
import {
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineVideoCamera,
    HiOutlineDocument,
    HiOutlineQuestionMarkCircle,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineEye,
    HiOutlineX,
} from 'react-icons/hi'
import toast from '@/components/ui/toast'
import { Notification } from '@/components/ui'

interface CourseModulesSectionProps {
    courseId: number
}

const CourseModulesSection = ({ courseId }: CourseModulesSectionProps) => {
    const { t } = useTranslation()
    const [modules, setModules] = useState<CourseModule[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedModules, setExpandedModules] = useState<number[]>([])
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
    const [videoDialogOpen, setVideoDialogOpen] = useState(false)

    useEffect(() => {
        fetchModules()
    }, [courseId])

    const fetchModules = async () => {
        setLoading(true)
        try {
            const response = await apiGetCourseModules<CourseModulesResponse>({
                courseId,
                page: 1,
                pageSize: 100,
            })
            setModules(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch course modules:', error)
            toast.push(
                <Notification title={t('common.error') || ''} type="danger">
                    {t('courses.detail.noModulesAvailable')}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const toggleModule = (moduleId: number) => {
        setExpandedModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId]
        )
    }

    const formatDuration = (milliseconds: number) => {
        if (!milliseconds) return '0s'
        const totalSeconds = Math.floor(milliseconds / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        if (minutes > 0) {
            return `${minutes}m ${secs}s`
        }
        return `${secs}s`
    }

    if (loading) {
        return (
            <Card>
                <div className="p-6 flex justify-center">
                    <Spinner />
                </div>
            </Card>
        )
    }

    if (!modules || modules.length === 0) {
        return (
            <Card>
                <div className="p-6 text-center text-gray-500">
                    <p>{t('courses.detail.noModulesAvailable')}</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="p-6">
                <h5 className="text-lg font-semibold mb-4">
                    {t('courses.detail.courseContent')}
                </h5>
                <div className="space-y-2">
                    {modules.map((module) => (
                        <div key={module.id} className="border rounded-lg">
                            {/* Module Header */}
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-3 flex-1 text-left">
                                    <div>
                                        {expandedModules.includes(module.id) ? (
                                            <HiOutlineChevronUp className="text-gray-600" />
                                        ) : (
                                            <HiOutlineChevronDown className="text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h6 className="font-medium text-gray-900">
                                            {module.title}
                                        </h6>
                                        <p className="text-sm text-gray-500">
                                            {module.total_lessons || 0}{' '}
                                            {t('courses.detail.lessons')}
                                            {module.duration
                                                ? ` • ${formatDuration(
                                                      module.duration
                                                  )}`
                                                : ''}
                                            {module.is_preview && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                                                    <HiOutlineEye className="w-4 h-4" />
                                                    {t(
                                                        'courses.detail.preview'
                                                    )}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Module Content */}
                            {expandedModules.includes(module.id) && (
                                <div className="border-t bg-gray-50 px-4 py-3 space-y-2">
                                    {/* Lessons */}
                                    {module.lessons &&
                                        module.lessons.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    {t(
                                                        'courses.detail.lessons'
                                                    )}
                                                </p>
                                                <div className="space-y-1 ml-6">
                                                    {module.lessons.map(
                                                        (lesson) => (
                                                            <div
                                                                key={lesson.id}
                                                                className="flex items-center justify-between gap-2 text-sm py-1 hover:bg-gray-100 px-2 rounded transition"
                                                            >
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    {lesson.content_type ===
                                                                    'video' ? (
                                                                        <HiOutlineVideoCamera className="text-red-500 w-4 h-4" />
                                                                    ) : (
                                                                        <HiOutlineDocument className="text-blue-500 w-4 h-4" />
                                                                    )}
                                                                    <span className="flex-1 text-gray-700">
                                                                        {
                                                                            lesson.title
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-500">
                                                                    {lesson.duration && (
                                                                        <span className="flex items-center gap-1">
                                                                            <HiOutlineClock className="w-3 h-3" />
                                                                            {formatDuration(
                                                                                lesson.duration
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    {lesson.is_completed && (
                                                                        <HiOutlineCheckCircle className="text-green-500 w-4 h-4" />
                                                                    )}
                                                                    {lesson.is_mandatory && (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                                            {t(
                                                                                'courses.detail.required'
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    {lesson.content_type ===
                                                                        'video' &&
                                                                        lesson.video_url && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedLesson(
                                                                                        lesson
                                                                                    )
                                                                                    setVideoDialogOpen(
                                                                                        true
                                                                                    )
                                                                                }}
                                                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                                                title="Watch video"
                                                                            >
                                                                                <HiOutlineEye className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* Quizzes */}
                                    {module.quizzes &&
                                        module.quizzes.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Quizzes
                                                </p>
                                                <div className="space-y-1 ml-6">
                                                    {module.quizzes.map(
                                                        (quiz) => (
                                                            <div
                                                                key={quiz.id}
                                                                className="flex items-center gap-2 text-sm py-1"
                                                            >
                                                                <HiOutlineQuestionMarkCircle className="text-purple-500 w-4 h-4" />
                                                                <span className="flex-1 text-gray-700">
                                                                    {quiz.title}
                                                                </span>
                                                                {quiz.is_mandatory && (
                                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                                        {t(
                                                                            'courses.detail.required'
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {!module.lessons && !module.quizzes && (
                                        <p className="text-sm text-gray-500">
                                            No content available
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Playback Dialog */}
            <Dialog
                isOpen={videoDialogOpen}
                onClose={() => setVideoDialogOpen(false)}
            >
                {selectedLesson && (
                    <div className="p-6 w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold">
                                {selectedLesson.title}
                            </h5>
                            <button
                                onClick={() => setVideoDialogOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <HiOutlineX size={24} />
                            </button>
                        </div>
                        {selectedLesson.video_url && (
                            <video
                                controls
                                width="100%"
                                className="rounded-lg bg-black"
                                style={{ maxHeight: '500px' }}
                            >
                                <source
                                    src={selectedLesson.video_url}
                                    type="video/mp4"
                                />
                                Your browser does not support video playback.
                            </video>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                onClick={() => setVideoDialogOpen(false)}
                                variant="plain"
                            >
                                {t('courses.detail.close')}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </Card>
    )
}

export default CourseModulesSection
