import Link from 'next/link';
import React from 'react';
import careerCtaThumb from '../../../public/assets/images/cta/career-cta-thumb-01.webp';
import careerCtaBg from '../../../public/assets/images/cta/career-cta-bg-01.webp';
import careerCtaBg2 from '../../../public/assets/images/cta/career-cta-bg-02.webp';
import careerCtaThumb2 from '../../../public/assets/images/cta/career-cta-thumb-02.webp';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Data array for mapping
const getCareerData = (t: any) => [
  {
    id: 1,
    bgImage: careerCtaBg,
    thumbImage: careerCtaThumb,
    subtitle: t('careerStartSubtitle'),
    subtitleClass: 'text-secondary',
    title: t('careerStartTitle'),
    link: '/become-instructor',
    btnClass: 'btn-secondary',
    btnText: t('careerStartBtn'),
  },
  {
    id: 2,
    bgImage: careerCtaBg2,
    thumbImage: careerCtaThumb2,
    subtitle: t('careerUnlockSubtitle'),
    subtitleClass: 'text-primary',
    title: t('careerUnlockTitle'),
    link: '/courses-filter-category/tat-ca?category=-1',
    btnClass: 'btn-primary',
    btnText: t('careerUnlockBtn'),
  },
];

const CourseCareerArea = () => {
  const t = useTranslations('OnlineCourse');
  const careerData = getCareerData(t);
  return (
    <>
      {/* -- career area start -- */}
      <section className="bd-career-area bd-career-overlay">
        <div className="container">
          <div className="row gy-30 justify-content-center">
            <div className="col-xxl-12 col-xl-12 col-lg-12">
              <div className="bd-career-grid">
                {careerData.map(item => (
                  <div key={item.id} className="bd-career-wrapper style-one">
                    <div className="bd-career-item">
                      <div className="bd-career-bg">
                        <Image
                          src={item.bgImage}
                          priority
                          alt="background"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="bd-career-thumb">
                        <Image
                          src={item.thumbImage}
                          priority
                          alt="thumbnail"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="bd-career-content">
                        <span className={`bd-career-subtitle ${item.subtitleClass}`}>
                          {item.subtitle}
                        </span>
                        <h4 className="bd-career-title underline">
                          <Link href={item.link}>{item.title}</Link>
                        </h4>
                        <div className="bd-career-btn">
                          <Link className={`bd-btn ${item.btnClass} btn-small`} href={item.link}>
                            {item.btnText}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* -- career area end -- */}
    </>
  );
};

export default CourseCareerArea;
