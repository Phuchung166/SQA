'use client';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Layout, Card, Collapse, Button, Typography, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// Import course service and types
import {
  CreateCourseRequest,
  getCourseById,
  updateCourse,
  Course,
  CourseModule,
  CreateLessonStandaloneRequest,
  createLesson,
  getCourseModules,
  updateCourseModule,
  deleteCourseModule,
  updateLesson,
  deleteLesson,
  createCourseModule,
  getCourseModulesByInstructor,
} from '@/services/courseService';

// Import form components from create-course (reuse them)
import BasicInfoForm from '../create-course/BasicInfoForm';
import MediaResourcesForm from '../create-course/MediaResourcesForm';
import PricingForm from '../create-course/PricingForm';
import CourseDetailsForm from '../create-course/CourseDetailsForm';
import CourseModulesForm from '../create-course/CourseModulesForm';
import CourseUploadTips from '../create-course/CourseUploadTips';
import CreateModuleModal from '../create-course/CreateModuleModal';
import CreateLessonModal from '../create-course/CreateLessonModal';
import EditModuleModal from './EditModuleModal';
import EditLessonModal from './EditLessonModal';

import { useNotification } from '@/hooks/useMessage';

const { Content } = Layout;
const { Title } = Typography;

interface UpdateCourseMainProps {
  courseId: number;
}

