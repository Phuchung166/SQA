import Link from 'next/link';
import React from 'react';
import avatarImg from '../../../../public/assets/images/avatar/avatar.webp';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { InstructorResponse } from '@/services/courseService';

const DetailsInstructor = ({ instructor }: { instructor: InstructorResponse }) => {
  console.log('instructor', instructor);
  const t = useTranslations('CourseDetails');
  return (
    <>
      <div className="bd-course-instructors mb-30">
        <h3 className="bd-course-details-content-title">{t('instructor')}</h3>
        <div className="bd-course-instructors-content">
          <div className="thumb">
            <Link href={`/instructor/instructor-details/${instructor.slug}`}>
              {instructor?.avatar ? (
                <Image src={instructor.avatar} alt="instructor" width={40} height={40} />
              ) : (
                <Image src={avatarImg} alt="instructor" width={40} height={40} />
              )}
            </Link>
          </div>
          <div className="bd-course-instructors-info">
            <div className="mb--5">
              <h6 className="name">
                <Link href="#">
                  {instructor.first_name} {instructor.last_name}
                </Link>
              </h6>
              <span className="designation">{instructor?.expertise}</span>
            </div>
            {/* <div className="bd-course-instructors-rating mb--5">
              <div className="icon">
                <i className="fas fa-star"></i>
              </div>
              <span>4.9 (120 reviews)</span>
            </div> */}
            <div className="bd-course-instructors-course mb-15">
              <div className="item">
                <i className="fas fa-desktop"></i>{' '}
                <span>
                  {instructor.total_courses} {t('course')}
                </span>
              </div>
              <div className="item">
                <i className="far fa-user-friends"></i>{' '}
                <span>
                  {instructor.total_students} {t('student')}
                </span>
              </div>
            </div>
            {/* <div className="theme-social">
              <ul className="social-icon-list">
                <li>
                  <Link href="https://www.facebook.com/" target="_blank">
                    <i className="fa-brands fa-facebook-f"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://x.com/" target="_blank">
                    <i className="fa-brands fa-x-twitter"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.linkedin.com/feed/" target="_blank">
                    <i className="fa-brands fa-linkedin-in"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.instagram.com/" target="_blank">
                    <i className="fa-brands fa-instagram"></i>
                  </Link>
                </li>
                <li>
                  <Link href="https://www.behance.net/" target="_blank">
                    <i className="fa-brands fa-behance"></i>
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
        <div className="bd-course-instructors-bio mt-15">
          <p>{instructor?.bio}</p>
        </div>
      </div>
    </>
  );
};

export default DetailsInstructor;
