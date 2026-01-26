import React from 'react';
import { Course } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { parseNewlineString } from '@/utils/HelperUtils';

interface CourseRequirementsProps {
  course?: Course;
  loading?: boolean;
}

const CourseRequirements: React.FC<CourseRequirementsProps> = ({ course, loading }) => {
  const t = useTranslations('CourseDetails');

  if (loading) {
    return (
      <div className="bd-course-details-content mb-30">
        <h3 className="bd-course-details-content-title">{t('requirements')}</h3>
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Parse target_audiences as requirements - handle both string (newline-separated) and array formats
  const requirementsArray = parseNewlineString(course?.target_audiences);

  if (!requirementsArray || requirementsArray.length === 0) {
    return (
      <div className="bd-course-details-content mb-30">
        <h3 className="bd-course-details-content-title">{t('requirements')}</h3>
        <div className="alert alert-info d-flex align-items-center" role="alert">
          <i className="fas fa-info-circle"></i>
          <p className="mb-0" style={{ marginLeft: '10px' }}>
            {t('requirementsComingSoon')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bd-course-details-content mb-30">
      <h3 className="bd-course-details-content-title">{t('requirements')}</h3>
      <div className="bd-course-details-list">
        <ul>
          {requirementsArray.map((requirement, index) => (
            <li key={index}>
              <span className="list-icon">
                <i className="fa-solid fa-check"></i>
              </span>
              {requirement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseRequirements;