const UpdateCourseMain = ({ courseId }: UpdateCourseMainProps) => {
  // State
  const [courseData, setCourseData] = useState<Partial<CreateCourseRequest> | null>(null);
  const [originalCourse, setOriginalCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(0);

  // Edit modals state
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [selectedModuleForEdit, setSelectedModuleForEdit] = useState<any>(null);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<any>(null);
  const [isEditModuleSaving, setIsEditModuleSaving] = useState(false);
  const [isEditLessonSaving, setIsEditLessonSaving] = useState(false);

  const router = useRouter();
  const t = useTranslations('CreateCourse'); // Reuse CreateCourse translations for form sections
  const tUpdate = useTranslations('instructorDashboard.updateCourse');
  const notification = useNotification();
  const [courseModules, setCourseModules] = useState<(CourseModule | any)[]>([]);

  // Normalizes a value into string[] (accepts array, newline/comma separated string)
  const normalizeToStringArray = (v: unknown): string[] => {
    if (!v) return [];
    if (Array.isArray(v))
      return v
        .map(i => (i == null ? '' : String(i)))
        .map(s => s.trim())
        .filter(Boolean);
    if (typeof v === 'string') {
      const parts = v.includes('\n') ? v.split(/\r?\n/) : v.split(',');
      return parts.map(p => p.trim()).filter(Boolean);
    }
    return [];
  };

  // Compare two values for deep equality
  const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => deepEqual(val, b[idx]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => deepEqual(a[key], b[key]));
    }

    return false;
  };

  // Compare course data with original and return only changed fields
  const getChangedFields = (
    original: Course | null,
    updated: Partial<CreateCourseRequest>,
  ): Partial<CreateCourseRequest> => {
    if (!original) return updated;

    const changed: any = {};

    // Map original course fields to update request fields
    const originalData: Partial<CreateCourseRequest> = {
      code: original.code || '',
      title: original.title,
      description: original.description || '',
      short_description: original.short_description || '',
      thumbnail: original.thumbnail || '',
      preview_video: original.preview_video || '',
      category_id: original.category?.id || 0,
      level: original.level || 'BEGINNER',
      language: original.language || '',
      price: original.price || 0,
      currency: original.currency || 'VND',
      is_free: original.is_free || false,
      enrollment_type: original.enrollment_type || 'LIFETIME',
      expired_days: original.expired_days || null,
      what_you_learn: normalizeToStringArray(original.what_you_learn),
      target_audiences: normalizeToStringArray(original.target_audiences),
    };

    // Check each field for changes
    (Object.keys(updated) as Array<keyof CreateCourseRequest>).forEach(key => {
      if (!deepEqual(updated[key], originalData[key])) {
        changed[key] = updated[key];
      }
    });

    return changed;
  };

  // Fetch course data on mount
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);

        // Fetch course info
        const course = await getCourseById(courseId);
        setOriginalCourse(course);

        // Fetch course modules (lessons are already included in the response)
        const modulesRes = await getCourseModulesByInstructor({
          page: 1,
          pageSize: 100,
          courseId: courseId,
        });

        setCourseModules(modulesRes.data);

        // Transform Course to a partial CreateCourseRequest format
        const updateData: Partial<CreateCourseRequest> = {
          code: course.code || '',
          title: course.title,
          description: course.description || '',
          short_description: course.short_description || '',
          thumbnail: course.thumbnail || '',
          preview_video: course.preview_video || '',
          category_id: course.category?.id || 0,
          level: course.level || 'BEGINNER',
          language: course.language || '',
          price: course.price || 0,
          currency: course.currency || 'VND',
          is_free: course.is_free || false,
          enrollment_type: course.enrollment_type || 'LIFETIME',
          expired_days: course.expired_days || 1,
          what_you_learn: normalizeToStringArray(course.what_you_learn),
          target_audiences: normalizeToStringArray(course.target_audiences),
        };

        setCourseData(updateData);
      } catch (error: unknown) {
        console.error('Error fetching course:', error);
        const errorMsg = error instanceof Error ? error.message : tUpdate('updateError');

        notification.error({
          message: 'Error',
          description: errorMsg,
          placement: 'topRight',
          duration: 5,
        });

        // Redirect back if can't load course
        router.push('/instructor-courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, router, notification, tUpdate]);

  // Handle course data changes
  const updateCourseDataField = (field: string, value: unknown) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle update course
  const handleUpdateCourse = async () => {
    if (!courseData) return;

    try {
      setIsSaving(true);

      // Prepare update data - only send allowed fields
      const updateData: Partial<CreateCourseRequest> = {
        ...courseData,
        // Normalize the list-like fields to ensure arrays of strings
        what_you_learn: normalizeToStringArray(courseData.what_you_learn),
        target_audiences: normalizeToStringArray(courseData.target_audiences),
      };

      // Get only changed fields
      const changedFields = getChangedFields(originalCourse, updateData);

      // If no changes, show info and return
      if (Object.keys(changedFields).length === 0) {
        notification.info({
          message: 'Info',
          description: 'No changes detected. Nothing to update.',
          placement: 'topRight',
          duration: 3,
        });
        return;
      }

      // Log changed fields for debugging
      console.log('Changed fields:', changedFields);

      // Update only changed fields
      await updateCourse(courseId, changedFields);

      notification.success({
        message: 'Success',
        description: tUpdate('updateSuccess'),
        placement: 'topRight',
        duration: 3,
      });

      // Redirect to course list or detail page
      router.push('/instructor-courses');
    } catch (error: unknown) {
      console.error('Error updating course:', error);
      const errorMsg = error instanceof Error ? error.message : tUpdate('updateError');

      notification.error({
        message: 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding new module
  const handleAddModule = async (moduleData: any) => {
    try {
      // Call API to create module directly (without sub_course_id)
      const createModuleData: any = {
        title: moduleData.title,
        description: moduleData.description,
        sort_order: moduleData.sort_order,
        course_id: courseId,
        lessons: [], // Empty for now, lessons are added separately
      };

      await createCourseModule(createModuleData);

      // Reload modules (lessons are already included in the response)
      const modulesRes = await getCourseModulesByInstructor({
        page: 1,
        pageSize: 100,
        courseId: courseId,
      });

      setCourseModules(modulesRes.data);

      notification.success({
        message: 'Success',
        description: 'Module added successfully',
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error adding module:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to add module';
      notification.error({
        message: 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  // Handle adding new lesson (call API to create lesson)
  const handleAddLesson = async (lessonData: CreateLessonStandaloneRequest) => {
    try {
      const moduleId = lessonData.module_id;

      if (!moduleId || moduleId === 0) {
        notification.error({
          message: 'Error',
          description: 'Please select a module first',
          placement: 'topRight',
          duration: 3,
        });
        return;
      }

      // Call API to create lesson
      await createLesson(lessonData);

      // Refresh modules list (lessons are already included in the response)
      const modulesRes = await getCourseModulesByInstructor({
        page: 1,
        pageSize: 100,
        courseId: courseId,
      });

      setCourseModules(modulesRes.data);

      notification.success({
        message: 'Success',
        description: 'Lesson added successfully',
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error adding lesson:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to add lesson';

      notification.error({
        message: 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  // Handle edit module
  const handleEditModule = async (module: any) => {
    try {
      setSelectedModuleForEdit(module);
      setIsEditModuleModalOpen(true);
    } catch (error: unknown) {
      console.error('Error preparing edit module:', error);
    }
  };

  // Handle save edit module
  const handleSaveEditModule = async (moduleId: number, moduleData: any) => {
    try {
      setIsEditModuleSaving(true);
      await updateCourseModule(moduleId, moduleData);

      // Reload modules (lessons are already included in the response)
      const modulesRes = await getCourseModulesByInstructor({
        page: 1,
        pageSize: 100,
        courseId: courseId,
      });

      setCourseModules(modulesRes.data);

      notification.success({
        message: 'Success',
        description: 'Module updated successfully',
        placement: 'topRight',
        duration: 3,
      });

      setIsEditModuleModalOpen(false);
      setSelectedModuleForEdit(null);
    } catch (error: unknown) {
      console.error('Error updating module:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update module';
      notification.error({
        message: 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIsEditModuleSaving(false);
    }
  };

  // Handle delete module
  const handleDeleteModule = async (moduleId: number) => {
    try {
      await deleteCourseModule(moduleId);

      // Reload modules (lessons are already included in the response)
      const modulesRes = await getCourseModulesByInstructor({
        page: 1,
        pageSize: 100,
        courseId: courseId,
      });

      setCourseModules(modulesRes.data);

      notification.success({
        message: 'Success',
        description: 'Module deleted successfully',
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error deleting module:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete module';
      notification.error({
        message: 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  // Handle edit lesson
  const handleEditLesson = async (lesson: any) => {
    try {
      setSelectedLessonForEdit(lesson);
      setIsEditLessonModalOpen(true);
    } catch (error: unknown) {
      console.error('Error preparing edit lesson:', error);
    }
  };

  // Handle save edit lesson
  const handleSaveEditLesson = async (lessonId: number, lessonData: any) => {
    try {
      setIsEditLessonSaving(true);
      await updateLesson(lessonId, lessonData);

      // Reload modules (lessons are already included in the response)
      const modulesRes = await getCourseModulesByInstructor({
        page: 1,
        pageSize: 100,
        courseId: courseId,
      });

      setCourseModules(modulesRes.data);

      notification.success({
        message: 'Success',
        description: 'Lesson updated successfully',
        placement: 'topRight',
        duration: 3,
      });

      setIsEditLessonModalOpen(false);
      setSelectedLessonForEdit(null);
    } catch (error: unknown) {
      console.error('Error updating lesson:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to update lesson';
      notification.error({
        message: 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIsEditLessonSaving(false);
    }
  };

  // Handle delete lesson
  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await deleteLesson(lessonId);

      // Reload modules (lessons are already included in the response)
      const modulesRes = await getCourseModulesByInstructor({
        page: 1,
        pageSize: 100,
        courseId: courseId,
      });

      setCourseModules(modulesRes.data);

      notification.success({
        message: 'Success',
        description: 'Lesson deleted successfully',
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error deleting lesson:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete lesson';
      notification.error({
        message: 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  if (isLoading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Content style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
            }}
          >
            <Spin size="large" tip={tUpdate('loadingCourse')} />
          </div>
        </Content>
      </Layout>
    );
  }

  // No data state
  if (!courseData) {
    return null;
  }

  // Course form sections
  // Add courseModules for compatibility with form components
  const courseDataWithModules = { ...courseData, courseModules: courseModules } as any;

  const baseSections = [
    {
      key: 'basic',
      label: t('sections.basic'),
      children: (
        <BasicInfoForm
          courseData={courseDataWithModules}
          updateCourseData={updateCourseDataField}
        />
      ),
    },
    {
      key: 'media',
      label: t('sections.media'),
      children: (
        <MediaResourcesForm
          courseData={courseDataWithModules}
          updateCourseData={updateCourseDataField}
        />
      ),
    },
    {
      key: 'pricing',
      label: t('sections.pricing'),
      children: (
        <PricingForm courseData={courseDataWithModules} updateCourseData={updateCourseDataField} />
      ),
    },
    {
      key: 'details',
      label: t('sections.details'),
      children: (
        <CourseDetailsForm
          courseData={courseDataWithModules}
          updateCourseData={updateCourseDataField}
        />
      ),
    },
    {
      key: 'modules',
      label: t('sections.modules'),
      children: (
        <CourseModulesForm
          courseData={{ ...courseData, courseModules: courseModules } as any}
          onAddModule={() => setIsModuleModalOpen(true)}
          onAddLesson={moduleId => {
            if (moduleId !== undefined) {
              setSelectedModuleId(moduleId);
            }
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

  const formSections = baseSections;

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Main Form */}
            <div style={{ flex: 1 }}>
              <Card>
                <Title level={2} style={{ marginBottom: '24px' }}>
                  {tUpdate('title')}
                  {originalCourse && (
                    <span style={{ fontSize: '16px', color: '#666', marginLeft: '12px' }}>
                      - {originalCourse.title}
                    </span>
                  )}
                </Title>

                <Collapse items={formSections} defaultActiveKey={['basic']} size="large" />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                  }}
                >
                  <Button size="large" onClick={() => router.back()}>
                    {tUpdate('cancelButton')}
                  </Button>

                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleUpdateCourse}
                    loading={isSaving}
                    disabled={!courseData.title?.trim()}
                  >
                    {tUpdate('updateButton')}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar - Tips */}
            <div style={{ width: '320px' }}>
              <CourseUploadTips />
            </div>
          </div>
        </div>
      </Content>

      {/* Modals */}
      <CreateModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSave={handleAddModule}
        courseId={courseId}
      />

      <CreateLessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSave={handleAddLesson}
        moduleId={selectedModuleId}
        modules={courseModules}
      />

      <EditModuleModal
        isOpen={isEditModuleModalOpen}
        onClose={() => {
          setIsEditModuleModalOpen(false);
          setSelectedModuleForEdit(null);
        }}
        onSave={handleSaveEditModule}
        module={selectedModuleForEdit}
        isLoading={isEditModuleSaving}
      />

      <EditLessonModal
        isOpen={isEditLessonModalOpen}
        onClose={() => {
          setIsEditLessonModalOpen(false);
          setSelectedLessonForEdit(null);
        }}
        onSave={handleSaveEditLesson}
        lesson={selectedLessonForEdit}
        isLoading={isEditLessonSaving}
      />
    </Layout>
  );
};

export default UpdateCourseMain;
