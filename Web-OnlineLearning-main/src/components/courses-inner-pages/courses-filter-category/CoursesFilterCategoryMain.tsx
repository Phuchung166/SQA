'use client';
import React, { useEffect } from 'react';
import { useNotification } from '@/hooks/useMessage';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../../common/Breadcrumb/Breadcrumbs';
import CommonCourseSingleCard from '../../common/course-card/CommonCourseSingleCard';
import { GroupCourseCard } from '../../common/group-course-card';
import { Course, GroupCourse } from '@/services/courseService';
import { Category } from '@/services/categoryService';
import { useRouter } from 'next/navigation';
import { ALL_CATEGORIES } from '@/constants/CategoryConstants';
import { useTranslations } from 'next-intl';
import { encodeUrl } from '@/utils/HelperUtils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './CoursesFilterCategory.module.scss';

type CoursesFilterCategoryMainProps = {
  courses: Course[];
  groupCourses?: GroupCourse[];
  categoryId: number;
  categorySlug: string;
  categories?: Category[];
  fetchError?: string | null;
  hasTypeParam?: boolean;
  courseType?: string;
};

const CoursesFilterCategoryMain = ({
  courses,
  groupCourses = [],
  categoryId,
  categories,
  categorySlug: _categorySlug,
  fetchError,
  hasTypeParam = false,
  courseType = '',
}: CoursesFilterCategoryMainProps) => {
  const t = useTranslations('Header');
  const tCourses = useTranslations('courses');
  const router = useRouter();
  const notification = useNotification();
  const tNotif = useTranslations('notification');
  const categoryName = categories?.find(cat => parseInt(cat.id) === categoryId)?.name || t('all');

  useEffect(() => {
    if (fetchError) {
      notification.error({
        message: tNotif('error'),
        description: fetchError || tNotif('profile.loadError'),
        placement: 'topRight',
        duration: 5,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  // CASE 1: With type param (single type filter) - Grid view
  if (hasTypeParam) {
    const itemsToDisplay = courseType === 'group' ? groupCourses : courses;
    const emptyMessage =
      courseType === 'group'
        ? tCourses('noGroupCourses')
        : tCourses('noCoursesInCategory', { category: categoryName });

    return (
      <>
        <Breadcrumbs breadcrumbTitle={categoryName} />
        <section className="bd-course-list-area section-space">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xxl-12">
                <div className={styles.categoryFilterContainer}>
                  {/* Category buttons */}
                  {[
                    {
                      id: ALL_CATEGORIES,
                      name: t('all'),
                      isActive: true,
                      createdAt: '',
                      updatedAt: '',
                    },
                    ...(categories || []).map(c => ({
                      id: c.id,
                      name: c.name,
                      isActive: false,
                      createdAt: '',
                      updatedAt: '',
                    })),
                  ].map(category => (
                    <button
                      key={category.id}
                      className={`${styles.filterButton} ${categoryId === parseInt(category.id) ? styles.active : ''}`}
                      onClick={() => {
                        const newUrl = `/courses-filter-category/${parseInt(category.id) === -1 ? 'tat-ca' : encodeUrl(category.name)}?category=${category.id}${courseType ? `&type=${courseType}` : ''}`;
                        router.push(newUrl);
                      }}
                    >
                      <span className={styles.buttonText}>
                        {parseInt(category.id) === -1 ? t('all') : category.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="row g-30 grid">
                  {itemsToDisplay.length === 0 ? (
                    <div className="col-12 text-center py-5">
                      <div className="empty-category">
                        <i className="fa-regular fa-folder-open fa-3x text-muted"></i>
                        <h4 className="mt-3">{emptyMessage}</h4>
                        <p className="text-muted">{tCourses('tryDifferentCategory') || ''}</p>
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {itemsToDisplay.map(item => (
                        <motion.div
                          key={item.id}
                          className="col-xl-4 col-lg-6 col-md-6"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {courseType === 'group' ? (
                            <GroupCourseCard groupCourse={item as GroupCourse} />
                          ) : (
                            <CommonCourseSingleCard course={item as Course} />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // CASE 2: Without type param - Carousel browse view
  return (
    <>
      <Breadcrumbs breadcrumbTitle={categoryName} />
      <section className="bd-course-list-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xxl-12">
              <div className={styles.categoryFilterContainer}>
                {/* Category buttons */}
                {[
                  {
                    id: ALL_CATEGORIES,
                    name: t('all'),
                    isActive: true,
                    createdAt: '',
                    updatedAt: '',
                  },
                  ...(categories || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    isActive: false,
                    createdAt: '',
                    updatedAt: '',
                  })),
                ].map(category => (
                  <button
                    key={category.id}
                    className={`${styles.filterButton} ${categoryId === parseInt(category.id) ? styles.active : ''}`}
                    onClick={() => {
                      router.push(
                        `/courses-filter-category/${parseInt(category.id) === -1 ? 'tat-ca' : encodeUrl(category.name)}?category=${category.id}`,
                      );
                    }}
                  >
                    <span className={styles.buttonText}>
                      {parseInt(category.id) === -1 ? t('all') : category.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* GROUP COURSES CAROUSEL */}
              {groupCourses.length > 0 && (
                <motion.div
                  className="mb-60"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="d-flex justify-content-between align-items-center mb-40">
                    <h3 className="mb-0">{tCourses('groupCourses')}</h3>
                    {groupCourses.length > 0 && (
                      <button
                        className="btn btn-outline-primary btn-lg"
                        style={{ fontSize: 16, fontWeight: 500 }}
                        onClick={() =>
                          router.push(
                            `/courses-filter-category/${encodeUrl(categoryName)}?category=${categoryId}&type=group`,
                          )
                        }
                      >
                        {tCourses('viewAll')} →
                      </button>
                    )}
                  </div>
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={true}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    breakpoints={{
                      640: {
                        slidesPerView: 1,
                      },
                      768: {
                        slidesPerView: 2,
                      },
                      1024: {
                        slidesPerView: 3,
                      },
                      1280: {
                        slidesPerView: 3,
                      },
                    }}
                    className="swiper-group-courses"
                  >
                    {groupCourses.map(groupCourse => (
                      <SwiperSlide key={groupCourse.id}>
                        <GroupCourseCard groupCourse={groupCourse} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </motion.div>
              )}

              {/* INDEPENDENT COURSES CAROUSEL */}
              {courses.length > 0 && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <div className="d-flex justify-content-between align-items-center mb-40">
                    <h3 className="mb-0">{tCourses('courses')}</h3>
                    {courses.length > 0 && (
                      <button
                        className="btn btn-outline-primary btn-lg"
                        onClick={() =>
                          router.push(
                            `/courses-filter-category/${encodeUrl(categoryName)}?category=${categoryId}&type=independent`,
                          )
                        }
                      >
                        {tCourses('viewAll')} →
                      </button>
                    )}
                  </div>
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={true}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    breakpoints={{
                      640: {
                        slidesPerView: 1,
                      },
                      768: {
                        slidesPerView: 2,
                      },
                      1024: {
                        slidesPerView: 3,
                      },
                      1280: {
                        slidesPerView: 3,
                      },
                    }}
                    className="swiper-courses"
                  >
                    {courses.map(course => (
                      <SwiperSlide key={course.id}>
                        <CommonCourseSingleCard course={course} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </motion.div>
              )}

              {/* Empty state for both */}
              {courses.length === 0 && groupCourses.length === 0 && (
                <div className="col-12 text-center py-5">
                  <div className="empty-category">
                    <i className="fa-regular fa-folder-open fa-3x text-muted"></i>
                    <h4 className="mt-3">
                      {tCourses('noCoursesInCategory', { category: categoryName })}
                    </h4>
                    <p className="text-muted">{tCourses('tryDifferentCategory') || ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CoursesFilterCategoryMain;
