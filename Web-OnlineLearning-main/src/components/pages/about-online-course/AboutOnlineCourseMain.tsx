import React from 'react';
import Breadcrumbs from '../../common/Breadcrumb/Breadcrumbs';
import AboutWhyChooseUs from './AboutWhyChooseUs';
import CourseAboutArea from '@/components/common/course-section/CourseAboutArea';
import AboutMissionVisionArea from './AboutMissionVisionArea';
import TestimonialSliderOne from '@/components/sliders/testimonial/TestimonialSliderOne';
import AboutCtaArea from '../../common/about-cta/AboutCtaArea';
// import AboutOnlineInstructor from './AboutOnlineInstructor';
import AbourCourseCounterArea from './AbourCourseCounterArea';
import { useTranslations } from 'next-intl';

const AboutOnlineCourseMain = () => {
  const t = useTranslations();
  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('about_online_course')} />
      <AboutWhyChooseUs />
      <CourseAboutArea />
      <AboutMissionVisionArea />
      <AbourCourseCounterArea />
      <TestimonialSliderOne />
      {/* <AboutOnlineInstructor /> */}
      <AboutCtaArea />
    </>
  );
};

export default AboutOnlineCourseMain;
