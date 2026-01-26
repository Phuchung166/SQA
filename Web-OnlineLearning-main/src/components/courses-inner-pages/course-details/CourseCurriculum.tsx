'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Course, CourseModule, Lesson, getCourseModules } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { formatMsDuration } from '@/utils/time';

interface CourseCurriculumProps {
  course?: Course;
  loading?: boolean;
}

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ course, loading }) => {
  const t = useTranslations('CourseDetails');
  const [courseModulesArray, setCourseModulesArray] = useState<CourseModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  // Fetch modules when course is available
  useEffect(() => {
    if (!course?.id) return;

    const fetchModules = async () => {
      try {
        setIsLoadingModules(true);
        setModuleError(null);
        const response = await getCourseModules({
          page: 1,
          pageSize: 100,
          courseId: course.id,
        });
        console.log('Fetched course modules:', response.data);
        setCourseModulesArray(response.data || []);
      } catch (error) {
        console.error('Error fetching course modules:', error);
        setModuleError('Failed to load course modules');
      } finally {
        setIsLoadingModules(false);
      }
    };

    fetchModules();
  }, [course?.id]);

  // Helper functions
  // duration is stored in milliseconds; legacy video_duration may be in seconds
  // Use shared utils to format durations

  const getLessonDurationMs = (lesson: any) => {
    if (lesson?.duration != null) return Number(lesson.duration);
    return 0;
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return 'fa-solid fa-video';
      case 'document':
        return 'fa-solid fa-file-pdf';
      case 'text':
        return 'fa-solid fa-file-text';
      default:
        return 'fa-solid fa-play';
    }
  };

  const isLoading = Boolean(loading) || isLoadingModules;

  if (isLoading) {
    return (
      <div className="bd-course-curriculum mb-30">
        <h3 className="bd-course-details-content-title">{t('curriculum')}</h3>
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">{t('loadingCurriculum')}</span>
          </div>
          <p className="mt-2">{t('loadingCurriculum')}</p>
        </div>
      </div>
    );
  }

  // we no longer fetch inside this component; any fetch errors should be handled by the parent

  if (
    !courseModulesArray ||
    !Array.isArray(courseModulesArray) ||
    courseModulesArray.length === 0
  ) {
    return (
      <div className="bd-course-curriculum mb-30">
        <h3 className="bd-course-details-content-title">{t('curriculum')}</h3>
        <div className="alert alert-info d-flex align-items-center" role="alert">
          <i className="fas fa-info-circle"></i>
          <p className="mb-0" style={{ marginLeft: '10px' }}>
            {t('noCurriculum')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bd-course-curriculum mb-30">
      <h3 className="bd-course-details-content-title">{t('curriculum')}</h3>
      <div className="accordion-common-style accordion-transparent">
        <div className="accordion" id="accordionExample">
          {courseModulesArray
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((module, index) => (
              <div className="accordion-item" key={module.id || index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded={index === 0}
                    aria-controls={`collapse${index}`}
                  >
                    <span className="me-2 text-muted small">
                      {t('module')} {index + 1}.
                    </span>

                    {/* Truncate long module titles so they don't overlap the lesson count */}
                    <span
                      className="module-title"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        maxWidth: '55%',
                        verticalAlign: 'middle',
                      }}
                      title={module.title}
                    >
                      {module.title}
                    </span>

                    <span className="ms-auto me-3 text-muted">
                      {module.total_lessons || 0} {t('lessons')}
                    </span>
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    {module.description && (
                      <p className="module-description mb-3 text-muted">{module.description}</p>
                    )}
                    {(
                      (module.lessons && Array.isArray(module.lessons) && module.lessons.length > 0
                        ? module.lessons
                        : []) as Lesson[]
                    ).length > 0 ? (
                      (module.lessons as Lesson[])
                        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                        .map(lesson => (
                          <Link
                            key={lesson.id}
                            href="#"
                            className="bd-course-curriculum-content d-flex-between"
                          >
                            <div className="bd-course-curriculum-info d-flex align-items-start gap-10">
                              <div className="icon">
                                <i className={getContentIcon(lesson.content_type)}></i>
                              </div>
                              <div>
                                <p
                                  className="title"
                                  title={lesson.title}
                                  style={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    whiteSpace: 'normal',
                                    overflowWrap: 'break-word',
                                    wordBreak: 'break-word',
                                    marginBottom: 0,
                                  }}
                                >
                                  {lesson.title}
                                </p>
                                {lesson.description && (
                                  <small className="text-muted d-block">{lesson.description}</small>
                                )}
                              </div>
                            </div>
                            <div className="bd-course-curriculum-meta d-flex align-items-start gap-10">
                              {lesson.duration != null && (
                                <span className="duration">
                                  {formatMsDuration(getLessonDurationMs(lesson))}
                                </span>
                              )}
                              <span className="status">
                                {lesson.is_preview ? (
                                  <i
                                    className="fa-solid fa-play text-success"
                                    title="Preview available"
                                  ></i>
                                ) : (
                                  <i className="fa-solid fa-lock"></i>
                                )}
                              </span>
                            </div>
                          </Link>
                        ))
                    ) : (
                      <p className="text-muted">{t('noLessonsAvailable')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCurriculum;
