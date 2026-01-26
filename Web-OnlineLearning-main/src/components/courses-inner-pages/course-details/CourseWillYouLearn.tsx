import React from 'react';
import { Course } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { parseNewlineString } from '@/utils/HelperUtils';

interface CourseWillYouLearnProps {
  course?: Course;
  loading?: boolean;
}

const CourseWillYouLearn: React.FC<CourseWillYouLearnProps> = ({ course, loading }) => {
  const t = useTranslations('CourseDetails');

  if (loading) {
    return (
      <div className="bd-course-details-content mb-30">
        <h3 className="bd-course-details-content-title">{t('whatYoullLearn')}</h3>
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (
    !course?.what_you_learn ||
    (Array.isArray(course.what_you_learn) && course.what_you_learn.length === 0) ||
    (typeof course.what_you_learn === 'string' &&
      (course.what_you_learn as string).trim().length === 0)
  ) {
    return (
      <div className="bd-course-details-content mb-30">
        <h3 className="bd-course-details-content-title">{t('whatYoullLearn')}</h3>
        <div className="alert alert-info d-flex align-items-center" role="alert">
          <i className="fas fa-info-circle"></i>
          <p className="mb-0" style={{ marginLeft: '10px' }}>
            {t('learningObjectivesSoon')}
          </p>
        </div>
      </div>
    );
  }

  // Parse what_you_learn - handle both string (newline-separated) and array formats
  const whatYouLearnArray: string[] = parseNewlineString(course?.what_you_learn);

  return (
    <div className="bd-course-details-content mb-30">
      <h3 className="bd-course-details-content-title">{t('whatYoullLearn')}</h3>
      <div className="bd-course-details-list">
        <ul>
          {whatYouLearnArray.map((topic, index) => (
            <li key={index}>
              <span className="list-icon success">
                <i className="fa-solid fa-check"></i>
              </span>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseWillYouLearn;
