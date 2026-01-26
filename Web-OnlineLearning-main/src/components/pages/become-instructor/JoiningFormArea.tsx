'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import JoiningImage from '../../../../public/assets/images/joining/joining-image.webp';
import JoiningForm from '@/form/JoiningForm';
import { Steps } from 'antd';

const JoiningFormArea = () => {
  const t = useTranslations('instructors');
  const [activeStep, setActiveStep] = useState<'formStepOne' | 'formStepTwo'>('formStepOne');

  return (
    <>
      <section className="bd-joining-form-area section-space primary-bg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="bd-section-wrapper section-title-space text-center">
                <h2 className="bd-section-title mb-20">
                  {t ? t('formArea.heading') : 'Become an Instructor Today'}
                </h2>
                <p className="bd-section-paragraph">
                  {t
                    ? t('formArea.description')
                    : 'Join one of the world’s largest online learning marketplaces. Our Instructor Support Team is ready to help you while our Teaching Center'}
                </p>
              </div>
            </div>
          </div>
          <div className="row gy-30 justify-content-between">
            <div className="col-xl-5 col-lg-5 col-md-12">
              <div className="bd-joining-main-thumb">
                <Image src={JoiningImage} alt="image" />
              </div>
            </div>
            <div className="col-xl-7 col-lg-7 col-md-12">
              <div className="custom-form">
                {/* -- Stepper -- */}
                <div className="steps__form mb-20">
                  <div className="bd-form-setup-panel">
                    {/* Ant Design Steps */}
                    <Steps current={['formStepOne', 'formStepTwo'].indexOf(activeStep)}>
                      <Steps.Step title={t ? t('formArea.steps.registration') : 'Registration'} />
                      <Steps.Step title={t ? t('formArea.steps.confirmation') : 'Confirmation'} />
                    </Steps>
                  </div>
                </div>
                <JoiningForm activeStep={activeStep} setActiveStep={setActiveStep} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default JoiningFormArea;
