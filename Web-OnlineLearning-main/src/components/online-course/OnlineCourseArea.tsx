'use client';
// import coursesData from '@/data/courses/courses-data';
import { useEffect, useState } from 'react';
import { getCourses, Course } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/hooks/useMessage';
import { wishlist_product } from '@/redux/slices/wishlistSlice';
import Link from 'next/link';
import React from 'react';
import { useDispatch } from 'react-redux';
// import CourseCard from '../common/CourseCard';
import CourseCardV1 from '../common/course-card/CourseCardV1';
import { COURSE_STATUS } from '@/constants';

const OnlineCourseArea = () => {
  const dispatch = useDispatch();
  const t = useTranslations('OnlineCourse');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Runtime list of allowed hostnames (should mirror next.config.js remotePatterns)
  const allowedImageHosts = new Set([
    'd32trhawgfkkkj.cloudfront.net',
    'cloudfront.net',
    'amazonaws.com',
    'res.cloudinary.com',
    'images.unsplash.com',
    'storage.googleapis.com',
  ]);

  const isHostAllowed = (url?: string) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      const hostname = u.hostname.toLowerCase();
      // allow exact or parent domain matches (e.g., *.cloudfront.net)
      if (allowedImageHosts.has(hostname)) return true;
      for (const h of allowedImageHosts) {
        if (hostname.endsWith('.' + h)) return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const safeErrorMessage = (err: unknown) => {
    if (!err) return 'Error fetching courses';
    if (err instanceof Error) return err.message;
    try {
      return String(err);
    } catch {
      return 'Error fetching courses';
    }
  };

  const tNotif = useTranslations('notification');
  const notification = useNotification();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCourses({
          page: 1,
          pageSize: 6,
          // status: 'published',
        });
        setCourses(
          res.data?.filter(c => c.status === COURSE_STATUS.ACTIVE && !c.is_pre_order) || [],
        );
      } catch (err: unknown) {
        const errMsg = safeErrorMessage(err);
        setError(errMsg);
        notification.error({
          message: tNotif ? tNotif('error') : 'Error',
          description: errMsg,
          placement: 'topRight',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [tNotif, notification]);

  // Accept Course directly for wishlist from this component
  const handleAddCourseToWishlist = (course: Course) => {
    dispatch(wishlist_product(course));
  };

  return (
    <>
      {/* -- course area start -- */}
      <section className="bd-course-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8">
              <div className="bd-section-title-wrapper section-title-space text-center">
                <span className="bd-section-subtitle">{t('courseAreaSubtitle')}</span>
                <h2 className="bd-section-title">{t('courseAreaHeading')}</h2>
              </div>
            </div>
          </div>
          {loading && <div>Loading courses...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="row gy-30">
            {courses.map(item => (
              <CourseCardV1
                course={item}
                isHostAllowed={isHostAllowed}
                onAddToWishlist={handleAddCourseToWishlist}
                key={item.id}
              />
            ))}
          </div>
          <div className="bd-course-btn d-flex-center mt-50">
            <Link
              className="bd-btn btn-outline-border-primary"
              href="/courses-filter-category/tat-ca?category=-1"
            >
              {t('seeMoreCourses')}
            </Link>
          </div>
        </div>
      </section>
      {/* -- course area end -- */}
    </>
  );
};

export default OnlineCourseArea;
