'use client';

import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import InstructorProgress from './InstructorProgress';
import ExperienceSection from './ExperienceSection';
import MyCoursesSection from './MyCoursesSection';
import userService, { InstructorDetailProfile, InstructorCourse } from '@/services/userService';

// Helper function to render stars based on rating
const renderStars = (rating: number | undefined) => {
  if (!rating) return null;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const stars = [];

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
  }

  // Half star
  if (hasHalfStar) {
    stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
  }

  return stars;
};

const InstructorDetailsMain = ({ slug }: { slug: string }) => {
  const t = useTranslations();
  const [instructor, setInstructor] = useState<InstructorDetailProfile | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch instructor profile
        const profileData = await userService.getInstructorDetailBySlug(slug);
        setInstructor(profileData);

        // Fetch instructor courses
        const coursesData = await userService.getInstructorCoursesBySlug(slug, 1, 50);
        setCourses(coursesData.data || []);
      } catch (err: any) {
        setError(err?.errorMessage || err?.message || 'Failed to load instructor data');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchInstructorData();
    } else {
      setError('No instructor slug provided');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <>
        <Breadcrumbs breadcrumbTitle={t('InstructorDetails.title')} />
        <section className="bd-instructor-details-area section-space">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">{t('InstructorDetails.loading')}</span>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !instructor) {
    return (
      <>
        <Breadcrumbs breadcrumbTitle={t('InstructorDetails.title')} />
        <section className="bd-instructor-details-area section-space">
          <div className="container">
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p className="mb-0">{error || t('InstructorDetails.notFound')}</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('InstructorDetails.title')} />
      <section className="bd-instructor-details-area section-space">
        <div className="container">
          <div className="row g-30">
            <div className="col-xl-4 col-lg-4 col-md-12">
              <div className="bd-instructor-details-info sidebar-left sidebar-sticky">
                <div className="bd-instructor-details-thumb mb-20">
                  {instructor?.avatar && (
                    <Image
                      src={instructor.avatar}
                      alt={`${instructor.first_name} ${instructor.last_name}`}
                      width={300}
                      height={300}
                    />
                  )}
                </div>
                <div className="bd-instructor-info">
                  <h3 className="name mb--5">
                    {instructor?.first_name} {instructor?.last_name}
                  </h3>
                  <span className="designation mb--5 d-block">{instructor?.expertise}</span>
                  <div className="bd-instructor-rating mb-15">
                    <div className="rating-star rating-spacing-2">{renderStars(4.5)}</div>
                    <span className="rating-count">(4.5) - 0 {t('reviews')}</span>
                  </div>
                  <div className="bd-instructor-info-list mb-20">
                    <ul>
                      <li>
                        <Link href={`mailto:${instructor?.email}`}>
                          <i className="fal fa-envelope"></i>
                          {instructor?.email}
                        </Link>
                      </li>
                      <li>
                        <Link href={`tel:${instructor?.phone}`}>
                          <i className="far fa-phone-alt"></i> {instructor?.phone}
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="theme-social">
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
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-8 col-lg-8 col-md-12">
              <div className="bd-instructor-details-content">
                <div className="bd-instructor-feature-box mb-30">
                  <h3 className="bd-instructor-details-title">
                    {t('InstructorDetails.biography')}
                  </h3>
                  <p className="bd-instructor-details-desc">
                    {instructor?.bio || 'No biography available'}
                  </p>
                </div>
                <div className="bd-instructor-feature-box mb-30">
                  <h3 className="bd-instructor-details-title">{t('InstructorDetails.skills')}</h3>
                  {/* <InstructorProgress instructor={instructor} /> */}
                </div>
                <ExperienceSection instructor={instructor} totalCourses={courses.length} />
                <div className="bd-instructor-feature-box mb-30">
                  <h3 className="bd-instructor-details-title">
                    {t('InstructorDetails.qualifications')}
                  </h3>
                  <p>{instructor?.qualification}</p>
                </div>
                <div className="bd-instructor-feature-box">
                  <h3 className="bd-instructor-details-title">
                    {t('InstructorDetails.myCourses')} ({courses.length})
                  </h3>
                  <MyCoursesSection courses={courses} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default InstructorDetailsMain;
