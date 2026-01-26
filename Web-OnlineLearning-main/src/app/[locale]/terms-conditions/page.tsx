'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export default function TermsConditionsPage() {
  const t = useTranslations('TermsConditions');
  const locale = useLocale();

  return (
    <ClientWrapper>
      <>
        <Breadcrumbs breadcrumbTitle={t('title')} />
        <main className="container py-5">
          <h1 className="display-4 fw-bold mb-5">{t('title')}</h1>

          <section style={{ maxWidth: '900px' }}>
            <div className="mb-5">
              <h2 className="display-6 fw-bold mb-3">{t('effective_date_label')}</h2>
              <p className="lh-lg">{t('effective_date_value')}</p>
            </div>

            <div className="mb-5">
              <h2 className="display-6 fw-bold mb-3">{t('welcome_title')}</h2>
              <p className="lh-lg">{t('welcome_text')}</p>
            </div>

            <div className="mb-5">
              <h2 className="display-6 fw-bold mb-3">{t('agreement_title')}</h2>
              <p className="lh-lg">{t('agreement_text')}</p>
            </div>

            <div className="mb-5">
              <h3 className="h4 fw-bold mb-3">1. {t('use_title')}</h3>
              <p className="lh-lg">{t('use_text')}</p>
            </div>

            <div className="mb-5">
              <h3 className="h4 fw-bold mb-3">2. {t('content_ownership_title')}</h3>
              <p className="lh-lg">{t('content_ownership_text')}</p>
            </div>

            <div className="mb-5">
              <h3 className="h4 fw-bold mb-3">3. {t('user_accounts_title')}</h3>
              <p className="lh-lg">{t('user_accounts_text')}</p>
            </div>

            <div className="mb-5">
              <h3 className="h4 fw-bold mb-3">4. {t('limitation_title')}</h3>
              <p className="lh-lg">{t('limitation_text')}</p>
            </div>

            <div className="mb-5">
              <h3 className="h4 fw-bold mb-3">5. {t('external_links_title')}</h3>
              <p className="lh-lg">{t('external_links_text')}</p>
            </div>

            <div className="mb-5">
              <h3 className="h4 fw-bold mb-3">6. {t('modification_title')}</h3>
              <p className="lh-lg">{t('modification_text')}</p>
            </div>

            <div className="border-top pt-5 mt-5">
              <h2 className="display-6 fw-bold mb-3">{t('contact_us_title')}</h2>
              <p className="lh-lg mb-3">{t('contact_us_text')}</p>
              <ul className="list-unstyled ps-3">
                <li className="mb-3">
                  <span className="fw-semibold">{t('email_label')}</span>{' '}
                  <Link
                    href="mailto:md.ntt080703@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-primary text-decoration-none"
                  >
                    ntt080703@gmail.com
                  </Link>
                </li>
              </ul>
              <p className="mt-3 lh-lg">
                <Link
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-primary text-decoration-none"
                >
                  {t('location')}
                </Link>
              </p>
            </div>
          </section>
        </main>
      </>
    </ClientWrapper>
  );
}
