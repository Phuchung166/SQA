'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const OnlineCourseFAQ = () => {
  const t = useTranslations('FAQ');
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: t('question1') || 'What courses do you offer?',
      answer:
        t('answer1') ||
        'We offer a wide range of online courses including programming, design, business, and more. Each course is designed by industry experts to help you gain practical skills.',
    },
    {
      id: 2,
      question: t('question2') || 'How do I enroll in a course?',
      answer:
        t('answer2') ||
        'Simply browse our course catalog, select the course you want, and click the "Add to Cart" button. Then proceed to checkout to complete your enrollment.',
    },
    {
      id: 3,
      question: t('question3') || 'Are the courses self-paced?',
      answer:
        t('answer3') ||
        'Yes, most of our courses are self-paced, allowing you to learn at your own speed. However, some courses may have specific schedules and deadlines.',
    },
    {
      id: 4,
      question: t('question4') || 'Do I get a certificate after completion?',
      answer:
        t('answer4') ||
        'Yes, upon successful completion of a course, you will receive a certificate that you can share on your LinkedIn profile or resume.',
    },
    {
      id: 5,
      question: t('question5') || 'What payment methods do you accept?',
      answer:
        t('answer5') ||
        'We accept various payment methods including VNPay for Vietnamese users, and international credit/debit cards for global students.',
    },
    {
      id: 6,
      question: t('question6') || 'Can I get a refund if I am not satisfied?',
      answer:
        t('answer6') ||
        'Yes, we offer a refund policy. If you are not satisfied with a course, you can request a refund within a specified period according to our refund policy.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bd-faq-area modern mb-50">
      <div className="container">
        {/* Header Section */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="section-title text-center mb-65">
              <span className="bd-faq-badge">FAQ</span>
              <h2 className="bd-faq-modern-title">{t('title') || 'Frequently Asked Questions'}</h2>
              <p className="bd-faq-modern-subtitle">
                {t('subtitle') || 'Find answers to common questions about our courses and platform'}
              </p>
            </div>
          </div>
        </div>
        {/* FAQ Items */}
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="bd-faq-wrapper">
              {faqData.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`bd-faq-modern-item ${activeIndex === index ? 'active' : ''}`}
                  onMouseEnter={e => {
                    if (activeIndex !== index) {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeIndex !== index) {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                    }
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className={`bd-faq-modern-question ${activeIndex === index ? 'active' : ''}`}
                  >
                    <div className="bd-faq-question-wrapper">
                      <span
                        className={`bd-faq-question-number ${activeIndex === index ? 'active' : ''}`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`bd-faq-question-text ${activeIndex === index ? 'active' : ''}`}
                      >
                        {faq.question}
                      </span>
                    </div>
                    <span
                      className={`bd-faq-question-icon ${activeIndex === index ? 'active' : ''}`}
                    >
                      <i className="fa-solid fa-chevron-down"></i>
                    </span>
                  </button>
                  <div className={`bd-faq-modern-answer ${activeIndex === index ? 'active' : ''}`}>
                    <div
                      className={`bd-faq-answer-content ${activeIndex === index ? 'active' : ''}`}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Contact CTA Section */}
        {/* <div className="row justify-content-center mt-60">
          <div className="col-lg-8 text-center">
            <div className="bd-faq-modern-contact">
              <div className="bd-faq-contact-icon">
                <i className="fa-solid fa-headset"></i>
              </div>
              <h4 className="bd-faq-contact-title">
                {t('stillHaveQuestions') || 'Still have questions?'}
              </h4>
              <p className="bd-faq-contact-text">
                {t('contactMessage') ||
                  'Feel free to contact our support team for any additional questions'}
              </p>
              <Link href="/contact" className="bd-faq-contact-btn">
                {t('contactUs') || 'Contact Us'}
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default OnlineCourseFAQ;
