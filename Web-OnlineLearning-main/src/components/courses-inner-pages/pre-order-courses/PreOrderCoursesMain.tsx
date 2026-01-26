'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PreOrderCardV1 from '@/components/common/course-card/PreOrderCardV1';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import { getPreOrderCourses, PreOrderCourse } from '@/services/courseService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { Select, Pagination } from 'antd';

const { Option } = Select;

type FilterState = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
};

const PreOrderCoursesMain = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<PreOrderCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    pageSize: 12,
    sortBy: 'preOrderEndDate',
    sortOrder: 'asc',
  });
  const [totalElements, setTotalElements] = useState(0);
  const notification = useNotification();
  const tNotif = useTranslations('notification');
  const t = useTranslations('OnlineCourse');

  // Fetch pre-order courses
  useEffect(() => {
    const fetchPreOrderCourses = async () => {
      try {
        setLoading(true);
        const response = await getPreOrderCourses({
          page: filters.page,
          pageSize: filters.pageSize,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });

        setCourses(response.data || []);
        setTotalElements(response.total_elements);
      } catch (error) {
        console.error('Error fetching pre-order courses:', error);
        const extractErrorMessage = (err: unknown): string | undefined => {
          if (!err) return undefined;
          if (typeof err === 'string') return err;
          if (typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
            return err.message;
          }
          return undefined;
        };

        notification.error({
          message: tNotif('failed'),
          description: extractErrorMessage(error) || tNotif('somethingWentWrong'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreOrderCourses();
  }, [filters, notification, tNotif]);

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: 1,
    }));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      pageSize,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('preOrderCourses') || 'Pre-Order Courses'} />

      <section className="bd-course-area section-space">
        <div className="container">
          {/* Header with filter controls */}
          <div className="row mb-40">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h3 className="mb-2">
                    🔥 {t('hotDeal')} - {t('preOrderCourses')}
                  </h3>
                  <p className="text-muted mb-0">{t('foundResults', { count: totalElements })}</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">{t('sortBy')}:</span>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={handleSortChange}
                    style={{ width: 200 }}
                  >
                    <Option value="preOrderEndDate-asc">{t('endingSoon') || 'Ending Soon'}</Option>
                    <Option value="preOrderPrice-asc">
                      {t('priceLowToHigh') || 'Price: Low to High'}
                    </Option>
                    <Option value="preOrderPrice-desc">
                      {t('priceHighToLow') || 'Price: High to Low'}
                    </Option>
                    <Option value="title-asc">{t('titleAZ') || 'Title: A-Z'}</Option>
                    <Option value="title-desc">{t('titleZA') || 'Title: Z-A'}</Option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="row">
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">{t('loading')}...</p>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <>
              <div className="row">
                {courses.map(course => (
                  <PreOrderCardV1 key={course.id} course={course} noColWrapper={false} />
                ))}
              </div>

              {/* Pagination */}
              {totalElements > filters.pageSize && (
                <div className="row mt-40">
                  <div className="col-12">
                    <div className="d-flex justify-content-center">
                      <Pagination
                        current={filters.page}
                        pageSize={filters.pageSize}
                        total={totalElements}
                        onChange={handlePageChange}
                        showSizeChanger
                        pageSizeOptions={['6', '12', '24', '48']}
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} ${t('of')} ${total} ${t('courses')}`
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="row">
              <div className="col-12 text-center py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">{t('noPreOrderCourses')}</h4>
                <p className="text-muted">
                  {t('noPreOrderCoursesDescription') || 'Check back later for new deals!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PreOrderCoursesMain;
