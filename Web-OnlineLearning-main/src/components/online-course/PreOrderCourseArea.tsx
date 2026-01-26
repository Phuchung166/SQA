'use client';
import React, { useEffect, useState } from 'react';
import { getPreOrderCourses, PreOrderCourse } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/hooks/useMessage';
import Link from 'next/link';
import PreOrderCardV1 from '../common/course-card/PreOrderCardV1';
import { COURSE_STATUS } from '@/constants';

const PreOrderCourseArea = () => {
  const t = useTranslations('OnlineCourse');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const [preOrderCourses, setPreOrderCourses] = useState<PreOrderCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeErrorMessage = (err: unknown) => {
    if (!err) return 'Error fetching pre-order courses';
    if (err instanceof Error) return err.message;
    try {
      return String(err);
    } catch {
      return 'Error fetching pre-order courses';
    }
  };

  useEffect(() => {
    const fetchPreOrderCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPreOrderCourses({
          page: 1,
          pageSize: 6,
        });
        setPreOrderCourses(res.data || []);
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
    fetchPreOrderCourses();
  }, [tNotif, notification]);

  // Don't render if no pre-order courses
  if (!loading && preOrderCourses.length === 0) {
    return null;
  }

  return (
    <>
      {/* -- pre-order course area start -- */}
      <section className="bd-course-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8">
              <div className="bd-section-title-wrapper section-title-space text-center">
                <h2 className="bd-title">{t('hotDeal') || 'Pre-Order Courses'} 🔥</h2>
                <p>
                  {t('preOrderCourseDesc') ||
                    'Secure your spot in our upcoming courses at special pre-order prices'}
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            {loading ? (
              <div className="col-12 text-center" style={{ padding: '40px 0' }}>
                <p>{t('loading') || 'Loading...'}</p>
              </div>
            ) : error ? (
              <div className="col-12 text-center" style={{ padding: '40px 0', color: '#d9534f' }}>
                <p>{error}</p>
              </div>
            ) : preOrderCourses.length > 0 ? (
              preOrderCourses.map(course => <PreOrderCardV1 key={course.id} course={course} />)
            ) : null}
          </div>
          {!loading && !error && preOrderCourses.length > 0 && (
            <div className="row">
              <div className="col-12">
                <div className="bd-course-btn text-center mt-20">
                  <Link href="/pre-order-courses" className="bd-btn btn-primary">
                    <span>
                      {t('seeMoreCourses') || 'See More Courses'}
                      <i className="fa-regular fa-arrow-right ms-2"></i>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* -- pre-order course area end -- */}
    </>
  );
};

export default PreOrderCourseArea;
