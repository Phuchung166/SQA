import React from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '../../common/Breadcrumb/Breadcrumbs';
import ContactAddressArea from './ContactAddressArea';

const ContactUsMain = () => {
  const t = useTranslations('pages');

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('contact_us')} />
      <ContactAddressArea />
    </>
  );
};

export default ContactUsMain;
