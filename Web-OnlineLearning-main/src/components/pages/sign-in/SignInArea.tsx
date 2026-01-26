'use client';
import SignInForm from '@/form/auth/sign-in-form';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Logo from '../../../../public/assets/images/logo/logo.svg';
import { useTranslations } from 'next-intl';

const SignInArea = () => {
  const t = useTranslations('sign_in.page');
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
                padding: '36px 32px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Logo Section with Animation */}
              <div
                className="bd-authentication-form-logo text-center"
                style={{
                  marginBottom: '24px',
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
                    width={100}
                    height={100}
                    style={{
                      width: 'auto',
                      height: '100%',
                      filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
                    }}
                  />
                </Link>
              </div>

              {/* Welcome Text */}
              <div
                className="text-center"
                style={{
                  marginBottom: '28px',
                  animation: 'fadeInUp 0.6s ease-out 0.1s both',
                }}
              >
                <h3
                  className="title"
                  style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {t('title')}
                </h3>
              </div>

              {/* Form Section */}
              <div
                style={{
                  animation: 'fadeInUp 0.6s ease-out 0.2s both',
                }}
              >
                <SignInForm />
              </div>

              {/* Divider - Hidden for cleaner look */}
              <div className="bd-divider-wrapper" style={{ display: 'none' }}>
                <div className="bd-divider-line left-line"></div>
                <div className="bd-divider-line"></div>
              </div>

              {/* Sign Up Link */}
              <div
                className="bd-sign-up-label text-center"
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  animation: 'fadeInUp 0.6s ease-out 0.3s both',
                }}
              >
                <span style={{ color: '#6c757d', fontSize: '14px' }}>{t('no_account')}</span>{' '}
                <Link
                  href="/sign-up"
                  className="sign-link"
                  style={{
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '14px',
                    textDecoration: 'none',
                    position: 'relative',
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
            padding: 28px 20px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default SignInArea;
