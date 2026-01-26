import React from 'react';
import { Course } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { parseNewlineString } from '@/utils/HelperUtils';

interface CourseTargetAudiencesProps {
  course?: Course;
  loading?: boolean;
}

const CourseTargetAudiences: React.FC<CourseTargetAudiencesProps> = ({ course, loading }) => {
  const t = useTranslations('CourseDetails');

  if (loading) {
    return (
      <div className="bd-course-details-content mb-30">
        <h3 className="bd-course-details-content-title">{t('targetAudiences')}</h3>
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Parse target_audiences - handle both string (newline-separated) and array formats
  const targetAudiencesArray = parseNewlineString(course?.target_audiences);

  if (!targetAudiencesArray || targetAudiencesArray.length === 0) {
    return null;
  }

  return (
    <div className="bd-course-details-content mb-30">
      <h3 className="bd-course-details-content-title">{t('targetAudiences')}</h3>
      <div className="bd-course-details-list">
        <ul>
          {targetAudiencesArray.map((audience, index) => (
            <li key={index}>
              <span className="list-icon success">
                <i className="fa-solid fa-check"></i>
              </span>
              {audience}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseTargetAudiences;
