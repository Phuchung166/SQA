'use client';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Layout, Card, Collapse, Button, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

import { CreateGroupCourse, createGroupCourse } from '@/services/courseService';

import GroupCourseBasicForm from './GroupCourseBasicForm';
import GroupCoursePricingForm from './GroupCoursePricingForm';
import CourseSelectionForm from './CourseSelectionForm';
import CourseUploadTips from '../create-course/CourseUploadTips';

import { useNotification } from '@/hooks/useMessage';

const { Content } = Layout;
const { Title } = Typography;

const CreateGroupCourseMain = () => {
  // State
  const [groupCourseData, setGroupCourseData] = useState<Partial<CreateGroupCourse>>({
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    enrollment_type: 'LIFETIME',
    what_you_learn: '',
    currency: 'VND',
    course_codes: [],
  });

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const t = useTranslations('CreateGroupCourse');
  const notification = useNotification();

  // Auto-calculate and set price when selected courses change
  useEffect(() => {
    if (courses.length > 0 && selectedCourses.length > 0) {
      const courseMap = new Map(courses.map((c: any) => [c.code, c]));
      const totalPrice = selectedCourses.reduce((sum, code) => {
        const course = courseMap.get(code);
        return sum + (course?.price || 0);
      }, 0);

      setGroupCourseData(prev => ({
        ...prev,
        price: totalPrice,
      }));
    }
  }, [selectedCourses, courses]);

  // Helper function to normalize list values
  const normalizeToString = (v: unknown): string => {
    if (!v) return '';
    if (Array.isArray(v)) return v.map(i => (i == null ? '' : String(i))).join('\n');
    return String(v).trim();
  };

  // Update group course data
  const updateGroupCourseData = (field: string, value: unknown) => {
    setGroupCourseData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle create group course
  const handleCreateGroupCourse = async () => {
    if (!groupCourseData.title?.trim()) {
      notification.error({
        message: t('notification.error'),
        description: t('messages.titleRequired'),
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    if (selectedCourses.length === 0) {
      notification.error({
        message: t('notification.error'),
        description: t('messages.coursesRequired'),
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    try {
      setIsSaving(true);

      // Prepare data for submission
      const submitData: CreateGroupCourse = {
        title: groupCourseData.title || '',
        description: groupCourseData.description || '',
        thumbnail: groupCourseData.thumbnail || '',
        price: groupCourseData.price || 0,
        enrollment_type: groupCourseData.enrollment_type || 'LIFETIME',
        what_you_learn: normalizeToString(groupCourseData.what_you_learn),
        currency: groupCourseData.currency || 'VND',
        course_codes: selectedCourses,
      };

      await createGroupCourse(submitData);

      notification.success({
        message: t('success'),
        description: t('messages.createSuccess'),
        placement: 'topRight',
        duration: 3,
      });

      // Redirect to group courses list or dashboard
      router.push('/instructor-courses');
    } catch (error: unknown) {
      console.error('Error creating group course:', error);
      const errorMsg = error instanceof Error ? error.message : t('messages.createError');

      notification.error({
        message: t('error'),
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Form sections
  const formSections = [
    {
      key: 'basic',
      label: t('sections.basic'),
      children: (
        <GroupCourseBasicForm
          courseData={groupCourseData}
          updateCourseData={updateGroupCourseData}
        />
      ),
    },

    {
      key: 'courses',
      label: t('sections.courses'),
      children: (
        <CourseSelectionForm
          selectedCourses={selectedCourses}
          onSelectionChange={setSelectedCourses}
          onCoursesLoaded={setCourses}
        />
      ),
    },
    {
      key: 'pricing',
      label: t('sections.pricing'),
      children: (
        <GroupCoursePricingForm
          courseData={groupCourseData}
          updateCourseData={updateGroupCourseData}
          courses={courses}
          selectedCourses={selectedCourses}
        />
      ),
    },
  ];

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

                <Collapse items={formSections} defaultActiveKey={['basic']} size="large" />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                  }}
                >
                  <Button size="large" onClick={() => router.back()}>
                    {t('cancelButton')}
                  </Button>

                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleCreateGroupCourse}
                    loading={isSaving}
                    disabled={!groupCourseData.title?.trim() || selectedCourses.length === 0}
                  >
                    {t('createButton')}
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
    </Layout>
  );
};

export default CreateGroupCourseMain;
