import BookSvg from '@/svg/BookSvg';
import RatingSvg from '@/svg/RatingSvg';
import StudentsSvg from '@/svg/StudentsSvg';
import React from 'react';
import { useTranslations } from 'next-intl';
import { InstructorDetailProfile } from '@/services/userService';

interface ExperienceSectionProps {
  instructor?: InstructorDetailProfile | null;
  totalCourses?: number;
}

const ExperienceSection = ({ instructor, totalCourses = 0 }: ExperienceSectionProps) => {
  const t = useTranslations();

  return (
    <>
      <div className="bd-instructor-feature-box mb-30">
        <h3 className="bd-instructor-details-title">{t('InstructorDetails.experience')}</h3>
        <p className="bd-instructor-details-desc">{instructor?.bio || t('common.loading')}</p>
        <div className="bd-experience-box-wrapper">
          <div className="bd-experience-box">
            <div className="icon">
              <BookSvg />
            </div>
            <h3 className="title">{instructor?.total_courses || totalCourses}</h3>
            <p className="subtitle">{t('InstructorDetails.totalCourses')}</p>
          </div>
          <div className="bd-experience-box">
            <div className="icon">
              <StudentsSvg />
            </div>
            <h3 className="title">{instructor?.total_students || '0'}</h3>
            <p className="subtitle">{t('InstructorDetails.totalStudents')}</p>
          </div>
          <div className="bd-experience-box">
            <div className="icon">
              <RatingSvg />
            </div>
            <h3 className="title">4.5</h3>
            <p className="subtitle">{t('InstructorDetails.averageRating')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExperienceSection;
