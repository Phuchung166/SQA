'use client';
import {
  Form,
  Select,
  Button,
  Space,
  Empty,
  Spin,
  Tag,
  Modal,
  Row,
  Col,
  Divider,
  Input,
} from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getInstructorCourses, Course } from '@/services/courseService';
import { categoryService } from '@/services/categoryService';
import Image from 'next/image';
import { useNotification } from '@/hooks/useMessage';

interface CourseSelectionFormProps {
  selectedCourses: string[];
  onSelectionChange: (codes: string[]) => void;
  onCoursesLoaded?: (courses: Course[]) => void;
  externalCourses?: Course[];
}

const CourseSelectionForm = ({
  selectedCourses,
  onSelectionChange,
  onCoursesLoaded,
  externalCourses,
}: CourseSelectionFormProps) => {
  const t = useTranslations('CreateGroupCourse');
  const [courses, setCourses] = useState<Course[]>([]);
  const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]); // Keep all courses from all categories
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [draggedCourse, setDraggedCourse] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const notification = useNotification();

  // Fetch categories on mount (always, regardless of externalCourses)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await categoryService.getCategories({
          page: 1,
          pageSize: 100,
          isActive: true,
        });
        const categoryList = categoryResponse.data || [];
        setCategories(categoryList);

        // Select first category by default
        if (categoryList.length > 0 && categoryList[0].id) {
          setSelectedCategory(categoryList[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch instructor courses and categories on mount
  useEffect(() => {
    // If external courses are provided, use them directly
    if (externalCourses && externalCourses.length > 0) {
      setCourses(externalCourses);
      setAllFetchedCourses(externalCourses);

      console.log('Debug - Using external courses:', {
        total: externalCourses.length,
        courses: externalCourses.map(c => ({ id: c.id, code: c.code, title: c.title })),
      });

      if (onCoursesLoaded) {
        onCoursesLoaded(externalCourses);
      }

      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch courses for first category or all if no category
        const firstCategoryId = categories.length > 0 ? parseInt(categories[0].id, 10) : undefined;
        const coursesResponse = await getInstructorCourses({
          page: 1,
          pageSize: 1000,
          categoryId: firstCategoryId,
          isGrouped: false,
        });

        const fetchedCourses = coursesResponse.data?.filter(c => !c.is_pre_order) || [];
        setCourses(fetchedCourses);
        setAllFetchedCourses(prev => {
          // Merge with existing courses, avoiding duplicates by code
          const codeSet = new Set(prev.map(c => c.code));
          const newCourses = fetchedCourses.filter(c => !codeSet.has(c.code));
          return [...prev, ...newCourses];
        });

        console.log('Debug - Fetched courses:', {
          total: fetchedCourses.length,
          courses: fetchedCourses.map(c => ({ id: c.id, code: c.code, title: c.title })),
        });

        // Call callback to pass courses data to parent
        if (onCoursesLoaded) {
          onCoursesLoaded(fetchedCourses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [externalCourses, onCoursesLoaded, categories]);

  // Fetch courses when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchCoursesByCategory = async () => {
      try {
        setLoading(true);
        const categoryId = selectedCategory ? parseInt(selectedCategory, 10) : undefined;
        const response = await getInstructorCourses({
          page: 1,
          pageSize: 1000,
          categoryId,
          isGrouped: false,
        });
        const fetchedCourses = response.data?.filter(c => !c.is_pre_order) || [];
        setCourses(fetchedCourses);

        // Add fetched courses to the comprehensive course map
        setAllFetchedCourses(prev => {
          const codeSet = new Set(prev.map(c => c.code));
          const newCourses = fetchedCourses.filter(c => !codeSet.has(c.code));
          return [...prev, ...newCourses];
        });

        console.log('Debug - Fetched courses for category:', {
          categoryId: selectedCategory,
          total: fetchedCourses.length,
          courses: fetchedCourses.map(c => ({ id: c.id, code: c.code, title: c.title })),
        });

        if (onCoursesLoaded) {
          onCoursesLoaded(fetchedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses by category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesByCategory();
  }, [selectedCategory, onCoursesLoaded]);

  // Create a Map for O(1) lookup by course code (optimized for large datasets)
  // Include both courses, externalCourses, and allFetchedCourses to ensure all course data is available
  const allCourses = [...allFetchedCourses, ...(externalCourses || [])];
  const courseMap = new Map<string, Course>(allCourses.map(course => [course.code, course]));

  // No need to filter by category anymore since we're fetching filtered courses from API
  const filteredCourses = courses;

  // Handle adding course code
  const handleAddCourse = (courseCode: string) => {
    if (courseCode && !selectedCourses.includes(courseCode)) {
      onSelectionChange([...selectedCourses, courseCode]);
    }
  };

  // Handle removing course code
  const handleRemoveCourse = (courseCode: string) => {
    onSelectionChange(selectedCourses.filter(code => code !== courseCode));
  };

  // Get course details by code using Map (O(1) instead of O(n))
  const getCourseDetails = (courseCode: string) => {
    return courseMap.get(courseCode);
  };

  // Handle manual course code input with validation
  const handleManualCodeAdd = () => {
    const code = manualCodeInput.trim().toUpperCase();

    // Validate: code must not be empty
    if (!code) {
      return;
    }

    // Validate: code must already be added
    if (selectedCourses.includes(code)) {
      setManualCodeInput('');
      return;
    }

    // Validate: code must exist in filtered courses (same category)
    const courseExists = filteredCourses.some(c => c.code === code);
    if (!courseExists) {
      notification.error({
        message: t('courseSelection.courseCodeNotFound'),
        description: `${code}`,
        placement: 'topRight',
        duration: 3,
      });
      setManualCodeInput('');
      return;
    }

    // If all validations pass, add the course
    handleAddCourse(code);
    setManualCodeInput('');
  };

  // Show course details modal
  const showCourseDetails = (course: Course) => {
    setSelectedCourseDetail(course);
    setDetailsModalOpen(true);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, courseId: string) => {
    if (!selectedCourses.includes(courseId)) {
      setDraggedCourse(courseId);
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  // Handle drag over on drop zone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  // Handle drag leave from drop zone
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Check if we're leaving the actual zone (not just leaving a child)
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  // Handle drop on selected courses area
  const handleDropOnSelectedArea = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Check for removed course being restored
    const removedCourseCode = e.dataTransfer.getData('removedCourseCode');
    if (removedCourseCode && !selectedCourses.includes(removedCourseCode)) {
      handleAddCourse(removedCourseCode);
      setDraggedCourse(null);
      return;
    }

    // Check for regular course being dragged
    if (draggedCourse && !selectedCourses.includes(draggedCourse)) {
      handleAddCourse(draggedCourse);
      setDraggedCourse(null);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label={t('fields.selectCourses')} tooltip={t('courseSelection.selectCategory')}>
        <Spin spinning={loading}>
          <div>
            {/* Category Filter */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                {t('courseSelection.filterByCategory')} <span style={{ color: 'red' }}>*</span>
              </label>
              <Select
                placeholder={t('courseSelection.selectCategory')}
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories.map(cat => ({
                  label: cat.name || t('courseSelection.noCourses'),
                  value: cat.id,
                }))}
              />
            </div>

            {/* Manual Course Code Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                {t('courseSelection.orEnterCourseCode')}
              </label>
              <Space style={{ width: '100%' }}>
                <Input
                  placeholder={t('courseSelection.enterCourseCode')}
                  style={{ flex: 1 }}
                  value={manualCodeInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setManualCodeInput(e.target.value)
                  }
                  onPressEnter={handleManualCodeAdd}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleManualCodeAdd}
                  disabled={!manualCodeInput.trim()}
                >
                  {t('courseSelection.add')}
                </Button>
              </Space>
            </div>

            {/* Available Courses - Draggable */}
            <div
              style={{
                marginBottom: '20px',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                backgroundColor: '#fafafa',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
                {t('courseSelection.dragCoursesHere')}:
              </label>
              {filteredCourses.length === 0 ? (
                <Empty description={t('courseSelection.noCoursesInCategory')} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredCourses
                    .filter(c => !selectedCourses.includes(c.code))
                    .map(course => (
                      <div
                        key={course.id}
                        draggable
                        onDragStart={e => handleDragStart(e, course.code)}
                        style={{
                          padding: '12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          backgroundColor: '#fff',
                          cursor: 'grab',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.3s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow =
                            '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{course.title}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {t('courseSelection.courseCode')}: {course.code} |{' '}
                            {t('courseSelection.filterByCategory')}: {course.category?.name}
                          </div>
                        </div>
                        <Space>
                          <Button
                            size="small"
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => showCourseDetails(course)}
                            title={t('courseSelection.courseDetails')}
                          />
                          <Button
                            size="small"
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAddCourse(course.code)}
                            title={t('courseSelection.add')}
                          />
                        </Space>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Selected Courses - Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropOnSelectedArea}
              style={{
                padding: '16px',
                border: isDragOver ? '2px solid #1890ff' : '2px dashed #1890ff',
                borderRadius: '6px',
                backgroundColor: isDragOver ? '#e6f7ff' : '#f0f5ff',
                minHeight: '100px',
                transition: 'all 0.2s',
                marginTop: '16px',
              }}
            >
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
                {t('courseSelection.selectedCourses', { count: selectedCourses.length })}
              </label>
              {selectedCourses && selectedCourses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedCourses.map(code => {
                      const course = getCourseDetails(code);
                      console.log('Debug - Rendering selected course:', {
                        code,
                        course,
                        courseTitle: course?.title,
                      });
                      return (
                        <Tag
                          key={code}
                          closable
                          onClose={() => handleRemoveCourse(code)}
                          color="blue"
                          style={{ marginBottom: '8px', padding: '4px 12px', cursor: 'pointer' }}
                          onClick={() => course && showCourseDetails(course)}
                          title={`${course?.title || 'Unknown Course'} (${code}) - ${course?.currency || 'N/A'}`}
                        >
                          <span>{course?.title || `Unknown Course (${code})`}</span>
                          {course?.currency && (
                            <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8 }}>
                              ({course.currency})
                            </span>
                          )}
                        </Tag>
                      );
                    })}
                  </div>
                  {/* Show currency warning if mixed */}
                  {selectedCourses.length > 1 &&
                    (() => {
                      const currencies = selectedCourses
                        .map(code => getCourseDetails(code)?.currency)
                        .filter(Boolean);
                      const uniqueCurrencies = new Set(currencies);
                      return uniqueCurrencies.size > 1 ? (
                        <div
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fff7e6',
                            border: '1px solid #ffc069',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#ad6800',
                          }}
                        >
                          {t('courseSelection.mixedCurrencyWarning')}
                        </div>
                      ) : null;
                    })()}
                </div>
              ) : (
                <Empty
                  description={
                    isDragOver ? t('courseSelection.dragAndDrop') : t('courseSelection.noCourses')
                  }
                  style={{ margin: 0 }}
                />
              )}
            </div>
          </div>
        </Spin>
      </Form.Item>

      {/* Course Details Modal */}
      <Modal
        title={t('courseSelection.courseDetails')}
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedCourseDetail && (
          <div>
            <Row gutter={[16, 16]}>
              {selectedCourseDetail.thumbnail && (
                <Col span={24}>
                  <Image
                    src={selectedCourseDetail.thumbnail}
                    alt={selectedCourseDetail.title}
                    width={600}
                    height={200}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                </Col>
              )}

              <Col span={24}>
                <Divider>{t('courseSelection.courseTitle')}</Divider>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {t('courseSelection.courseCode')}
                    </div>
                    <div style={{ fontWeight: 500 }}>{selectedCourseDetail.code}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {t('courseSelection.filterByCategory')}
                    </div>
                    <div style={{ fontWeight: 500 }}>
                      {selectedCourseDetail.category?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {t('courseSelection.courseLevel')}
                    </div>
                    <div style={{ fontWeight: 500 }}>{selectedCourseDetail.level}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {t('courseSelection.courseLanguage')}
                    </div>
                    <div style={{ fontWeight: 500 }}>{selectedCourseDetail.language}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{t('common_terms.price')}</div>
                    <div style={{ fontWeight: 500 }}>
                      {selectedCourseDetail.price} {selectedCourseDetail.currency}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {t('common_terms.students')}
                    </div>
                    <div style={{ fontWeight: 500 }}>
                      {selectedCourseDetail.total_students || 0}
                    </div>
                  </div>
                </div>
              </Col>

              <Col span={24}>
                <Divider>{t('courseSelection.courseDescription')}</Divider>
                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedCourseDetail.short_description}
                </p>
              </Col>

              <Col span={24}>
                <Divider>{t('common_terms.instructor')}</Divider>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedCourseDetail.instructor?.avatar && (
                    <Image
                      src={selectedCourseDetail.instructor.avatar}
                      alt={selectedCourseDetail.instructor.name}
                      width={40}
                      height={40}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 500 }}>{selectedCourseDetail.instructor?.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {selectedCourseDetail.instructor?.total_courses} {t('common_terms.courses')}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Form>
  );
};

export default CourseSelectionForm;
