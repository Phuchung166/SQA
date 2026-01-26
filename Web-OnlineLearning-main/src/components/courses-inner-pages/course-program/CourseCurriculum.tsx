'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Course, CourseModule, GroupCourse, Lesson } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { formatMsDuration } from '@/utils/time';
import { parseNewlineString } from '@/utils/HelperUtils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CourseCurriculumProps {
  course?: GroupCourse;
  loading?: boolean;
}

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ course, loading }) => {
  const t = useTranslations('CourseDetails');
  const router = useRouter();

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

  // Convert milliseconds to HH:MM:SS format
  const formatDuration = (ms: number | string | undefined): string => {
    if (!ms) return '0s';

    const totalSeconds = Math.floor(Number(ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Use modules provided by parent when available, otherwise fallback to course.course_modules
  const courseModulesArray: Course[] = Array.isArray(course?.list_of_courses)
    ? course.list_of_courses
    : [];

  const isLoading = Boolean(loading);

  // State to store lessons per module (fetch via API using module id)

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* <h3 className="bd-course-details-content-title mb-0">{t('curriculum')}</h3> */}
        <h3 className="bd-course-details-content-title mb-0">
          {t('curriculumCount', { count: courseModulesArray.length })}
        </h3>
      </div>
      <div className="accordion-common-style accordion-transparent">
        <div className="accordion" id="accordionExample">
          {courseModulesArray.map((module, index) => (
            <div className="accordion-item" key={module.id || index}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-md-between"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded={index === 0}
                  aria-controls={`collapse${index}`}
                >
                  <div className="d-flex gap-5 align-items-start">
                    <Image
                      src={module.thumbnail || '/placeholder.png'}
                      alt={module.title}
                      width={40}
                      height={40}
                      style={{
                        width: 80,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                    <div
                      className="d-flex flex-column gap-2 "
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        maxWidth: '100%',
                        verticalAlign: 'middle',
                      }}
                    >
                      {/* Truncate long module titles so they don't overlap the lesson count */}
                      <span className="module-title" title={module.title}>
                        {module.title}
                      </span>
                      <div>
                        <span className="me-2 text-muted small" style={{ padding: 0 }}>
                          {t('course')} {index + 1}
                        </span>
                        <span className="course-program-span">•</span>
                        <span className=" text-muted small">{formatDuration(module.duration)}</span>
                      </div>
                    </div>
                  </div>

                  <span className="ms-auto ms-md-3 mt-3 mt-md-0">
                    <button
                      className="btn btn-link text-primary course-details-btn"
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/course-details/${module.id}`);
                      }}
                    >
                      {t('viewCourseDetails')}
                    </button>
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
                  {/* Description (Long Description) */}

                  {/* Short Description */}
                  {module.short_description && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">{t('description')}</h6>
                      <div
                        className="text-muted"
                        dangerouslySetInnerHTML={{ __html: module.short_description }}
                      />
                    </div>
                  )}

                  {/* What You Learn */}
                  {module.what_you_learn && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">{t('whatYouLearn')}</h6>
                      <ul className="list-unstyled">
                        {(Array.isArray(module.what_you_learn)
                          ? module.what_you_learn
                          : typeof module.what_you_learn === 'string'
                            ? (module.what_you_learn as string)
                                .split(/[,\n;]/)
                                .map((item: string) => item.trim())
                            : []
                        ).map((item: string, idx: number) => (
                          <li key={idx} className="mb-1">
                            <span className="text-success me-2">✓</span>
                            <span className="text-muted">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Target Audiences */}
                  {module.target_audiences && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">{t('targetAudiences')}</h6>
                      <ul className="list-unstyled">
                        {parseNewlineString(module.target_audiences).map(
                          (item: string, idx: number) => (
                            <li key={idx} className="mb-1">
                              <span className="text-success me-2">✓</span>
                              <span className="text-muted">{item}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
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
