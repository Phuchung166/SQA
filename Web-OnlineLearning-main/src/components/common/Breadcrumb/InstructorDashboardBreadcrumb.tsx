'use client';
import React, { useEffect, useState } from 'react';
import rangBadge from '../../../../public/assets/images/shape/rank-badge.webp';
import avatarImg from '../../../../public/assets/images/avatar/avatar2.webp';
import profileBg from '../../../../public/assets/images/bg/profile-bg.webp';

import Image from 'next/image';
import Link from 'next/link';
import { userService, InstructorDetailProfile } from '@/services/userService';
import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

const InstructorDashboardBreadcrumb = () => {
  const [profile, setProfile] = useState<InstructorDetailProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('instructorDashboard.breadcrumb');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getInstructorProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch instructor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bd-dashboard-breadcrumb section-space-small-top">
        <div className="container custom-container">
          <div className="row">
            <div className="col-xl-12">
              <div className="bd-dashboard-breadcrumb-wrapper p-relative text-center">
                <Spin size="large" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'Instructor';
  const avatarUrl = profile?.avatar || avatarImg.src;

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
                  style={{ backgroundImage: `url(${profileBg.src})` }}
                ></div>
                <div className="bd-dashboard-profile">
                  <div className="bd-dashboard-profile-user">
                    <div className="thumb">
                      <Image
                        src={avatarUrl}
                        alt={fullName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        width={100}
                        height={100}
                      />
                    </div>
                    <div className="content">
                      <h3 className="name">{fullName}</h3>
                      <span className="designation d-block">
                        {profile?.expertise || 'Instructor'}
                      </span>
                    </div>
                  </div>
                  <div className="bd-dashboard-profile-group">
                    <div className="bd-dashboard-profile-btn">
                      <Link
                        href="/create-group-course"
                        className="bd-btn btn-secondary-white btn-create-course"
                      >
                        {t('createNewGroupCourse')}
                      </Link>
                    </div>
                    <div className="bd-dashboard-profile-btn">
                      <Link
                        href="/create-course"
                        className="bd-btn btn-secondary-white btn-create-course"
                      >
                        {t('createNewCourse')}
                      </Link>
                    </div>
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

export default InstructorDashboardBreadcrumb;
