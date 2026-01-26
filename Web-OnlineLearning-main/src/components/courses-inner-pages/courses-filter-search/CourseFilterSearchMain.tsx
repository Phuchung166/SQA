'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CommonCourseSingleCard from '../../common/course-card/CommonCourseSingleCard';
import GroupCourseCard from '../../common/group-course-card/GroupCourseCard';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import CourseFilter from '@/components/common/course-filtering/CourseFilter';
import useGlobalContext from '@/hooks/useContexts';
import { getCourses, Course, getGroupCourses, GroupCourse } from '@/services/courseService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '@/styles/scss/layout/pages/course-filter-search.scss';

type FilterState = {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enrollmentType?: 'LIFETIME';
  type?: 'group' | 'course'; // Which type to show in full view
};

const CourseFilterSearchMain = () => {
  const { toggleOpen } = useGlobalContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [groupCourses, setGroupCourses] = useState<GroupCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const notification = useNotification();
  const tNotif = useTranslations('notification');
  const t = useTranslations('OnlineCourse');

  // Get search query and type from URL
  const searchQuery = searchParams.get('search') || '';
  const viewType = searchParams.get('type') as 'group' | 'course' | null;
  const isFullView = !!viewType; // True if viewing all of one type

  useEffect(() => {
    setSearchInput(searchQuery);
    setFilters(prev => ({
      ...prev,
      search: searchQuery,
      type: viewType || undefined,
    }));
  }, [searchQuery, viewType]);

  // Fetch courses and group courses based on filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          page: 1,
          pageSize: 50,
          search: filters.search || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          enrollmentType: filters.enrollmentType,
        };

        // Fetch both courses and group courses
        const [coursesRes, groupCoursesRes] = await Promise.all([
          getCourses(params),
          getGroupCourses(params),
        ]);

        setCourses(coursesRes.data || []);
        setGroupCourses(groupCoursesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        const extractErrorMessage = (err: unknown): string | undefined => {
          if (!err) return undefined;
          if (typeof err === 'string') return err;
          if (err instanceof Error) return err.message;
          try {
            return String(err);
          } catch {
            return undefined;
          }
        };
        const errorMsg = extractErrorMessage(error) || 'Failed to fetch courses';
        notification.error({
          message: tNotif ? tNotif('error') : 'Error',
          description: errorMsg,
          placement: 'topRight',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, notification, tNotif]);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/courses-filter-search?search=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  // Handle filter changes
  const handleFilterChange = (updatedFilters: any) => {
    const newFilters: FilterState = { ...filters };

    if (updatedFilters.sortBy) {
      newFilters.sortBy = updatedFilters.sortBy;
    }

    if (updatedFilters.sortOrder) {
      newFilters.sortOrder = updatedFilters.sortOrder;
    }

    if (updatedFilters.enrollmentType) {
      newFilters.enrollmentType = updatedFilters.enrollmentType;
    }

    setFilters(newFilters);
  };

  const totalResults = courses.length + groupCourses.length;

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('courseSearchFilter') || 'Courses Search Filter'} />
      {/* -- course list area start -- */}
      <section className="bd-course-list-area section-space">
        <div className="container">
          <div className="row gy-30 align-items-center justify-content-between mb-30">
            <div className="col-xl-5 col-lg-5 col-md-12 col-12">
              <div className="d-flex-between">
                <div className="bd-top-sorting-left">
                  <h6 className="bd-sorting-item-found">
                    {t('resultsFoundFor', {
                      count: totalResults,
                      query: searchQuery,
                      plural: totalResults !== 1 ? 's' : '',
                    }) || 'We found results'}
                  </h6>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-7 col-md-12 col-12">
              <div className="d-flex-between gap-30">
                <div className="bd-course-filter-search text-center w-100">
                  <form className="bd-course-filter-search-form" onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      name="s"
                      placeholder={t('search') || 'Search'}
                    />
                    <button type="submit">
                      {' '}
                      <i className="far fa-search"></i>{' '}
                    </button>
                  </form>
                </div>
                <div className="bd-filter-btn">
                  <button onClick={toggleOpen} className="bd-btn btn-outline-primary">
                    {t('filter') || 'Filter'}{' '}
                    <span className="right-icon">
                      <i className="fa-regular fa-filter"></i>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <CourseFilter onFilterChange={handleFilterChange} />
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t('loading') || 'Loading...'}</span>
              </div>
            </div>
          ) : (
            <>
              {/* FULL VIEW MODE - Show all items of one type in grid */}
              {isFullView ? (
                <>
                  {viewType === 'group' && groupCourses.length > 0 && (
                    <div>
                      <h4 className="mb-30">{t('programs') || 'Programs'}</h4>
                      <div className="row gy-30">
                        {groupCourses.map(groupCourse => (
                          <div
                            className="col-xl-4 col-lg-6 col-md-6"
                            key={`group-${groupCourse.id}`}
                          >
                            <GroupCourseCard groupCourse={groupCourse} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewType === 'course' && courses.length > 0 && (
                    <div>
                      <h4 className="mb-30">{t('courses') || 'Courses'}</h4>
                      <div className="row gy-30">
                        {courses.map(course => (
                          <div className="col-xl-4 col-lg-6 col-md-6" key={`course-${course.id}`}>
                            <CommonCourseSingleCard course={course} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {((viewType === 'group' && groupCourses.length === 0) ||
                    (viewType === 'course' && courses.length === 0)) && (
                    <div className="col-12">
                      <div className="text-center py-5">
                        <h4>{t('noResultsFound') || 'No results found'}</h4>
                        <p>
                          {t('tryAdjustingSearch') ||
                            "Try adjusting your search or filters to find what you're looking for."}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* CAROUSEL VIEW MODE - Show both types with carousel + view all button */}

                  {/* -- group courses carousel section -- */}
                  {groupCourses.length > 0 && (
                    <div className="mb-60">
                      <div className="d-flex justify-content-between align-items-center mb-40">
                        <h3 className="mb-0">{t('programs') || 'Programs'}</h3>
                        <button
                          className="btn btn-outline-primary btn-lg"
                          style={{ fontSize: 16, fontWeight: 500 }}
                          onClick={() => {
                            router.push(
                              `/courses-filter-search?search=${encodeURIComponent(searchQuery)}&type=group`,
                            );
                          }}
                        >
                          {t('viewAll')} →
                        </button>
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
                    </div>
                  )}

                  {/* -- regular courses carousel section -- */}
                  {courses.length > 0 && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-40">
                        <h3 className="mb-0">{t('courses') || 'Courses'}</h3>
                        <button
                          className="btn btn-outline-primary btn-lg"
                          style={{ fontSize: 16, fontWeight: 500 }}
                          onClick={() => {
                            router.push(
                              `/courses-filter-search?search=${encodeURIComponent(searchQuery)}&type=course`,
                            );
                          }}
                        >
                          {t('viewAll')} →
                        </button>
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
                    </div>
                  )}

                  {/* No results message */}
                  {totalResults === 0 && (
                    <div className="col-12">
                      <div className="text-center py-5">
                        <h4>{t('noResultsFound') || 'No results found'}</h4>
                        <p>
                          {t('tryAdjustingSearch') ||
                            "Try adjusting your search or filters to find what you're looking for."}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
      {/* -- course list area end -- */}
    </>
  );
};

export default CourseFilterSearchMain;
