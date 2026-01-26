'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { useTranslations } from 'next-intl';
import './../../../../public/assets/scss/components/_otpmodal.scss';
import logo from './../../../../public/assets/images/logo/logo_miniv2.png';
import { OTP_TIMEOUT_SECONDS } from '@/constants/HelperConstants';
import Image from 'next/image';

interface OTPModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  onResend?: () => void;
  phoneNumber?: string;
  email?: string;
}

const Title = ({ title }: { title: string }) => (
  <div className="otp-modal-title">
    <Image src={logo.src} alt="otp-logo" className="otp-title-logo" width={100} height={100} />
    <h2>{title}</h2>
  </div>
);

const OTPModal: React.FC<OTPModalProps> = ({
  open,
  onClose,
  onVerify,
  onResend,
  phoneNumber,
  email,
}) => {
  const t = useTranslations('common');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(OTP_TIMEOUT_SECONDS);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [open, countdown]);

  const handleResend = () => {
    if (canResend) {
      setCountdown(OTP_TIMEOUT_SECONDS);
      setCanResend(false);
      setOtp('');
      if (onResend) {
        onResend();
      }
      message.success(t ? t('otpResent') : 'OTP has been resent');
    }
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerify(otp);
    } else {
      message.error(t ? t('otpInvalid') : 'Please enter a valid 6-digit OTP');
    }
  };

  const handleClose = () => {
    setOtp('');
    setCountdown(OTP_TIMEOUT_SECONDS);
    setCanResend(false);
    onClose();
  };

  return (
    <Modal
      title={<Title title={t ? t('otpVerification') : 'OTP Verification'} />}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnHidden
      className="otp-modal"
    >
      <div className="otp-modal-content">
        <p className="mb-20">
          {t ? t('otpSentTo') : 'We have sent a verification code to'}{' '}
          <strong>{phoneNumber || email}</strong>
        </p>

        <div className="mb-20 otp-modal-content-input">
          <Input.OTP
            className="container"
            length={6}
            value={otp}
            onChange={value => setOtp(value)}
            size="large"
          />
        </div>

        <div className="mb-20 text-center">
          {countdown > 0 ? (
            <span className="text-muted">
              {t ? t('resendIn') : 'Resend OTP in'} <strong>{countdown}s</strong>
            </span>
          ) : (
            <Button type="link" onClick={handleResend} disabled={!canResend}>
              {t ? t('resendOtp') : 'Resend OTP'}
            </Button>
          )}
        </div>

        <div className="d-flex gap-10 otp-modal-content-actions">
          <Button onClick={handleClose} block>
            {t ? t('cancel') : 'Cancel'}
          </Button>
          <Button type="primary" onClick={handleVerify} block disabled={otp.length !== 6}>
            {t ? t('verify') : 'Verify'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OTPModal;
