'use client';
import ForgotForm from '@/form/auth/forgot-form';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Logo from '../../../../public/assets/images/logo/logo.svg';
import { useTranslations } from 'next-intl';

const ForgotArea = () => {
  const t = useTranslations('forgot.page');
  return (
    <>
      <div className="col-xxl-8 col-xl-7 mt-20">
        <div className="row justify-content-center align-items-center h100p">
          <div className="col-xxl-5 col-xl-6 col-lg-7 col-md-8 col-sm-10 col-12">
            <div
              className="bd-authentication-form-wrapper"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '20px',
                padding: '40px 36px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                minHeight: '520px',
              }}
            >
              {/* Logo Section with Animation */}
              <div
                className="bd-authentication-form-logo text-center"
                style={{
                  marginBottom: '28px',
                  animation: 'fadeInDown 0.6s ease-out',
                }}
              >
                <Link
                  href="/"
                  style={{
                    display: 'inline-block',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Image
                    src={Logo}
                    alt="logo"
                    width={90}
                    height={90}
                    style={{
                      width: 'auto',
                      height: '100%',
                      filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
                    }}
                  />
                </Link>
              </div>

              {/* Title & Subtitle */}
              <div
                className="text-center"
                style={{
                  marginBottom: '32px',
                  animation: 'fadeInUp 0.6s ease-out 0.1s both',
                }}
              >
                <h3
                  className="title"
                  style={{
                    fontSize: '26px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {t('title')}
                </h3>
                <p
                  className="subtitle"
                  style={{
                    color: '#6c757d',
                    fontSize: '13px',
                    fontWeight: '400',
                    margin: '0',
                    lineHeight: '1.5',
                  }}
                >
                  {t('subtitle')}
                </p>
              </div>

              {/* Form Section */}
              <div
                style={{
                  animation: 'fadeInUp 0.6s ease-out 0.2s both',
                }}
              >
                <ForgotForm />
              </div>

              {/* Divider */}
              <div
                className="bd-divider-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: '28px 0',
                  animation: 'fadeInUp 0.6s ease-out 0.3s both',
                }}
              >
                <div
                  className="bd-divider-line"
                  style={{ flex: 1, height: '1px', background: 'rgba(102, 126, 234, 0.2)' }}
                ></div>
                {/* <span
                  className="bd-divider-title"
                  style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('or_remember')}
                </span> */}
                <div
                  className="bd-divider-line"
                  style={{ flex: 1, height: '1px', background: 'rgba(102, 126, 234, 0.2)' }}
                ></div>
              </div>

              {/* Back to Sign In & Sign Up Links */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  animation: 'fadeInUp 0.6s ease-out 0.4s both',
                }}
              >
                <div
                  className="text-center"
                  style={{
                    padding: '12px',
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '10px',
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                  }}
                >
                  <Link
                    href="/sign-in"
                    style={{
                      color: '#667eea',
                      fontWeight: '600',
                      fontSize: '13px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#764ba2';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                  >
                    <i className="fa fa-arrow-left" style={{ fontSize: '11px' }} />
                    {t('backToLogin')}
                  </Link>
                </div>

                <div
                  className="bd-sign-up-label text-center"
                  style={{
                    padding: '12px',
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                  }}
                >
                  <span style={{ color: '#6c757d', fontSize: '13px' }}>{t('no_account')}</span>{' '}
                  <Link
                    href="/sign-up"
                    className="sign-link"
                    style={{
                      color: '#667eea',
                      fontWeight: '600',
                      fontSize: '13px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#764ba2';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#667eea';
                    }}
                  >
                    {t('sign_up_link')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bd-authentication-form-wrapper:hover {
          box-shadow:
            0 24px 72px rgba(0, 0, 0, 0.12),
            0 12px 32px rgba(0, 0, 0, 0.06) !important;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .bd-authentication-form-wrapper {
            padding: 32px 24px !important;
            border-radius: 16px !important;
            min-height: auto !important;
          }
        }

        @media (max-width: 576px) {
          .bd-authentication-form-wrapper {
            padding: 28px 20px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ForgotArea;
