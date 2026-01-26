'use client';
import GetRating from '@/components/common/GetRating';
import coursesData from '@/data/courses/courses-data';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';
import { InstructorCourse } from '@/services/userService';

interface MyCoursesSectionProps {
  courses?: InstructorCourse[];
}

const MyCoursesSection: React.FC<MyCoursesSectionProps> = ({ courses }) => {
  const t = useTranslations();
  // Use passed courses or fall back to mock data
  const displayCourses = courses && courses.length > 0 ? courses : coursesData.slice(0, 4);

  return (
    <>
      {/* -- course area start -- */}

      <div className="row gy-30">
        {displayCourses.length > 0 ? (
          displayCourses.map((item: any) => (
            <div className="col-xl-6 col-lg-12 col-md-6" key={item.id}>
              <div className="bd-course-wrapper style-seven">
                <Link
                  href={`/course-details/${item.id}`}
                  className="bd-course-thumb-wrapper bd-course-thumb-style p-relative"
                >
                  <div className="bd-course-thumb-bg bg-1">
                    {(item.thumbnail || item.image) && (
                      <Image
                        src={item.thumbnail || item.image}
                        style={{ width: '100%', height: 'auto' }}
                        alt={item.title}
                        width={500}
                        height={300}
                      />
                    )}
                  </div>
                </Link>
                <div className="bd-course-content">
                  <h5 className="bd-course-title underline mb-10">
                    <Link href={`/course-details/${item.id}`}>{item.title}</Link>
                  </h5>
                  <div className="bd-course-btn">
                    <Link
                      className="bd-btn btn-outline-primary"
                      href={`/course-details/${item.id}`}
                    >
                      {t('InstructorDetails.viewCourse')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p>{t('InstructorDetails.noCoursesAvailable')}</p>
          </div>
        )}
      </div>
      {/* -- course area end -- */}
    </>
  );
};

export default MyCoursesSection;
