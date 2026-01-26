import React from 'react';
import Image from 'next/image';
import pertner1 from '../../../public/assets/images/partner/partner-01.webp';
import pertner2 from '../../../public/assets/images/partner/partner-02.webp';
import pertner3 from '../../../public/assets/images/partner/partner-03.webp';
import pertner4 from '../../../public/assets/images/partner/partner-04.webp';
import pertner5 from '../../../public/assets/images/partner/partner-05.webp';
import pertner6 from '../../../public/assets/images/partner/partner-06.webp';
import pertner7 from '../../../public/assets/images/partner/partner-07.webp';
import pertner8 from '../../../public/assets/images/partner/partner-08.webp';
import { useTranslations } from 'next-intl';

const partners = [
  { src: pertner1, alt: 'Partner 1' },
  { src: pertner2, alt: 'Partner 2' },
  { src: pertner3, alt: 'Partner 3' },
  { src: pertner4, alt: 'Partner 4' },
  { src: pertner5, alt: 'Partner 5' },
  { src: pertner6, alt: 'Partner 6' },
  { src: pertner7, alt: 'Partner 7' },
  { src: pertner8, alt: 'Partner 8' },
];

const CoursePartnerArea = () => {
  const t = useTranslations('OnlineCourse');
  return (
    <div className="bd-partner-area section-space primary-bg bd-partner-bg fix">
      <div className="container">
        <div className="row gy-30">
          <div className="col-xl-5 col-lg-5 col-md-12">
            <div className="bd-section-title-wrapper">
              <h2 className="bd-section-title mb-20">{t('partnerTitle')}</h2>
              <p className="bd-section-paragraph">{t('partnerDescription')}</p>
              <p className="bd-section-paragraph">
                <span className="text-primary fs-18 fw-6">9,500</span>+{' '}
                {t('partnerBusinessesStudents')}
              </p>
            </div>
          </div>
          <div className="col-xl-7 col-lg-7 col-md-12">
            <div className="bd-brand-wrapper style-five">
              <div className="bd-brand-box">
                {partners.map((partner, index) => (
                  <div key={index} className="bd-brand-item">
                    <Image
                      style={{ width: 'auto', height: 'auto' }}
                      src={partner.src}
                      alt={partner.alt}
                      priority
                      width={130}
                      height={80}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePartnerArea;
