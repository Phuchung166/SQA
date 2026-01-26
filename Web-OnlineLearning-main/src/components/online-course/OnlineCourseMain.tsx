'use client';
import React from 'react';
import BannerSectionOne from './BannerSectionOne';
import CourseFeatureArea from './CourseFeatureArea';
import CourseCatagory from './CourseCatagory';
import OnlineCourseArea from './OnlineCourseArea';
import TestimonialSliderOne from '../sliders/testimonial/TestimonialSliderOne';
import CourseCareerArea from './CourseCareerArea';
import CourseCounterArea from '../common/course-section/CourseCounterArea';
import OnlineCourseFAQ from './OnlineCourseFAQ';
import OnlineGroupCourseArea from './OnlineGroupCourseArea';
import PreOrderCourseArea from './PreOrderCourseArea';

const OnlineCourseMain = () => {
  return (
    <>
      <BannerSectionOne />
      <CourseFeatureArea />
      <CourseCatagory />
      <PreOrderCourseArea />
      <OnlineGroupCourseArea />
      <OnlineCourseArea />
      <TestimonialSliderOne />
      <OnlineCourseFAQ />
      <CourseCounterArea />
      <CourseCareerArea />
    </>
  );
};

export default OnlineCourseMain;
