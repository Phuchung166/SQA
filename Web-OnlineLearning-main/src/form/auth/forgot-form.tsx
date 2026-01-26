'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ErrorMsg from './ErrorMsg';
import { authService } from '@/services/authService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import OTPModal from '@/components/common/otp-modal/OTPModal';

type ForgotFormData = {
  email: string;
};

type ResetPasswordFormData = {
  new_password: string;
  retype_password: string;
};

const ForgotForm = () => {
  const t = useTranslations('auth.forgotPassword');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<ForgotFormData>();
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>();

  const onSubmitEmail = async (data: ForgotFormData) => {
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email: data.email });
      const okMsg = res.message || t('codeSent');
      notification.success({
        message: tNotif('success'),
        description: okMsg,
        placement: 'topRight',
        duration: 3,
      });
      setEmail(data.email);
      setShowOTPModal(true);
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || t('requestFailed');
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

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    try {
      const res = await authService.verifyForgotPassword({ email, code: otp });
      setResetToken(res.resetToken);
      const okMsg = res.message || t('codeVerified');
      notification.success({
        message: tNotif('success'),
        description: okMsg,
        placement: 'topRight',
        duration: 3,
      });
      setShowOTPModal(false);
      setStep('reset');
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || t('verifyFailed');
      notification.error({
        message: tNotif('error'),
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
      throw err; // Re-throw to let OTPModal handle it
    } finally {
      setLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetPasswordFormData) => {
    if (data.new_password !== data.retype_password) {
      notification.error({
        message: tNotif('error'),
        description: t('passwordMismatch'),
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    if (data.new_password.length < 6) {
      notification.error({
        message: tNotif('error'),
        description: t('passwordTooShort'),
        placement: 'topRight',
        duration: 3,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.changePassword({
        email,
        reset_token: resetToken,
        new_password: data.new_password,
        retype_password: data.retype_password,
      });
      const okMsg = res.message || t('passwordChanged');
      notification.success({
        message: tNotif('success'),
        description: okMsg,
        placement: 'topRight',
        duration: 3,
      });

      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || t('changeFailed');
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

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      const okMsg = res.message || t('codeSent');
      notification.success({
        message: tNotif('success'),
        description: okMsg,
        placement: 'topRight',
        duration: 3,
      });
    } catch (err) {
      const e = err as any;
      const errMsg = e?.message || t('requestFailed');
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

  // Step 3: Reset Password
  if (step === 'reset') {
    return (
      <>
        <form onSubmit={handleResetSubmit(onSubmitReset)}>
          {/* New Password Field */}
          <div className="form-input-box" style={{ marginBottom: '20px' }}>
            <div className="form-input-title">
              <label
                htmlFor="newPassword"
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block',
                  color: '#495057',
                }}
              >
                {t('newPasswordLabel')} <span>*</span>
              </label>
            </div>
            <div className="form-input">
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input
                  {...registerReset('new_password', {
                    required: t('passwordRequired'),
                    minLength: {
                      value: 6,
                      message: t('passwordTooShort'),
                    },
                  })}
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t('newPasswordPlaceholder')}
                  autoComplete="new-password"
                  style={{
                    padding: '12px 40px 12px 16px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e0e0e0',
                    width: '100%',
                  }}
                />
                <button
                  type="button"
                  aria-pressed={showNewPassword}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowNewPassword(s => !s)}
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
                  <i className={`fa-regular ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'}`} />
                </button>
              </div>
              <ErrorMsg error={resetErrors.new_password?.message} />
            </div>
          </div>

          {/* Retype Password Field */}
          <div className="form-input-box" style={{ marginBottom: '24px' }}>
            <div className="form-input-title">
              <label
                htmlFor="retypePassword"
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  display: 'block',
                  color: '#495057',
                }}
              >
                {t('retypePasswordLabel')} <span>*</span>
              </label>
            </div>
            <div className="form-input">
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input
                  {...registerReset('retype_password', {
                    required: t('passwordRequired'),
                  })}
                  id="retypePassword"
                  type={showRetypePassword ? 'text' : 'password'}
                  placeholder={t('retypePasswordPlaceholder')}
                  autoComplete="new-password"
                  style={{
                    padding: '12px 40px 12px 16px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e0e0e0',
                    width: '100%',
                  }}
                />
                <button
                  type="button"
                  aria-pressed={showRetypePassword}
                  aria-label={showRetypePassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowRetypePassword(s => !s)}
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
                  <i className={`fa-regular ${showRetypePassword ? 'fa-eye' : 'fa-eye-slash'}`} />
                </button>
              </div>
              <ErrorMsg error={resetErrors.retype_password?.message} />
            </div>
          </div>

          {/* Submit Button */}
          <div className="bd-sign-btn" style={{ marginTop: '28px' }}>
            <button
              className="bd-btn btn-primary w-100"
              type="submit"
              disabled={loading}
              style={{
                padding: '13px 24px',
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
                  {t('changing')}
                </span>
              ) : (
                t('changePassword')
              )}
            </button>
          </div>
        </form>
      </>
    );
  }

  // Step 1: Email
  return (
    <>
      <form onSubmit={handleEmailSubmit(onSubmitEmail)}>
        {/* Email Field */}
        <div className="form-input-box" style={{ marginBottom: '24px' }}>
          <div className="form-input-title">
            <label
              htmlFor="emailAddress"
              style={{
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block',
                color: '#495057',
              }}
            >
              {t('emailLabel')} <span>*</span>
            </label>
          </div>
          <div className="form-input">
            <input
              {...registerEmail('email', {
                required: t('emailRequired'),
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Invalid email format',
                },
              })}
              id="emailAddress"
              type="email"
              placeholder={t('emailPlaceholder')}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                border: '1px solid #e0e0e0',
                width: '100%',
              }}
            />
            <ErrorMsg error={emailErrors.email?.message} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="bd-sign-btn" style={{ marginTop: '28px' }}>
          <button
            className="bd-btn btn-primary w-100"
            type="submit"
            disabled={loading}
            style={{
              padding: '13px 24px',
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
                {t('sending')}
              </span>
            ) : (
              t('sendCode')
            )}
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      <OTPModal
        open={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendCode}
        email={email}
      />
    </>
  );
};

export default ForgotForm;
