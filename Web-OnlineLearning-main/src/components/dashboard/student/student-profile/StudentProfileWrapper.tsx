'use client';
import { useState, useEffect, useCallback } from 'react';
import StudentProfileMain from './StudentProfileMain';
import StudentDashboardLayout from '@/layout/StudentDashboardLayout';
import { userService, UserProfile } from '@/services/userService';
import { Spin } from 'antd';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';

const StudentProfileWrapper = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error: unknown) {
      const errMsg = extractErrorMessage(error) || 'Failed to load profile';
      notification.error({
        message: tNotif ? tNotif('error') : 'Error',
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }, [notification, tNotif]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    // Also update localStorage if needed
    localStorage.setItem('user', JSON.stringify(updatedProfile));
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <StudentDashboardLayout profile={profile}>
      <StudentProfileMain profile={profile} onProfileUpdate={handleProfileUpdate} />
    </StudentDashboardLayout>
  );
};

export default StudentProfileWrapper;
