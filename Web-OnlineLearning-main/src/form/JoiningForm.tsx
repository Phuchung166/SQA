'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import successfullyImg from '../../public/assets/images/joining/successfully.webp';
import { Form, Input, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import OTPModal from '@/components/common/otp-modal/OTPModal';
import { authService } from '@/services/authService';
import { REGISTER_USER_ROLES } from '@/constants/UserConstants';
import { useNotification } from '@/hooks/useMessage';

type Props = {
  activeStep: 'formStepOne' | 'formStepTwo';
  setActiveStep?: (s: 'formStepOne' | 'formStepTwo') => void;
};

const JoiningForm: React.FC<Props> = ({ activeStep, setActiveStep }) => {
  const t = useTranslations();
  const tNotif = useTranslations('notification');
  const router = useRouter();
  const notification = useNotification();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await authService.register({
        account_name: values.username,
        email: values.email,
        password: values.password,
        role: REGISTER_USER_ROLES.INSTRUCTOR,
      });

      notification.success({
        message: tNotif('success'),
        description: res.message || tNotif('auth.becomeInstructorSuccess'),
        placement: 'topRight',
        duration: 3,
      });

      // Save email and open OTP modal
      setUserEmail(values.email);
      setOtpModalOpen(true);
    } catch (err: any) {
      const errMsg = err?.message || tNotif('auth.becomeInstructorError');
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

      // Show success step
      setActiveStep && setActiveStep('formStepTwo');
    } catch (err: any) {
      const errMsg = err?.message || tNotif('auth.otpVerifyFailed');
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
    } catch (err: any) {
      const errMsg = err?.message || tNotif('auth.otpResendFailed');
      notification.error({
        message: tNotif('error'),
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  return (
    <div className="bd-form-area">
      <Form form={form} layout="vertical" onFinish={onFinish} className="bd-form-setup">
        {/* Step One - Registration Form */}
        {activeStep === 'formStepOne' && (
          <div className={`bd-form-step-content active`} id="formStepOne">
            <div className="row">
              <div className="col-lg-12">
                <Form.Item
                  name="username"
                  label={t('instructors_joining_form.username')}
                  rules={[
                    {
                      required: true,
                      message: t('instructors_joining_form.username') + ' is required',
                    },
                    {
                      min: 3,
                      message: 'Username must be at least 3 characters',
                    },
                  ]}
                >
                  <Input placeholder="Enter your username" />
                </Form.Item>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <Form.Item
                  name="email"
                  label={t('instructors_joining_form.email')}
                  rules={[
                    {
                      required: true,
                      type: 'email',
                      message: 'Please enter a valid email address',
                    },
                  ]}
                >
                  <Input placeholder="Enter your email" />
                </Form.Item>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6">
                <Form.Item
                  name="password"
                  label={t('instructors_joining_form.password')}
                  rules={[
                    {
                      required: true,
                      message: 'Password is required',
                    },
                    {
                      min: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter your password" />
                </Form.Item>
              </div>
              <div className="col-lg-6">
                <Form.Item
                  name="confirmPassword"
                  label={t('instructors_joining_form.confirmPassword')}
                  dependencies={['password']}
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password',
                    },
                    ({ getFieldValue }) => ({
                      validator(_: any, value: any) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm your password" />
                </Form.Item>
              </div>
            </div>

            <div className="bd-form-action mt-20">
              <Button
                type="primary"
                className="bd-btn bd-btn-md w-100"
                htmlType="submit"
                loading={loading}
              >
                {loading ? 'Registering...' : t('instructors_joining_form.register') || 'Register'}
              </Button>
            </div>
          </div>
        )}

        {/* Step Two - Success */}
        {activeStep === 'formStepTwo' && (
          <div className="row bd-form-setup-content justify-content-center" id="formStepTwo">
            <div className="col-md-8">
              <div className="text-center">
                <div className="successfully-thumb mb-20">
                  <Image src={successfullyImg} alt="image" />
                </div>
                <h3 className="mb-15">{t('instructors_joining_form.successTitle')}</h3>
                <p>{t('instructors_joining_form.successDesc')}</p>
                <div className="mt-30">
                  <Button
                    type="primary"
                    className="bd-btn bd-btn-md"
                    onClick={() => router.push('/sign-in')}
                  >
                    {t('instructors_joining_form.goToLogin') || 'Go to Login'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Form>

      <OTPModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        email={userEmail}
      />
    </div>
  );
};

export default JoiningForm;
