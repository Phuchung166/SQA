'use client';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import { GroupCourse, InstructorResponse } from '@/services/courseService';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import './style.scss';
import CourseCurriculum from './CourseCurriculum';
import Link from 'next/link';
import Image from 'next/image';
import avatarImg from '../../../../public/assets/images/avatar/avatar.webp';
import { formatCurrency } from '@/utils/HelperUtils';
import { checkEnroll, createGroupCourseEnrollment } from '@/services/enrollService';
import { createOrder, checkPrice } from '@/services/orderService';
import { useNotification } from '@/hooks/useMessage';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addGroupCartItem } from '@/redux/slices/cartSlice';
import { selectIsLoggedIn } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';
import { USER_ROLES } from '@/constants';
import { App } from 'antd';

const CourseProgramMain = ({
  initialGroupCourse,
}: {
  initialGroupCourse?: GroupCourse;
  groupCourseId: number;
}) => {
  const t = useTranslations('CourseDetails');
  const tNotification = useTranslations();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const userRoles = useAppSelector((state: RootState) => state.auth.user?.roles);
  const router = useRouter();
  const { modal } = App.useApp();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [_isEnrolled, setIsEnrolled] = useState(false);
  const [_checkingEnrollment, setCheckingEnrollment] = useState(false);
  const notification = useNotification();

  // Check enrollment status when component mounts
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!isLoggedIn || !initialGroupCourse?.id) {
        return;
      }

      const hasStudentOrInstructorRole = userRoles?.some(
        role => role === USER_ROLES.STUDENT || role === USER_ROLES.INSTRUCTOR,
      );

      if (!hasStudentOrInstructorRole) {
        return;
      }

      try {
        setCheckingEnrollment(true);
        const response = await checkEnroll(initialGroupCourse.id, 'GROUP', false);
        setIsEnrolled(response.isEnrolled);
      } catch (error) {
        console.error('Error checking enrollment:', error);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollmentStatus();
  }, [isLoggedIn, userRoles, initialGroupCourse?.id]);

  const handleAddToCart = async () => {
    if (!initialGroupCourse?.id) return;
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      // Dispatch Redux thunk which will handle the API call and show toast notifications
      await dispatch(addGroupCartItem(initialGroupCourse.id)).unwrap();
      // Redux thunk already shows success toast
      console.log('Added group course to cart');
    } catch (err: any) {
      // Redux thunk already shows error toast, so we just log it
      const errorMsg = err?.message || 'Failed to add group course to cart';
      console.error('Error adding to cart:', errorMsg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleEnrollFree = async () => {
    if (!initialGroupCourse?.id) return;

    // Check authentication
    if (!isLoggedIn) {
      notification.error({
        message: t('pleaseLogin') || 'Please log in',
        description: t('loginToEnroll') || 'You need to log in to enroll in this course.',
      });
      router.push('/sign-in');
      return;
    }

    try {
      setIsEnrolling(true);

      // Check if course is free
      if (!initialGroupCourse?.price || initialGroupCourse.price === 0) {
        // Free course - use enrollment API
        await createGroupCourseEnrollment(initialGroupCourse.id);
        notification.success({
          message: tNotification('notification.course.enrollSuccess') || 'Enrolled successfully!',
        });
        router.push(`/student-enrolled-courses`);
      } else {
        // Paid course - check price first to see enrolled courses
        const checkPriceData = {
          total_money: initialGroupCourse.price,
          cart_item_list: [{ course_group_id: initialGroupCourse.id }],
        };

        const priceCheckResponse = await checkPrice(checkPriceData);
        console.log('Price check response:', priceCheckResponse);
        const enrolledCourses = priceCheckResponse.course_enrolled_responses || [];

        if (enrolledCourses.length > 0) {
          // Show modal with enrolled courses
          modal.confirm({
            title: 'Khóa học đã đăng ký',
            okText: 'Tiếp tục đăng ký',
            cancelText: 'Hủy',
            width: 600,
            content: (
              <div>
                <p className="mb-3">
                  Bạn đã đăng ký những khóa học sau, sẽ không bị tính tiền lại:
                </p>
                <div className="enrolled-courses-container">
                  <div className="enrolled-courses-list">
                    {enrolledCourses.map(course => (
                      <div key={course.id} className="enrolled-course-item">
                        {course.image && (
                          <img src={course.image} alt={course.title} className="course-image" />
                        )}
                        <div className="course-info">
                          <p className="course-title">{course.title}</p>
                          <p className="course-price">Giá: {formatCurrency(course.price)} VND</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="total-price-summary">
                  <p className="total-text">
                    <strong>Tổng tiền phải trả:</strong>{' '}
                    {formatCurrency(priceCheckResponse.total_money || initialGroupCourse.price)} VND
                  </p>
                </div>
              </div>
            ),
            onOk: async () => {
              // User confirmed - proceed with order creation
              const orderResponse = await createOrder({
                total_money: priceCheckResponse.total_money || initialGroupCourse.price,
                cart_item_list: checkPriceData.cart_item_list,
              });

              // Redirect to payment URL
              if (orderResponse.payment_response?.payment_url) {
                window.location.href = orderResponse.payment_response.payment_url;
              } else {
                notification.error({
                  message: t('paymentFailed') || 'Payment failed',
                  description: t('paymentUrlNotAvailable') || 'Payment URL not available',
                });
              }
            },
            onCancel: () => {
              // User cancelled
              console.log('User cancelled enrollment');
            },
          });
        } else {
          // No enrolled courses - proceed directly with order
          const orderResponse = await createOrder({
            total_money: initialGroupCourse.price,
            cart_item_list: checkPriceData.cart_item_list,
          });

          // Redirect to payment URL
          if (orderResponse.payment_response?.payment_url) {
            window.location.href = orderResponse.payment_response.payment_url;
          } else {
            notification.error({
              message: t('paymentFailed') || 'Payment failed',
              description: t('paymentUrlNotAvailable') || 'Payment URL not available',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error enrolling/ordering:', error);
      notification.error({
        message:
          !initialGroupCourse?.price || initialGroupCourse.price === 0
            ? tNotification('notification.course.enrollError') || 'Failed to enroll'
            : t('orderFailed') || 'Failed to create order',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const instructorData: InstructorResponse | undefined = useMemo(() => {
    return initialGroupCourse?.list_of_courses?.[0]?.instructor;
  }, [initialGroupCourse]);

  const categoryData: { id: number; name: string } | undefined = useMemo(() => {
    return initialGroupCourse?.list_of_courses?.[0]?.category;
  }, [initialGroupCourse]);

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('breadcrumbProgram')} />
      {/* -- course details area start -- */}
      <section className="bd-course-details-area bd-course-details-top section-space-bottom">
        <div className="container">
          <div className="row gy-30">
            <div className="col-xxl-12 col-xl-12 col-lg-12">
              <div className="bd-course-details-wrapper mb-30">
                <div className="bd-course-details-heading mb-30">
                  <div className="d-flex justify-content-between align-items-start">
                    <h2 className="bd-course-details-title mb--5">{initialGroupCourse?.title}</h2>
                    <button
                      className="btn btn-link text-danger"
                      style={{
                        fontSize: '24px',
                        padding: '0',
                        border: 'none',
                        background: 'none',
                      }}
                      title={t('addToWishlist')}
                    >
                      <i className="fa-light fa-heart"></i>
                    </button>
                  </div>
                </div>
                <div className="bd-course-details-meta mb-30">
                  <div className="bd-course-author border-line-meta">
                    <div className="thumb">
                      <Link href="#">
                        {instructorData?.avatar ? (
                          <Image src={instructorData.avatar} alt="author" width={40} height={40} />
                        ) : (
                          <Image src={avatarImg || ''} alt="author" width={40} height={40} />
                        )}
                      </Link>
                    </div>
                    <div className="authour-meta">
                      <span className="subtitle">{t('createdBy')}</span>
                      <div className="name">
                        <Link href={`/instructor/instructor-details/${instructorData?.slug}`}>
                          {instructorData?.first_name + ' ' + instructorData?.last_name ||
                            'Unknown Instructor'}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="bd-course-details-meta-item border-line-meta">
                    <p className="title">{t('totalEnrolled')}</p>
                    <span className="subtitle">{initialGroupCourse?.total_courses || 0}</span>
                  </div>
                  {/* <div className="bd-course-details-meta-item border-line-meta">
                    <p className="title">{t('publishedAt')}</p>
                    <span className="subtitle">
                      {initialGroupCourse?.published_at
                        ? new Date(initialCourse.published_at).toLocaleDateString('vi-VN')
                        : 'Unknown Date'}
                    </span>
                  </div> */}
                  <div className="bd-course-details-meta-item border-line-meta">
                    <p className="title">{t('category')}</p>
                    <span className="subtitle">
                      <Link href="#">{categoryData?.name || 'General'}</Link>
                    </span>
                  </div>
                  <div className="bd-course-details-meta-item border-line-meta">
                    <p className="title">{t('access')}</p>
                    <span className="subtitle">
                      {t(initialGroupCourse?.enrollment_type || 'LIFETIME')}
                    </span>
                  </div>
                  <div className="bd-course-details-meta-item border-line-meta">
                    <p className="title">{t('price')}</p>
                    <span className="subtitle">
                      {initialGroupCourse?.price
                        ? `${formatCurrency(initialGroupCourse.price)} ${initialGroupCourse.currency}`
                        : 'Free'}
                    </span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="bd-course-sidebar-widget-btn d-flex justify-content-end gap-15 w-100 mb-5">
                  {_checkingEnrollment ? (
                    // Checking enrollment status
                    <div className="text-end py-3">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">{t('checkingEnrollment')}</span>
                      </div>
                      <p className="mt-2 mb-0 text-muted small">{t('checkingEnrollmentStatus')}</p>
                    </div>
                  ) : _isEnrolled ? (
                    // Already enrolled
                    <div className="d-flex flex-column align-items-end">
                      <div className="alert alert-success mb-3" role="alert">
                        <i className="fas fa-check-circle me-2"></i>
                        {t('alreadyEnrolled')}
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/course-program-lesson/${initialGroupCourse?.id}`)
                        }
                        className="bd-btn btn-success"
                      >
                        <span className="left-icon">
                          <i className="fal fa-play-circle"></i>
                        </span>
                        <span>{t('goToMyCourses')}</span>
                      </button>
                    </div>
                  ) : !initialGroupCourse?.price || initialGroupCourse.price === 0 ? (
                    // Free course - only show enroll button
                    <button
                      onClick={handleEnrollFree}
                      className="bd-btn btn-primary"
                      disabled={isEnrolling || !isLoggedIn}
                      title={!isLoggedIn ? t('pleaseLoginToEnroll') || '' : ''}
                      style={{
                        opacity: !isLoggedIn ? 0.5 : 1,
                        cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span className="left-icon">
                        <i className="far fa-user-check"></i>
                      </span>
                      <span>{isEnrolling ? t('enrolling') : t('enrollFree')}</span>
                    </button>
                  ) : (
                    // Paid course - show buy now and add to cart buttons
                    <>
                      <button
                        onClick={handleEnrollFree}
                        className="bd-btn btn-primary"
                        disabled={isEnrolling || !isLoggedIn}
                        title={!isLoggedIn ? t('pleaseLoginToBuy') || '' : ''}
                        style={{
                          opacity: !isLoggedIn ? 0.5 : 1,
                          cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                          minWidth: '180px',
                        }}
                      >
                        <span className="left-icon">
                          <i className="far fa-credit-card"></i>
                        </span>
                        <span>{isEnrolling ? t('processing') : t('buyNow')}</span>
                      </button>
                      <button
                        onClick={handleAddToCart}
                        className="bd-btn btn-outline-primary"
                        disabled={isAddingToCart || !isLoggedIn}
                        title={!isLoggedIn ? t('pleaseLoginToAddCart') || '' : ''}
                        style={{
                          opacity: !isLoggedIn ? 0.5 : 1,
                          cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <span className="left-icon">
                          <i className={'fal fa-shopping-cart'}></i>
                        </span>
                        <span>{isAddingToCart ? t('loading') : t('addToCart')}</span>
                      </button>
                    </>
                  )}
                </div>
                <div className="bd-course-details-content mb-30">
                  <h3 className="bd-course-details-content-title">{t('description')}</h3>
                  <div
                    className="description"
                    dangerouslySetInnerHTML={{ __html: initialGroupCourse?.description || '' }}
                  ></div>
                </div>
                <div className="bd-course-details-content mb-30">
                  <h3 className="bd-course-details-content-title">{t('whatYoullLearn')}</h3>
                  <div
                    className="description"
                    dangerouslySetInnerHTML={{ __html: initialGroupCourse?.whatYouLearn || '' }}
                  ></div>
                </div>
                {/* Show curriculum */}
                <CourseCurriculum course={initialGroupCourse!} loading={false} />
                {/* {initialCourse?.instructor ? (
                  <DetailsInstructor instructor={initialCourse.instructor} />
                ) : null} */}
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4">
              {/* <CourseSidebarWidget course={initialGroupCourse!} loading={false} /> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CourseProgramMain;
