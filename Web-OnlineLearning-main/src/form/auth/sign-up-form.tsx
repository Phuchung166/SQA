'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ErrorMsg from './ErrorMsg';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OTPModal from '@/components/common/otp-modal/OTPModal';

type SignUpFormData = {
  account_name: string;
  email: string;
  password: string;
};

import { authService } from '@/services/authService';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/hooks/useMessage';
import { REGISTER_USER_ROLES } from '@/constants/UserConstants';

const SignUpForm = () => {
  const t = useTranslations('sign_up.form');
  const tNotif = useTranslations('notification');
  const router = useRouter();
  const notification = useNotification();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    try {
      const res = await authService.register({
        account_name: data.account_name,
        email: data.email,
        password: data.password,
        role: REGISTER_USER_ROLES.STUDENT,
      });
      const okMsg = res.message || tNotif('auth.signupSuccess');
      notification.success({
        message: tNotif('success'),
        description: okMsg,
        placement: 'topRight',
        duration: 3,
      });

      // Save email and open OTP modal instead of redirecting
      setUserEmail(data.email);
      setOtpModalOpen(true);
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || tNotif('auth.signupError');
      notification.error({
        message: tNotif('error'),
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    try {
      const res = await authService.verifyEmail({
        code: otp,
        email: userEmail,
      });
      notification.success({
        message: tNotif('success'),
        description: res.message || tNotif('auth.otpVerified'),
        placement: 'topRight',
        duration: 3,
      });
      setOtpModalOpen(false);

      // Redirect after successful verification
      setTimeout(() => {
        router.push('/sign-in');
      }, 1000);
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || tNotif('auth.otpVerifyFailed');
      notification.error({
        message: tNotif('error'),
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await authService.resendOtp({ email: userEmail });
      notification.success({
        message: tNotif('success'),
        description: res.message || tNotif('auth.otpResent'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || tNotif('auth.otpResendFailed');
      notification.error({
        message: tNotif('error'),
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Account Name Field */}
        <div className="form-input-box" style={{ marginBottom: '16px' }}>
          <div className="form-input-title">
            <label
              htmlFor="account_name"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              {t('account')} <span>*</span>
            </label>
          </div>
          <div className="form-input">
            <input
              {...register('account_name', {
                required: t('account_required'),
                minLength: { value: 3, message: t('account_min_length') },
              })}
              id="account_name"
              type="text"
              placeholder={t('account')}
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
            />
            <ErrorMsg error={errors.account_name?.message} />
          </div>
        </div>

        {/* Email Field */}
        <div className="form-input-box" style={{ marginBottom: '16px' }}>
          <div className="form-input-title">
            <label
              htmlFor="emailAddress"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              {t('email')} <span>*</span>
            </label>
          </div>
          <div className="form-input">
            <input
              {...register('email', {
                required: t('email_required'),
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: t('email_invalid'),
                },
              })}
              id="emailAddress"
              type="email"
              placeholder={t('email')}
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
            />
            <ErrorMsg error={errors.email?.message} />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-input-box" style={{ marginBottom: '16px' }}>
          <div className="form-input-title">
            <label
              htmlFor="password"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px',
                display: 'block',
              }}
            >
              {t('password')} <span>*</span>
            </label>
          </div>
          <div className="form-input">
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                {...register('password', {
                  required: t('password_required'),
                  minLength: { value: 6, message: t('password_min_length') },
                })}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                autoComplete="true"
                style={{
                  paddingRight: '40px',
                  padding: '10px 40px 10px 14px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(s => !s)}
                className="password-toggle"
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: 6,
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#6c757d',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#667eea')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} />
              </button>
            </div>
            <ErrorMsg error={errors.password?.message} />
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div
          className="d-flex-between flex-wrap"
          style={{
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          {/* <div className="checkout-option">
            <input id="rememberMe" type="checkbox" />
            <label
              htmlFor="rememberMe"
              style={{
                fontSize: '13px',
                marginBottom: '0',
              }}
            >
              {t('remember_me')}
            </label>
          </div> */}
          <div className="sign-forgot underline">
            <Link
              href="/forgot"
              className="sign-link"
              style={{
                fontSize: '13px',
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease',
              }}
            >
              {t('forgot_password')}
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bd-sign-btn">
          <button
            type="submit"
            className="bd-btn btn-primary w-100"
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa fa-spinner fa-spin" />
                {t('loading')}
              </span>
            ) : (
              t('submit')
            )}
          </button>
        </div>
      </form>

      <OTPModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        email={userEmail}
      />
    </>
  );
};

export default SignUpForm;
