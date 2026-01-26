'use client';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Typography, Spin, Collapse } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// Import service and types
import {
  CreateGroupCourse,
  UpdateGroupCourse,
  getGroupCourseById,
  updateGroupCourse,
  getInstructorCourses,
  Course,
} from '@/services/courseService';
import { categoryService } from '@/services/categoryService';

// Import form components
import GroupCourseBasicForm from '../create-group-course/GroupCourseBasicForm';
import GroupCoursePricingForm from '../create-group-course/GroupCoursePricingForm';
import CourseSelectionForm from '../create-group-course/CourseSelectionForm';
import CourseUploadTips from '../create-course/CourseUploadTips';
import RemovedCoursesBox from './RemovedCoursesBox';

import { useNotification } from '@/hooks/useMessage';

const { Content } = Layout;
const { Title } = Typography;

interface UpdateGroupCourseMainProps {
  groupCourseId: number;
}

const UpdateGroupCourseMain = ({ groupCourseId }: UpdateGroupCourseMainProps) => {
  // State
  const [groupCourseData, setGroupCourseData] = useState<Partial<CreateGroupCourse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]); // Full course objects - both existing and new
  const [courses, setCourses] = useState<Course[]>([]); // All instructor courses
  const [existingCourses, setExistingCourses] = useState<Course[]>([]); // Courses from list_of_courses
  const [removedExistingCourses, setRemovedExistingCourses] = useState<Course[]>([]); // Deleted courses from existing list
  const [categories, setCategories] = useState<any[]>([]);

  const router = useRouter();
  const t = useTranslations('CreateGroupCourse');
  const tUpdate = useTranslations('instructorDashboard.updateGroupCourse');
  const notification = useNotification();

  // Fetch categories and instructor courses list on mount (only once)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoryResponse = await categoryService.getCategories({
          page: 1,
          pageSize: 100,
          isActive: true,
        });
        const categoryList = categoryResponse.data || [];
        setCategories(categoryList);

        // Fetch all courses
        const response = await getInstructorCourses({
          page: 1,
          pageSize: 1000,
          isGrouped: false,
        });
        setCourses(response.data?.filter(c => !c.is_pre_order) || []);
        console.log('Debug - Fetched courses list:', {
          total: response.data?.length,
          courses: response.data?.map((c: any) => ({ id: c.id, code: c.code, title: c.title })),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Apply pending course codes once courses are loaded
  useEffect(() => {
    // This effect is no longer needed since we initialize selectedCourses directly
    // from existingCourses in the fetch effect
  }, []);

  // Auto-calculate and set price when selected courses change
  useEffect(() => {
    console.log('Debug - Price calculation:', {
      selectedCoursesLength: selectedCourses.length,
      selectedCourses: selectedCourses.map(c => ({ code: c.code, price: c.price })),
    });

    if (selectedCourses.length > 0) {
      const totalPrice = selectedCourses.reduce((sum, course) => {
        return sum + (course?.price || 0);
      }, 0);

      console.log('Debug - Calculated total price:', totalPrice);

      setGroupCourseData(prev =>
        prev
          ? {
              ...prev,
              price: totalPrice,
            }
          : null,
      );
    }
  }, [selectedCourses]);

  // Fetch group course data on mount
  useEffect(() => {
    const fetchGroupCourseData = async () => {
      try {
        setIsLoading(true);

        // Fetch group course info
        const course = await getGroupCourseById(groupCourseId);

        // Transform GroupCourse to CreateGroupCourse format
        const updateData: Partial<CreateGroupCourse> = {
          title: course.title,
          description: course.description || '',
          what_you_learn: course.whatYouLearn || '',
          thumbnail: course.thumbnail || '',
          enrollment_type: course.enrollment_type || 'LIFETIME',
          price: course.price || 0,
          currency: course.currency || 'VND',
        };

        setGroupCourseData(updateData);

        // Extract existing courses from group course list_of_courses array
        // Nghiệp vụ 1: These are the EXISTING courses in the group
        if (course.list_of_courses && Array.isArray(course.list_of_courses)) {
          console.log('Debug - Setting existing courses from list_of_courses:', {
            courses: course.list_of_courses.map((c: any) => ({
              id: c.id,
              code: c.code,
              title: c.title,
            })),
          });
          setExistingCourses(course.list_of_courses);
          // Initialize selectedCourses with full course objects
          setSelectedCourses(course.list_of_courses);
        } else if (course.course && Array.isArray(course.course)) {
          // Fallback to course array if list_of_courses not available
          console.log('Debug - Setting existing courses from course (fallback)');
          setExistingCourses(course.course);
          setSelectedCourses(course.course);
        } else {
          console.log('Debug - No courses found in API response');
          setExistingCourses([]);
          setSelectedCourses([]);
        }
      } catch (error: unknown) {
        console.error('Error fetching group course:', error);
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

    fetchGroupCourseData();
  }, [groupCourseId, router, notification, tUpdate]);

  // Handle group course data changes
  const updateGroupCourseDataField = (field: string, value: unknown) => {
    setGroupCourseData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle course selection changes
  // Nghiệp vụ 1: Display existing courses
  // Nghiệp vụ 2: Track removed courses in separate state
  // courses param contains course codes from CourseSelectionForm
  const handleCourseSelectionChange = (courseCodesFromForm: string[]) => {
    // Create a map of all available courses (instructor courses + existing courses)
    const allCoursesMap = new Map<string, Course>();
    courses.forEach(c => allCoursesMap.set(c.code, c));
    existingCourses.forEach(c => allCoursesMap.set(c.code, c));

    // Convert codes to full Course objects
    const newSelectedCourses = courseCodesFromForm
      .map(code => allCoursesMap.get(code))
      .filter((c): c is Course => c !== undefined);

    // Find which courses are being removed from selectedCourses
    const removedCourseCodes = selectedCourses
      .map(c => c.code)
      .filter(code => !courseCodesFromForm.includes(code));

    if (removedCourseCodes.length > 0) {
      // Check if any removed course is an existing course
      // If yes, add it to removedExistingCourses (for Nghiệp vụ 2)
      const existingCodesSet = new Set(existingCourses.map(c => c.code));
      const removedExisting = removedCourseCodes.filter(code => existingCodesSet.has(code));

      if (removedExisting.length > 0) {
        const removedCourseObjects = existingCourses.filter(c => removedExisting.includes(c.code));

        setRemovedExistingCourses(prev => {
          const updated = [...prev, ...removedCourseObjects];
          // Remove duplicates based on course code
          const uniqueMap = new Map(updated.map(c => [c.code, c]));
          return Array.from(uniqueMap.values());
        });
      }
    }

    // Update selected courses with full objects
    setSelectedCourses(newSelectedCourses);
  };

  // Handle restore removed course back to selected via drag-drop
  const handleDropOnSelectedArea = (e: React.DragEvent) => {
    e.preventDefault();
    const removedCourseCode = e.dataTransfer!.getData('removedCourseCode');

    if (removedCourseCode) {
      handleRestoreRemovedCourse(removedCourseCode);
    }
  };

  // Handle restore removed course back to selected
  const handleRestoreRemovedCourse = (courseCode: string) => {
    // Find the course object to restore
    const courseToRestore = removedExistingCourses.find(c => c.code === courseCode);

    if (courseToRestore) {
      // Add back to selectedCourses as full object
      setSelectedCourses(prev => [...prev, courseToRestore]);

      // Remove from removedExistingCourses
      setRemovedExistingCourses(prev => prev.filter(c => c.code !== courseCode));
    }
  };

  // Check if all selected courses have the same currency and match group course currency
  const getCurrencyInfo = () => {
    if (selectedCourses.length === 0) return null;

    const groupCurrency = groupCourseData?.currency || 'VND';
    const currencies = selectedCourses.map(c => c.currency);
    const uniqueCurrencies = new Set(currencies.filter(Boolean));

    const hasMixedCurrency = uniqueCurrencies.size > 1;
    const hasMismatchWithGroup = Array.from(uniqueCurrencies).some(cur => cur !== groupCurrency);

    return {
      groupCurrency,
      currencies: Array.from(uniqueCurrencies),
      isValid: uniqueCurrencies.size <= 1 && !hasMismatchWithGroup,
      hasMixedCurrency,
      hasMismatchWithGroup,
    };
  };

  // Handle update group course
  // Nghiệp vụ 3: Only send NEW courses in course_codes field
  const handleUpdateGroupCourse = async () => {
    if (!groupCourseData) return;

    try {
      setIsSaving(true);

      // Validate
      if (!groupCourseData.title?.trim()) {
        notification.error({
          message: 'Validation Error',
          description: t('messages.titleRequired'),
          placement: 'topRight',
        });
        return;
      }

      if (selectedCourses.length === 0) {
        notification.error({
          message: 'Validation Error',
          description: t('messages.coursesRequired'),
          placement: 'topRight',
        });
        return;
      }

      // Validate: All selected courses must have the same currency and match group course currency
      const courseCurrencies = selectedCourses.map(c => c.currency);
      const uniqueCurrencies = new Set(courseCurrencies);
      const groupCurrency = groupCourseData?.currency || 'VND';

      if (uniqueCurrencies.size > 1) {
        notification.error({
          message: 'Validation Error',
          description: t('messages.mixedCurrencyInCourses', {
            currencies: Array.from(uniqueCurrencies).join(', '),
          }),
          placement: 'topRight',
          duration: 5,
        });
        return;
      }

      // Check if courses currency matches group course currency
      const courseCurrency = Array.from(uniqueCurrencies)[0];
      if (courseCurrency && courseCurrency !== groupCurrency) {
        notification.error({
          message: 'Validation Error',
          description: t('messages.currencyMismatchWithGroup', { courseCurrency, groupCurrency }),
          placement: 'topRight',
          duration: 5,
        });
        return;
      }

      // Calculate NEW courses: courses in selectedCourses but NOT in existingCourses
      const existingCodes = new Set(existingCourses.map(c => c.code));
      const newCourseCodes = selectedCourses
        .filter(course => !existingCodes.has(course.code))
        .map(course => course.code);

      // Calculate REMOVED courses: courses in existingCourses but NOT in selectedCourses
      const selectedCodesSet = new Set(selectedCourses.map(c => c.code));
      const removedCourseCodes = existingCourses
        .map(c => c.code)
        .filter(code => !selectedCodesSet.has(code));

      console.log('Debug - Update payload calculation:', {
        existingCourses: existingCourses.map(c => c.code),
        selectedCourses: selectedCourses.map(c => c.code),
        newCourseCodes,
        removedCourseCodes,
      });

      // Prepare update data - only include NEW courses
      const updateData: UpdateGroupCourse = {
        title: groupCourseData.title || '',
        description: groupCourseData.description || '',
        thumbnail: groupCourseData.thumbnail || '',
        enrollment_type: groupCourseData.enrollment_type || 'LIFETIME',
        price: groupCourseData.price || 0,
        what_you_learn: groupCourseData.what_you_learn || '',
        currency: groupCourseData.currency || 'VND',
        course_codes: newCourseCodes, // Only NEW courses
        removed_course_codes: removedCourseCodes, // Courses removed from existing
      };

      await updateGroupCourse(groupCourseId, updateData);

      notification.success({
        message: t('notification.success'),
        description: t('messages.createSuccess'),
        placement: 'topRight',
        duration: 3,
      });

      // Redirect to course list
      router.push('/instructor-courses');
    } catch (error: unknown) {
      console.error('Error updating group course:', error);
      const errorMsg = error instanceof Error ? error.message : t('messages.createError');

      notification.error({
        message: t('notification.error'),
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!groupCourseData) {
    return (
      <Layout>
        <Content style={{ padding: '50px' }}>
          <Card>
            <Title level={3}>{tUpdate('courseNotFound')}</Title>
          </Card>
        </Content>
      </Layout>
    );
  }

  // Form sections - same structure as CreateGroupCourseMain
  const formSections = [
    {
      key: 'basic',
      label: t('sections.basic'),
      children: (
        <GroupCourseBasicForm
          courseData={groupCourseData}
          updateCourseData={updateGroupCourseDataField}
        />
      ),
    },

    {
      key: 'courses',
      label: t('sections.courses'),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Currency Status */}
          {selectedCourses.length > 0 &&
            (() => {
              const currencyInfo = getCurrencyInfo();
              if (!currencyInfo) return null;

              if (currencyInfo.hasMixedCurrency) {
                return (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#fff7e6',
                      border: '2px solid #ffa940',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 500, color: '#ad6800' }}>
                        {t('messages.currencyWarningTitle')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#ad6800' }}>
                        {t('messages.currencyWarningDesc', {
                          currencies: currencyInfo.currencies.join(', '),
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              if (currencyInfo.hasMismatchWithGroup) {
                return (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#ffe7e7',
                      border: '2px solid #ff4d4f',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>❌</span>
                    <div>
                      <div style={{ fontWeight: 500, color: '#820014' }}>
                        {t('messages.currencyErrorTitle')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#820014' }}>
                        {t('messages.currencyErrorDesc', {
                          courseCurrency: currencyInfo.currencies[0],
                          groupCurrency: currencyInfo.groupCurrency,
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f6ffed',
                    border: '2px solid #52c41a',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>✓</span>
                  <div style={{ fontWeight: 500, color: '#52730d' }}>
                    {t('messages.currencySuccessMsg', {
                      currency: currencyInfo.currencies[0] || currencyInfo.groupCurrency,
                    })}
                  </div>
                </div>
              );
            })()}

          <div
            onDragOver={e => {
              e.preventDefault();
              e.currentTarget.style.backgroundColor = '#e6f7ff';
            }}
            onDragLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onDrop={handleDropOnSelectedArea}
            style={{
              padding: '0px',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
          >
            <CourseSelectionForm
              selectedCourses={selectedCourses.map(c => c.code)}
              onSelectionChange={handleCourseSelectionChange}
              onCoursesLoaded={() => {}}
              externalCourses={[...courses, ...existingCourses]}
            />
          </div>

          {/* Nghiệp vụ 2: Show removed courses box */}
          <RemovedCoursesBox
            removedCourses={removedExistingCourses}
            onRestoreCourse={handleRestoreRemovedCourse}
          />
        </div>
      ),
    },
    {
      key: 'pricing',
      label: t('sections.pricing'),
      children: (
        <GroupCoursePricingForm
          courseData={groupCourseData}
          updateCourseData={updateGroupCourseDataField}
          courses={courses}
          selectedCourses={selectedCourses.map(c => c.code)}
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
                  {tUpdate('title')}
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
                    onClick={handleUpdateGroupCourse}
                    loading={isSaving}
                    disabled={!groupCourseData.title?.trim() || selectedCourses.length === 0}
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
    </Layout>
  );
};

export default UpdateGroupCourseMain;
