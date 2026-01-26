'use client';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { Layout, Card, Collapse, Button, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

// Import course service and types
import {
  CreateCourseRequest,
  createCourse,
  CourseModule,
  CreateCourseModuleRequest,
} from '@/services/courseService';

// Import form components
import BasicInfoForm from './BasicInfoForm';
import MediaResourcesForm from './MediaResourcesForm';
import PricingForm from './PricingForm';
import CourseDetailsForm from './CourseDetailsForm';
import CourseModulesForm from './CourseModulesForm';

import CourseUploadTips from './CourseUploadTips';
import CreateModuleModal from './CreateModuleModal';
import CreateLessonModal from './CreateLessonModal';
import { useNotification } from '@/hooks/useMessage';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title } = Typography;

const CreateCourseMain = () => {
  // Always create STANDALONE courses with modules

  // Course data state
  const [courseData, setCourseData] = useState<CreateCourseRequest>({
    title: '',
    description: '',
    short_description: '',
    thumbnail: '',
    preview_video: '',
    category_id: 0,
    level: 'BEGINNER',
    price: 0,
    language: 'vi',
    currency: 'VND',
    is_free: false,
    what_you_learn: [],
    target_audiences: [],
    code: '',
    course_modules: [],
    enrollment_type: 'LIFETIME',
    expired_days: null,
    is_pre_order: false,
    pre_order_price: 0,
    pre_order_total_slots: 0,
    pre_order_start_date: '',
    pre_order_end_date: '',
  });

  // Course modules state (for STANDALONE courses)
  const [courseModules, setCourseModules] = useState<(CourseModule | CreateCourseModuleRequest)[]>(
    [],
  );

  // Modal states
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<CreateCourseModuleRequest | null>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editingLessonModuleId, setEditingLessonModuleId] = useState<number>(0);
  const router = useRouter();

  // Handle course data changes
  const updateCourseData = (field: keyof CreateCourseRequest, value: unknown) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Sync courseModules to courseData
  React.useEffect(() => {
    setCourseData(prev => ({
      ...prev,
      course_modules: courseModules as CreateCourseModuleRequest[],
    }));
  }, [courseModules]);

  // Handle edit module
  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module as CreateCourseModuleRequest);
    setIsModuleModalOpen(true);
  };

  // Handle delete module
  const handleDeleteModule = (moduleId: number) => {
    setCourseModules(prev => prev.filter((_, index) => moduleId !== index + 1));
    notification.success({
      message: tNotif('success'),
      description: t('messages.moduleDeleted') ?? 'Module deleted successfully',
      placement: 'topRight',
      duration: 3,
    });
  };

  // Handle edit lesson
  const handleEditLesson = (lesson: any, moduleId: number) => {
    setEditingLesson(lesson);
    setEditingLessonModuleId(moduleId);
    setIsLessonModalOpen(true);
  };

  // Handle delete lesson
  const handleDeleteLesson = (lessonId: number) => {
    setCourseModules(prev =>
      prev.map((module: any) => ({
        ...module,
        lessons: (module.lessons || []).filter((lesson: any) => lesson.id !== lessonId),
      })),
    );
    notification.success({
      message: tNotif('success'),
      description: t('messages.lessonDeleted') ?? 'Lesson deleted successfully',
      placement: 'topRight',
      duration: 3,
    });
  };

  const t = useTranslations('CreateCourse');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  // Handle course submission
  const handleSubmitCourse = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      const errors: string[] = [];

      if (!courseData.title.trim()) {
        errors.push(t('messages.titleRequired') ?? 'Course title is required');
      }

      if (!courseData.description.trim()) {
        errors.push(t('messages.descriptionRequired') ?? 'Course description is required');
      }

      if (!courseData.short_description.trim()) {
        errors.push(t('messages.shortDescriptionRequired') ?? 'Short description is required');
      }

      if (courseData.category_id === 0 || !courseData.category_id) {
        errors.push(t('messages.categoryRequired') ?? 'Category is required');
      }

      if (!courseData.thumbnail.trim()) {
        errors.push(t('messages.thumbnailRequired') ?? 'Course thumbnail is required');
      }

      if (!courseData.preview_video.trim()) {
        errors.push(t('messages.previewVideoRequired') ?? 'Preview video is required');
      }

      // For STANDALONE courses, check modules
      if (courseModules.length === 0) {
        errors.push(t('messages.modulesRequired') ?? 'At least one module is required');
      }

      // Pre-order validation - only paid courses can be pre-order
      if (courseData.is_pre_order) {
        if (courseData.is_free) {
          errors.push(
            t('messages.preOrderNotAllowedForFree') ?? 'Pre-order is not allowed for free courses',
          );
        }

        if (courseData.price <= 0) {
          errors.push(
            t('messages.preOrderRequiresPaidCourse') ??
              'Pre-order courses must have a price greater than 0',
          );
        }

        if (!courseData.pre_order_price && courseData.pre_order_price !== 0) {
          errors.push(t('messages.preOrderPriceRequired') ?? 'Pre-order price is required');
        }

        if (!courseData.pre_order_total_slots || courseData.pre_order_total_slots <= 0) {
          errors.push(
            t('messages.preOrderSlotsRequired') ??
              'Pre-order slots is required and must be greater than 0',
          );
        }

        if (!courseData.pre_order_start_date) {
          errors.push(
            t('messages.preOrderStartDateRequired') ?? 'Pre-order start date is required',
          );
        } else {
          // Check if start date is in the future
          const startDate = new Date(courseData.pre_order_start_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (startDate < today) {
            errors.push(
              t('messages.preOrderStartDateError') ?? 'Pre-order start date must be in the future',
            );
          }
        }

        if (!courseData.pre_order_end_date) {
          errors.push(t('messages.preOrderEndDateRequired') ?? 'Pre-order end date is required');
        }

        // Check if end date is after start date
        if (courseData.pre_order_start_date && courseData.pre_order_end_date) {
          const startDate = new Date(courseData.pre_order_start_date);
          const endDate = new Date(courseData.pre_order_end_date);
          if (endDate <= startDate) {
            errors.push(
              t('messages.preOrderEndDateError') ?? 'Pre-order end date must be after start date',
            );
          }
        }
      }

      // If there are validation errors, show them
      if (errors.length > 0) {
        notification.error({
          message: t('messages.validationError') ?? 'Validation Error',
          description: errors.join(' | '),
          placement: 'topRight',
          duration: 5,
        });
        setIsLoading(false);
        return;
      }

      // Prepare course data
      const normalizeToStringArray = (v: unknown): string[] => {
        if (!v) return [];
        if (Array.isArray(v))
          return v
            .map(i => (i == null ? '' : String(i)))
            .map(s => s.trim())
            .filter(Boolean);
        if (typeof v === 'string') {
          // split on newlines or commas
          const parts = v.includes('\n') ? v.split(/\r?\n/) : v.split(',');
          return parts.map(p => p.trim()).filter(Boolean);
        }
        return [];
      };

      const submitData: CreateCourseRequest = {
        ...courseData,
        what_you_learn: normalizeToStringArray(courseData.what_you_learn),
        target_audiences: normalizeToStringArray(courseData.target_audiences),
        // Add course modules directly to the course
        course_modules: courseModules.map(module => ({
          // copy all module fields, but ensure lessons is an array
          ...(module as any),
          lessons: (module as any).lessons ?? [],
        })) as CreateCourseModuleRequest[],
      };

      // Remove pre-order fields if course is free or not pre-order
      if (courseData.is_free || !courseData.is_pre_order) {
        delete (submitData as any).is_pre_order;
        delete (submitData as any).pre_order_price;
        delete (submitData as any).pre_order_total_slots;
        delete (submitData as any).pre_order_start_date;
        delete (submitData as any).pre_order_end_date;
      }

      const result = await createCourse(submitData);

      // Show success message
      notification.success({
        message: tNotif ? tNotif('success') : 'Success',
        description: `Course "${result.title}" created successfully!`,
        placement: 'topRight',
        duration: 3,
      });

      // Redirect to instructor courses
      router.push(`/instructor-courses`);
    } catch (error: unknown) {
      console.error('Error creating course:', error);

      const errorMsg =
        error instanceof Error ? error.message : 'Failed to create course. Please try again.';
      notification.error({
        message: tNotif ? tNotif('error') : 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Course form sections - always STANDALONE
  const getFormSections = () => {
    return [
      {
        key: 'basic',
        label: t ? t('sections.basic') : 'Basic Information',
        children: <BasicInfoForm courseData={courseData} updateCourseData={updateCourseData} />,
      },
      {
        key: 'media',
        label: t ? t('sections.media') : 'Media & Resources',
        children: (
          <MediaResourcesForm courseData={courseData} updateCourseData={updateCourseData} />
        ),
      },
      {
        key: 'pricing',
        label: t ? t('sections.pricing') : 'Pricing Information',
        children: <PricingForm courseData={courseData} updateCourseData={updateCourseData} />,
      },
      {
        key: 'details',
        label: t ? t('sections.details') : 'Course Details & Requirements',
        children: <CourseDetailsForm courseData={courseData} updateCourseData={updateCourseData} />,
      },
      {
        key: 'modules',
        label: t ? t('sections.modules') : 'Course Modules & Lessons',
        children: (
          <CourseModulesForm
            courseData={courseData}
            onAddModule={() => {
              setEditingModule(null);
              setIsModuleModalOpen(true);
            }}
            onAddLesson={moduleId => {
              if (moduleId !== undefined) {
                setSelectedModuleId(moduleId);
              }
              setEditingLesson(null);
              setIsLessonModalOpen(true);
            }}
            onEditModule={handleEditModule}
            onDeleteModule={handleDeleteModule}
            onEditLesson={handleEditLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        ),
      },
    ];
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Main Form */}
            <div style={{ flex: 1 }}>
              <Card>
                <Title level={2} style={{ marginBottom: '24px' }}>
                  {t('title')}
                </Title>

                <Collapse items={getFormSections()} defaultActiveKey={['basic']} size="large" />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '24px',
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSubmitCourse}
                    loading={isLoading}
                    disabled={!courseData.title.trim()}
                  >
                    {t('createButton')}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div style={{ width: '300px' }}>
              <CourseUploadTips />
            </div>
          </div>
        </div>

        {/* Modals */}
        <>
          <CreateModuleModal
            isOpen={isModuleModalOpen}
            onClose={() => {
              setIsModuleModalOpen(false);
              setEditingModule(null);
            }}
            editingModule={editingModule}
            onSave={moduleData => {
              setCourseModules(prev => [...prev, moduleData]);
              setIsModuleModalOpen(false);
              setEditingModule(null);
              notification.success({
                message: tNotif('success'),
                description: t('messages.moduleAdded'),
                placement: 'topRight',
                duration: 3,
              });
            }}
            onUpdate={moduleData => {
              const moduleIndex = courseModules.findIndex(
                m => (m as any).id === (editingModule as any).id,
              );
              if (moduleIndex !== -1) {
                setCourseModules(prev => prev.map((m, i) => (i === moduleIndex ? moduleData : m)));
              }
              setIsModuleModalOpen(false);
              setEditingModule(null);
              notification.success({
                message: tNotif('success'),
                description: t('messages.moduleUpdated') ?? 'Module updated successfully',
                placement: 'topRight',
                duration: 3,
              });
            }}
            courseId={0}
          />

          <CreateLessonModal
            isOpen={isLessonModalOpen}
            onClose={() => {
              setIsLessonModalOpen(false);
              setEditingLesson(null);
              setEditingLessonModuleId(0);
            }}
            editingLesson={editingLesson}
            editingModuleId={editingLessonModuleId}
            onSave={lessonData => {
              const moduleId = lessonData.module_id;
              if (!moduleId || moduleId === 0) {
                notification.error({
                  message: tNotif('error'),
                  description: 'Please select a module first',
                  placement: 'topRight',
                  duration: 3,
                });
                return;
              }

              const moduleIndex = moduleId - 1;
              setCourseModules(prev =>
                prev.map((module: any, index: number) => {
                  if (index === moduleIndex) {
                    return {
                      ...module,
                      lessons: [...(module.lessons || []), lessonData],
                    };
                  }
                  return module;
                }),
              );

              setIsLessonModalOpen(false);
              notification.success({
                message: tNotif('success'),
                description: t('messages.lessonAdded'),
                placement: 'topRight',
                duration: 3,
              });
            }}
            onUpdate={lessonData => {
              const moduleId = lessonData.module_id;
              if (!moduleId || moduleId === 0) return;

              const moduleIndex = moduleId - 1;
              setCourseModules(prev =>
                prev.map((module: any, index: number) => {
                  if (index === moduleIndex) {
                    return {
                      ...module,
                      lessons: (module.lessons || []).map((lesson: any) =>
                        lesson.id === editingLesson.id ? lessonData : lesson,
                      ),
                    };
                  }
                  return module;
                }),
              );

              setIsLessonModalOpen(false);
              setEditingLesson(null);
              setEditingLessonModuleId(0);
              notification.success({
                message: tNotif('success'),
                description: t('messages.lessonUpdated') ?? 'Lesson updated successfully',
                placement: 'topRight',
                duration: 3,
              });
            }}
            moduleId={selectedModuleId}
            modules={courseModules}
          />
        </>
      </Content>
    </Layout>
  );
};

export default CreateCourseMain;
