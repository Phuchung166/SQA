'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ErrorMsg from './ErrorMsg';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';

type SignInFormData = {
  email: string;
  password: string;
};

const SignInForm = () => {
  const t = useTranslations('sign_in.form');
  const tNotif = useTranslations('notification');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notification = useNotification();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    try {
      // Step 1: Login to get token and roles
      const res = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Step 2: Save token to localStorage for axios interceptor
      localStorage.setItem('token', res.token);

      // Step 3: Get user info based on role
      const isInstructor = res.roles.includes('ROLE_INSTRUCTOR');
      let userData: any;

      if (isInstructor) {
        const instructorProfile = await userService.getInstructorProfile();
        userData = {
          email: instructorProfile.email,
          phone: instructorProfile.phone,
          first_name: instructorProfile.first_name,
          last_name: instructorProfile.last_name,
          avatar: instructorProfile.avatar,
          bio: instructorProfile.bio,
          account_name: instructorProfile.email, // Use email as account_name for instructor
          gender: '',
          date_of_birth: '',
        };
      } else {
        userData = await authService.getCurrentUser();
      }

      // Step 4: Dispatch to Redux store (Redux Persist will automatically save to localStorage)
      dispatch(
        setAuth({
          token: res.token,
          user: {
            ...userData,
            roles: res.roles, // Add roles from login response
          },
        }),
      );

      notification.success({
        message: tNotif('success'),
        description: tNotif('auth.loginSuccess'),
        placement: 'topRight',
        duration: 3,
      });

      // Step 5: Redirect based on role
      setTimeout(() => {
        router.push(isInstructor ? '/instructor-profile' : '/');
      }, 1500);
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || tNotif('auth.loginError');
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              placeholder={t('email_placeholder')}
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
                placeholder={t('password_placeholder')}
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
          <div className="checkout-option">
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
          </div>
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
    </>
  );
};

export default SignInForm;
