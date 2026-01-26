import React from 'react';
import { useTranslations } from 'next-intl';
import { ContactItem } from '@/interFace/interFace';

const ContactAddressArea = () => {
  const t = useTranslations('pages');

  const contactData: ContactItem[] = [
    {
      icon: 'fa-light fa-map-marker-alt',
      title: t('office'),
      details: ['96A Đ. Trần Phú, P. Mộ Lao, Hà Đông, Hà Nội, Việt Nam'],
    },
    {
      icon: 'fa-light fa-phone',
      title: t('call_us'),
      details: ['+84368840424', '+84852025405'],
    },
    {
      icon: 'fa-light fa-envelope',
      title: t('email_us'),
      details: [
        { text: 'info@ptit.edu.vn', link: 'mailto:info@ptit.edu.vn' },
        { text: 'support@ptit.edu.vn', link: 'mailto:support@ptit.edu.vn' },
      ],
    },
    {
      icon: 'fa-light fa-globe',
      title: t('visit_our_website'),
      details: [
        { text: 'www.Online Learning.com', link: 'https://online-learning-qtv.online/' },
        { text: 'www.Online Learning.info', link: 'https://online-learning-qtv.online/' },
      ],
    },
  ];
  return (
    <>
      <section className="bd-contact-address-area section-space primary-bg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="bd-section-title-wrapper section-title-space text-center">
                <span className="bd-section-subtitle">{t('locations')}</span>
                <h2 className="bd-section-title mb-20">{t('our_global_offices')}</h2>
              </div>
            </div>
          </div>
          <div className="row gy-30">
            {contactData.map((item, index) => (
              <div key={index} className="col-xl-3 col-lg-6 col-md-6">
                <div className="bd-contact-address-box">
                  <div className="icon">
                    <i className={item.icon}></i>
                  </div>
                  <div className="content">
                    <h6 className="title">{item.title}</h6>
                    {item.details.map((detail, idx) =>
                      typeof detail === 'string' ? (
                        <p key={idx}>{detail}</p>
                      ) : (
                        <p key={idx}>
                          <a href={detail.link} target="_blank" rel="noopener noreferrer">
                            {detail.text}
                          </a>
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="bd-contact-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.292276418067!2d105.78484157476795!3d20.980917989421076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd8a1ad71%3A0xa2f9b16036648187!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naOG7hyBCxrB1IGNow61uaCB2aeG7hW4gdGjDtG5n!5e0!3m2!1svi!2s!4v1767437537198!5m2!1svi!2s"
                  width="600"
                  height="450"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactAddressArea;
