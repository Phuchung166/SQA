'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Select,
  Card,
  Button,
  Empty,
  Spin,
  Space,
  Row,
  Col,
  Badge,
  Tooltip,
  Popconfirm,
  Table,
  Tabs,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  getInstructorCourses,
  getCourseModules,
  Course,
  CourseModule,
  getCourseModulesByUser,
} from '@/services/courseService';
import { categoryService, Category } from '@/services/categoryService';
import quizzService, { Quiz } from '@/services/quizzService';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

const QuizzesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const t = useTranslations('InstructorQuizzes');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch courses when category changes
  useEffect(() => {
    fetchCoursesByCategory();
    setSelectedCourseId(null);
    setModules([]);
    setQuizzes([]);
  }, [selectedCategoryId]);

  // Fetch modules when course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseModules(selectedCourseId);
    } else {
      setModules([]);
      setQuizzes([]);
    }
  }, [selectedCourseId]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
        isActive: true,
      });
      setCategories(response.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchCoursesByCategory = async () => {
    try {
      setIsLoadingCourses(true);
      const params: any = {
        page: 1,
        pageSize: 100,
      };
      // Only append categoryId if not "All Categories" (empty string)
      if (selectedCategoryId && selectedCategoryId !== 'all') {
        params.categoryId = parseInt(selectedCategoryId);
      }
      const response = await getInstructorCourses(params);
      setCourses(response.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load courses');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchCourseModules = async (courseId: number) => {
    try {
      setIsLoadingModules(true);
      const response = await getCourseModules({
        page: 1,
        pageSize: 100,
        courseId,
      });
      setModules(response.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load modules');
      setModules([]);
    } finally {
      setIsLoadingModules(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number, moduleId: number) => {
    try {
      setDeletingQuizId(quizId);
      // Call API to delete quiz
      await quizzService.updateStatusQuiz(quizId);

      // Update modules state to remove the deleted quiz
      const updatedModules = modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            quizzes: module.quizzes?.filter(q => q.id !== quizId) || [],
          };
        }
        return module;
      });
      setModules(updatedModules);

      toast.success(t('deleteSuccess'));
      setDeletingQuizId(null);
    } catch (error: any) {
      toast.error(error.message || t('deleteFailed'));
      setDeletingQuizId(null);
    }
  };

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategoryId(value);
    if (value !== null) {
      fetchCoursesByCategory();
    } else {
      setCourses([]);
    }
    setSelectedCourseId(null);
    setModules([]);
    setQuizzes([]);
  };

  return (
    <div className="container" style={{ marginTop: 50 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined style={{ color: '#07a169' }} />
            {t('title')}
          </Title>
          <Text type="secondary">{t('description')}</Text>
        </div>

        {/* Category Filter */}
        <Card style={{ borderRadius: '8px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ color: '#07a169', fontSize: '16px' }} />
              <Text strong>{t('filterByCategory')}</Text>
            </div>
            <Select
              placeholder={t('selectCategory')}
              loading={isLoadingCategories}
              value={selectedCategoryId || undefined}
              onChange={handleCategoryChange}
              style={{ width: '100%', maxWidth: '350px' }}
              options={[
                { label: t('allCategories'), value: 'all' },
                ...categories.map(cat => ({
                  label: cat.name,
                  value: cat.id,
                })),
              ]}
            />
          </Space>
        </Card>

        {/* Courses Section */}
        {selectedCategoryId && (
          <Card style={{ borderRadius: '8px' }} loading={isLoadingCourses}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOutlined style={{ color: '#07a169', fontSize: '16px' }} />
                <Text strong>{t('selectCourse')}</Text>
              </div>
              {courses.length === 0 ? (
                <Empty description={t('noCourses')} />
              ) : (
                <Row gutter={[16, 16]}>
                  {courses.map(course => (
                    <Col xs={24} sm={12} lg={8} key={course.id}>
                      <Card
                        hoverable
                        onClick={() => setSelectedCourseId(course.id)}
                        style={{
                          borderColor: selectedCourseId === course.id ? '#07a169' : undefined,
                          borderWidth: selectedCourseId === course.id ? 2 : 1,
                          background: selectedCourseId === course.id ? '#f6ffed' : undefined,
                          position: 'relative',
                        }}
                      >
                        {selectedCourseId === course.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#07a169',
                            }}
                          />
                        )}
                        <Text strong>{course.title}</Text>
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {t('code')}: {course.code}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Space>
          </Card>
        )}

        {/* Modules & Quizzes Section */}
        {selectedCourseId && (
          <Card style={{ borderRadius: '8px' }} loading={isLoadingModules}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOutlined style={{ color: '#07a169', fontSize: '16px' }} />
                <Text strong>
                  {t('modulesAndQuizzes')} {courses.find(c => c.id === selectedCourseId)?.title}
                </Text>
              </div>

              {modules.length === 0 ? (
                <Empty description={t('noModules')} />
              ) : (
                <Row gutter={[16, 16]}>
                  {modules.map(module => (
                    <Col xs={24} lg={12} key={module.id}>
                      <Card
                        style={{ borderRadius: '8px', height: '100%' }}
                        extra={
                          module.quizzes &&
                          module.quizzes.length > 0 && (
                            <Badge
                              count={module.quizzes.length}
                              style={{ backgroundColor: '#07a169' }}
                            />
                          )
                        }
                      >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {/* Module Info */}
                          <div>
                            <Title level={4} style={{ margin: 0 }}>
                              {module.title}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {module.description || 'No description'}
                            </Text>
                          </div>

                          {/* If Quiz Exists - Show Title and Delete Button */}
                          {module.quizzes && module.quizzes.length > 0 ? (
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '12px',
                                  background: '#f5f5f5',
                                  borderLeft: '3px solid #07a169',
                                  borderRadius: '4px',
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <Text strong style={{ fontSize: '14px' }}>
                                    {module.quizzes[0].title}
                                  </Text>
                                </div>
                                <Space size="small">
                                  <Link href={`/quizzes/create?quizId=${module.quizzes[0].id}`}>
                                    <Tooltip title={t('editQuiz')}>
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        style={{ color: '#2196f3' }}
                                      />
                                    </Tooltip>
                                  </Link>
                                  <Popconfirm
                                    title={t('deleteQuizConfirm')}
                                    description={t('deleteQuizConfirmDesc')}
                                    onConfirm={() =>
                                      handleDeleteQuiz(module.quizzes![0].id, module.id)
                                    }
                                    okText={t('yes')}
                                    cancelText={t('no')}
                                  >
                                    <Tooltip title={t('deleteQuiz')}>
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        style={{ color: '#f44336' }}
                                        loading={deletingQuizId === module.quizzes[0].id}
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </Space>
                              </div>
                            </div>
                          ) : (
                            // If No Quiz - Show Create New Quiz Button
                            <Link
                              href={`/quizzes/create?moduleId=${module.id}`}
                              style={{ width: '100%' }}
                            >
                              <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                block
                                style={{
                                  background: '#07a169',
                                  borderColor: '#07a169',
                                  height: '40px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                }}
                              >
                                {t('createNewQuiz')}
                              </Button>
                            </Link>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Space>
          </Card>
        )}

        {/* Empty State */}
        {!selectedCategoryId && (
          <Card style={{ textAlign: 'center', borderRadius: '8px' }}>
            <Empty
              description={t('selectCategoryToStart')}
              style={{ marginTop: '20px', marginBottom: '20px' }}
            />
          </Card>
        )}
      </Space>
    </div>
  );
};

export default QuizzesList;
