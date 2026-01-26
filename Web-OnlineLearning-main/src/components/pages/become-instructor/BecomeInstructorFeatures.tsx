import ControlContentSvg from '@/svg/ControlContentSvg';
import MonetizeKnowledgeSvg from '@/svg/MonetizeKnowledgeSvg';
import NetworkSvg from '@/svg/NetworkSvg';
import { useTranslations } from 'next-intl';
import React from 'react';
// Define the IFeature interface
interface IFeature {
  icon: React.FC;
  titleKey: string;
  descriptionKey: string;
}

// Features array with icon, title, and description for each feature
const features: IFeature[] = [
  {
    icon: NetworkSvg,
    titleKey: 'features.feature1.title',
    descriptionKey: 'features.feature1.description',
  },
  {
    icon: ControlContentSvg,
    titleKey: 'features.feature2.title',
    descriptionKey: 'features.feature2.description',
  },
  {
    icon: MonetizeKnowledgeSvg,
    titleKey: 'features.feature3.title',
    descriptionKey: 'features.feature3.description',
  },
];
const BecomeInstructorFeatures = () => {
  const t = useTranslations('instructors');
  return (
    <>
      {/* Joining Features Section */}
      <section className="bd-joining-features-area section-space">
        <div className="container">
          <div className="row g-30">
            <div className="col-12">
              <div className="section-title text-center mb-50">
                <h2>{t('features.heading')}</h2>
              </div>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                <div className="bd-joining-features-box text-center">
                  <div className="bd-joining-features-icon">
                    <feature.icon />
                  </div>
                  <div className="bd-joining-features-content">
                    <h4 className="title">{t(feature.titleKey)}</h4>
                    <p className="description">{t(feature.descriptionKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BecomeInstructorFeatures;
