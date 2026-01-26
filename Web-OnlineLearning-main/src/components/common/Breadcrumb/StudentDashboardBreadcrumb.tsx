'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import avaterImg from '../../../../public/assets/images/avatar/avatar7.webp';
import profileBgImg from '../../../../public/assets/images/bg/profile-bg.webp';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, userService } from '@/services/userService';
import { USER_ROLES } from '@/constants/UserConstants';
import { useNotification } from '@/hooks/useMessage';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { logout, selectUser } from '@/redux/slices/authSlice';
import { useAppDispatch } from '@/redux/hooks';

interface StudentDashboardBreadcrumbProps {
  profile?: UserProfile | null;
  onProfileUpdate?: () => void;
}

const StudentDashboardBreadcrumb: React.FC<StudentDashboardBreadcrumbProps> = ({
  profile,
  onProfileUpdate,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const notification = useNotification();
  const t = useTranslations('student_dashboard');
  const tNotif = useTranslations('notification');
  const [loading, setLoading] = useState(false);

  // Get user from Redux to ensure avatar updates are reflected
  const reduxUser = useSelector(selectUser);
  const displayProfile = reduxUser || profile;

  const getDisplayName = () => {
    if (!displayProfile) return t('breadcrumb.student');
    if (displayProfile.first_name && displayProfile.last_name) {
      return `${displayProfile.first_name} ${displayProfile.last_name}`;
    }
    if (displayProfile.first_name) return displayProfile.first_name;
    return displayProfile.account_name;
  };

  const getAvatarSrc = () => {
    if (displayProfile?.avatar) {
      return displayProfile.avatar;
    }
    return avaterImg;
  };

  const isInstructor = displayProfile?.roles?.includes(USER_ROLES.INSTRUCTOR);

  const handleBecomeInstructor = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const result = await userService.becomeToInstructor();

      // Show success message from API
      notification.success({
        message: tNotif ? tNotif('success') : 'Success',
        description: result.message || 'Successfully became instructor! Please login again.',
        placement: 'topRight',
        duration: 3,
      });

      // Logout user - clear localStorage and Redux
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart_fetched_for_session');

        // Clear Redux state
        dispatch(logout());

        // Redirect to sign-in page
        router.push('/sign-in');
      }, 1500);
    } catch (error: any) {
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

      const errMsg =
        extractErrorMessage(error) || t('notifications.becomeInstructor.failedMessage');
      notification.error({
        message: t('notifications.becomeInstructor.error'),
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* -- dashboard breadcrumb start -- */}
      <div className="bd-dashboard-breadcrumb section-space-small-top">
        <div className="container custom-container">
          <div className="row">
            <div className="col-xl-12">
              <div className="bd-dashboard-breadcrumb-wrapper p-relative">
                <div
                  className="bd-dashboard-breadcrumb-bg image-bg"
                  style={{ backgroundImage: `url(${profileBgImg.src})` }}
                ></div>
                <div className="bd-dashboard-profile">
                  <div className="bd-dashboard-profile-user">
                    <div className="thumb">
                      <Image
                        src={getAvatarSrc() || ''}
                        alt={getDisplayName() || ''}
                        width={100}
                        height={100}
                      />
                    </div>
                    <div className="content">
                      <h3 className="name">{getDisplayName()}</h3>
                      <span className="designation d-block">
                        {displayProfile?.bio || t('breadcrumb.student')}
                      </span>
                    </div>
                  </div>
                  <div className="bd-dashboard-profile-btn">
                    {!isInstructor ? (
                      <button
                        onClick={handleBecomeInstructor}
                        disabled={loading}
                        className="bd-btn btn-secondary-white"
                        style={{
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {loading ? t('breadcrumb.processing') : t('breadcrumb.becomeInstructor')}
                      </button>
                    ) : (
                      <Link href="/instructor-profile" className="bd-btn btn-secondary-white">
                        {t('breadcrumb.goToInstructorDashboard')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* -- dashboard breadcrumb end -- */}
    </>
  );
};

export default StudentDashboardBreadcrumb;
