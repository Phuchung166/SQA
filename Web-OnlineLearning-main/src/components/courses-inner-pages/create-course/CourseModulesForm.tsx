import React from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Tag, Typography, Empty, Popconfirm } from 'antd';
import { PlusOutlined, BookOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CreateCourseRequest, CourseModule, Lesson } from '@/services/courseService';

const { Title, Text } = Typography;

interface CourseModulesFormProps {
  courseData: CreateCourseRequest;
  onAddModule: () => void;
  onAddLesson: (moduleId?: number) => void;
  onEditModule?: (module: CourseModule) => void;
  onDeleteModule?: (moduleId: number) => void;
  onEditLesson?: (lesson: Lesson, moduleId: number) => void;
  onDeleteLesson?: (lessonId: number) => void;
}

const CourseModulesForm: React.FC<CourseModulesFormProps> = ({
  courseData,
  onAddModule,
  onAddLesson,
  onEditModule,
  onDeleteModule,
  onEditLesson,
  onDeleteLesson,
}) => {
  const t = useTranslations('CreateCourse');
  const isUpdateMode = !!(onEditModule || onDeleteModule || onEditLesson || onDeleteLesson);

  // Support both camelCase (create) and snake_case (update) field names
  const modules = (courseData as any).course_modules || (courseData as any).courseModules || [];

  return (
    <div className="course-modules-form">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          {t('modules.title') ?? 'Course Modules'}
        </Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddModule}>
            {t('modules.addModule') ?? 'Add Module'}
          </Button>
          {!isUpdateMode && (
            <Button
              icon={<BookOutlined />}
              onClick={() => onAddLesson()}
              disabled={modules.length === 0}
            >
              {t('modules.addLesson') ?? 'Add Lesson'}
            </Button>
          )}
        </div>
      </div>

      {modules.length === 0 ? (
        <Empty
          description={t('modules.noModules') ?? 'No modules created yet'}
          style={{ padding: '40px 0' }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddModule}>
            {t('modules.createFirstModule') ?? 'Create First Module'}
          </Button>
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modules.map((module: any, moduleIndex: number) => (
            <Card
              key={module.id || moduleIndex}
              title={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text strong>
                    {t('modules.moduleLabel', { index: moduleIndex + 1, title: module.title }) ??
                      `Module ${moduleIndex + 1}: ${module.title}`}
                  </Text>
                  {isUpdateMode && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {onEditModule && (
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEditModule(module)}
                        >
                          {t('modules.edit')}
                        </Button>
                      )}
                      {onDeleteModule && module.id && (
                        <Popconfirm
                          title={t('modules.deleteModuleTitle')}
                          description={t('modules.deleteModuleConfirm')}
                          onConfirm={() => onDeleteModule(module.id!)}
                          okText={t('modules.yes')}
                          cancelText={t('modules.no')}
                          okButtonProps={{ danger: true }}
                        >
                          <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                            {t('modules.delete')}
                          </Button>
                        </Popconfirm>
                      )}
                      {onAddLesson && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => onAddLesson(module.id || moduleIndex + 1)}
                        >
                          {t('modules.addLesson')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              }
              size="small"
            >
              <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
                {module.description}
              </Text>

              {!module.lessons || module.lessons.length === 0 ? (
                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                  {t('modules.noLessons') ?? 'No lessons in this module'}
                </Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {module.lessons.map((lesson: any, lessonIndex: number) => (
                    <div
                      key={lesson.id || lessonIndex}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '6px',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>{lesson.title}</Text>
                        <Tag color="blue">{lesson.content_type || lesson.contentType}</Tag>
                        {(lesson.is_mandatory || lesson.isMandatory) && (
                          <Tag color="orange">{t('modules.mandatory') ?? 'Mandatory'}</Tag>
                        )}
                      </div>
                      {isUpdateMode && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {onEditLesson && lesson.id && (
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => onEditLesson(lesson, module.id!)}
                            />
                          )}
                          {onDeleteLesson && lesson.id && (
                            <Popconfirm
                              title={t('modules.deleteLessonTitle')}
                              description={t('modules.deleteLessonConfirm')}
                              onConfirm={() => onDeleteLesson(lesson.id!)}
                              okText={t('modules.yes')}
                              cancelText={t('modules.no')}
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseModulesForm;
