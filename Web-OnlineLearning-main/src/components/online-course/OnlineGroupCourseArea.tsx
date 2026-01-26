'use client';
import { useEffect, useState } from 'react';
import { getGroupCourses, GroupCourse } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/hooks/useMessage';
import Link from 'next/link';
import React from 'react';
import GroupCourseCard from '../common/group-course-card/GroupCourseCard';
import { COURSE_VIEW_MODE } from '@/constants';

const OnlineGroupCourseArea = () => {
  const t = useTranslations('OnlineCourse');
  const [groupCourses, setGroupCourses] = useState<GroupCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeErrorMessage = (err: unknown) => {
    if (!err) return 'Error fetching group courses';
    if (err instanceof Error) return err.message;
    try {
      return String(err);
    } catch {
      return 'Error fetching group courses';
    }
  };

  const tNotif = useTranslations('notification');
  const notification = useNotification();

  useEffect(() => {
    const fetchGroupCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getGroupCourses({
          page: 1,
          pageSize: 6,
        });
        setGroupCourses(res.data || []);
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
    fetchGroupCourses();
  }, [tNotif, notification]);

  return (
    <>
      {/* -- course area start -- */}
      <section className="bd-course-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8">
              <div className="bd-section-title-wrapper section-title-space text-center">
                <span className="bd-section-subtitle">{t('groupCourseAreaSubtitle')}</span>
                <h2 className="bd-section-title">{t('groupCourseAreaHeading')}</h2>
              </div>
            </div>
          </div>
          {loading && <div>Loading group courses...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="row gy-30">
            {groupCourses.map(item => (
              <div className="col-xl-4 col-lg-6 col-md-6" key={item.id}>
                <GroupCourseCard groupCourse={item} viewMode={COURSE_VIEW_MODE.DEFAULT} />
              </div>
            ))}
          </div>
          <div className="bd-course-btn d-flex-center mt-50">
            <Link
              className="bd-btn btn-outline-border-primary"
              href="/courses-filter-category/tat-ca?category=-1"
            >
              {t('seeMorePrograms')}
            </Link>
          </div>
        </div>
      </section>
      {/* -- course area end -- */}
    </>
  );
};

export default OnlineGroupCourseArea;
