'use client';

import { CourseFooterMenuLinks } from '@/data/footer-menu/footer-menu-data';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import logoSvg from '../../../public/assets/images/logo/logo.png';
import { getCurrentYear } from '@/utils/dateUtils';
import { useTranslations } from 'next-intl';

const MainFooter = () => {
  const t = useTranslations('Footer');

  return (
    <>
      {/* -- footer area start -- */}
      <footer>
        <div className="bd-footer-area style-two has-footer-space theme-black fix">
          <div className="container">
            <div className="row gy-30 justify-content-between">
              {/* Footer Logo and Social Icons */}
              <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-12">
                <div className="bd-footer-widget footer-2-col-1">
                  <div className="bd-footer-widget-logo">
                    <Link href="/">
                      <Image src={logoSvg} priority alt="logo" />
                    </Link>
                  </div>
                  <div className="bd-footer-widget-content">
                    <p className="bd-footer-widget-description">{t('description')}</p>
                    <div className="bd-footer-social">
                      <div className="theme-social has-white">
                        <ul className="social-icon-list">
                          <li>
                            <Link href="https://www.facebook.com/ngotrung.tuyen.9" target="_blank">
                              <i className="fa-brands fa-facebook-f"></i>
                            </Link>
                          </li>
                          <li>
                            <Link href="https://x.com/tuyenshrimp" target="_blank">
                              <i className="fa-brands fa-x-twitter"></i>
                            </Link>
                          </li>
                          <li>
                            <Link href="https://www.linkedin.com/feed/" target="_blank">
                              <i className="fa-brands fa-linkedin-in"></i>
                            </Link>
                          </li>
                          <li>
                            <Link href="https://www.instagram.com/" target="_blank">
                              <i className="fa-brands fa-instagram"></i>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loop through footer sections */}
              {CourseFooterMenuLinks.map((footerLink, index) => (
                <div key={index} className="col-xxl-2 col-xl-2 col-lg-2 col-md-3 col-sm-4">
                  <div className={`bd-footer-widget ${footerLink.spacingClass}`}>
                    <h6 className="bd-footer-widget-title">{footerLink.title}</h6>
                    <div className="bd-footer-widget-links">
                      <ul>
                        {footerLink.links.map((link, linkIndex) => (
                          <li key={linkIndex} className="underline-two">
                            <Link href={link.href}>{link.name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {/* Newsletter Section */}
              <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-8 col-sm-12">
                <div className="bd-footer-widget footer-2-col-5">
                  <h6 className="bd-footer-widget-title">{t('newsletter_title')}</h6>
                  <div className="bd-footer-from-content">
                    <div className="bd-footer-widget-subscribe">
                      <p className="bd-footer-widget-description">{t('newsletter_description')}</p>
                      <form action="#">
                        <div className="bd-footer-subscribe-form style-two">
                          <input type="email" placeholder={t('email_placeholder')} />
                          <button className="bd-btn btn-primary h-40px" type="submit">
                            {t('subscribe_button')}
                          </button>
                        </div>
                      </form>
                      <div className="checkout-agree">
                        <div className="checkout-option">
                          <input id="read_all" type="checkbox" />
                          <label htmlFor="read_all">{t('agree_checkbox')}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright Section */}
        <div className="bd-footer-copyright-area style-two theme-bg fix ">
          <div className="container">
            <div className="row justify-content-between">
              <div className="col-xl-12">
                <div className="bd-footer-copyright-text text-center">
                  <p className="underline-two">
                    {t('copyright')} <span>{getCurrentYear()}</span> | {t('developed_by')} Online
                    Learning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* -- footer area end -- */}
    </>
  );
};

export default MainFooter;
