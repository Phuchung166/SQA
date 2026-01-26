import instructorsData from '@/data/instructor-data';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CoursesInstructoreArea from '../common/course-section/CoursesInstructoreArea';
import { useTranslations } from 'next-intl';
import { InstructorProfile, userService } from '@/services/userService';

const OnlineCourseInstructor = () => {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  // call api top instructor in this component
  useEffect(() => {
    const fetchTopInstructors = async () => {
      const data = await userService.getTopInstructors();
      setInstructors(data);
    };
    fetchTopInstructors();
  }, []);
  console.log('instructors', instructors);
  const t = useTranslations('OnlineCourse');
  return (
    <>
      <section className="bd-instructor-area section-space-top pb-200 primary-bg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <div className="bd-section-title-wrapper section-title-space text-center">
                <span className="bd-section-subtitle">
                  {t('instructorSubtitle') ?? 'Instructor'}
                </span>
                <h2 className="bd-section-title">
                  {t('instructorTitle') ?? 'Our Course'}{' '}
                  <span className="down-mark-line">{t('instructorTitleMark') ?? 'Instructor'}</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="row gy-30">
            {instructors.slice(0, 4).map(instructor => (
              <div key={instructor.slug} className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-6">
                <CoursesInstructoreArea instructor={instructor} />
              </div>
            ))}
            <div className="bd-instructor-btn d-flex-center mt-50">
              <Link className="bd-btn btn-outline-border-primary" href="/instructor">
                {t('viewMore') ?? 'View More'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OnlineCourseInstructor;
