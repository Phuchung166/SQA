import { InstructorProfile } from '@/services/userService';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface IInstructorProps {
  instructor: InstructorProfile;
}

const CoursesInstructoreArea = ({ instructor }: IInstructorProps) => {
  return (
    <>
      {/* -- instructor area start -- */}
      <div className="bd-instructor-wrapper style-two">
        <div className="bd-instructor-item">
          <div className="bd-instructor-thumb-wrap">
            <div className="bd-instructor-thumb">
              <Link href={`/instructor/instructor-details/${instructor.slug}`}>
                <Image
                  style={{ width: '100%', height: 400, objectFit: 'cover' }}
                  width={100}
                  height={100}
                  src={instructor.avatar}
                  alt="instructor"
                />
              </Link>
            </div>
            <div className="bd-instructor-social theme-social has-white circle text-center">
              <ul className="social-icon-list">
                <li className="bd-icon-1">
                  {instructor?.socialLinks?.facebook && (
                    <Link href={instructor.socialLinks.facebook} target="_blank">
                      <i className="fa-brands fa-facebook-f"></i>
                    </Link>
                  )}
                </li>
                <li className="bd-icon-2">
                  {instructor?.socialLinks?.twitter && (
                    <Link href={instructor.socialLinks.twitter} target="_blank">
                      <i className="fa-brands fa-x-twitter"></i>
                    </Link>
                  )}
                </li>
                <li className="bd-icon-3">
                  {instructor?.socialLinks?.linkedin && (
                    <Link href={instructor.socialLinks.linkedin} target="_blank">
                      <i className="fa-brands fa-linkedin-in"></i>
                    </Link>
                  )}
                </li>
                <li className="bd-icon-4">
                  {instructor?.socialLinks?.instagram && (
                    <Link href={instructor.socialLinks.instagram} target="_blank">
                      <i className="fa-brands fa-instagram"></i>
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </div>
          <div className="bd-instructor-info">
            <h6 className="name underline">
              <Link href={`/instructor/instructor-details/${instructor.slug}`}>
                {instructor.first_name} {instructor.last_name}
              </Link>
            </h6>
            <span>{instructor.expertise}</span>
          </div>
        </div>
      </div>
      {/* -- instructor area end -- */}
    </>
  );
};

export default CoursesInstructoreArea;
