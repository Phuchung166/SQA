import ContactUsMain from '@/components/pages/contact-us/ContactUsMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Contact Us - Education & Online Courses React NextJs Template',
};

const ContactUs = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <ContactUsMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default ContactUs;
