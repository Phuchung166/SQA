import React from 'react';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import BecomeInstructorFeatures from './BecomeInstructorFeatures';
import BecomeInstructorCounter from './BecomeInstructorCounter';
import JoiningInfoArea from './JoiningInfoArea';
import JoiningFormArea from './JoiningFormArea';
import { useTranslations } from 'next-intl';

const BecomeInstructorMain = () => {
  const t = useTranslations('instructors');
  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('becomeInstructor')} />
      <BecomeInstructorFeatures />
      <BecomeInstructorCounter />
      <JoiningInfoArea />
      <JoiningFormArea />
    </>
  );
};

export default BecomeInstructorMain;
