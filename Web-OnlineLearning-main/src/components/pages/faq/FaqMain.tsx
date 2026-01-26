'use client';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { faqCategories } from '@/data/faq-data';
import faqShape from '../../../../public/assets/images/faq/faq-shape.png';

const FaqMain = () => {
  const t = useTranslations('FAQ');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState(0);

  const getQuestion = (item: any) => (locale === 'vi' ? item.question_vi : item.question_en);
  const getAnswer = (item: any) => (locale === 'vi' ? item.answer_vi : item.answer_en);
  const getCategoryName = (category: any) =>
    locale === 'vi' ? category.name_vi : category.name_en;

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('title')} />
      {/* -- faq area start -- */}
      <section className="bd-faq-area section-space-top p-relative">
        <div className="container">
          <div className="row gy-30">
            <div className="col-xl-4 col-lg-5">
              <div className="bd-section-title-wrapper section-title-space">
                <h2 className="bd-section-title">
                  {locale === 'vi' ? 'Cần Trợ Giúp?' : 'Need Help?'}{' '}
                  <br className="d-none d-lg-block" />{' '}
                  {locale === 'vi' ? 'Tìm Câu Trả Lời Ở Đây' : 'Find Answers Here'}
                </h2>
              </div>
              <div className="bd-faq-tab-menu">
                <ul className="nav nav-pills" id="pills-tab" role="tablist">
                  {faqCategories.map((category, index) => (
                    <li className="nav-item" role="presentation" key={category.id}>
                      <button
                        className={`nav-link ${activeTab === index ? 'active' : ''}`}
                        id={`pills-${category.id}-tab`}
                        onClick={() => setActiveTab(index)}
                        type="button"
                        role="tab"
                      >
                        {getCategoryName(category)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-xl-8 col-lg-7">
              <div className="bd-faq-tab-content">
                <div className="tab-content" id="pills-tabContent">
                  {faqCategories.map((category, categoryIndex) => (
                    <div
                      key={category.id}
                      className={`tab-pane fade ${activeTab === categoryIndex ? 'show active' : ''}`}
                      id={`pills-${category.id}`}
                      role="tabpanel"
                      tabIndex={0}
                    >
                      <div className="bd-faq-accordion">
                        <div className="accordion-common-style accordion-transparent accordion-style-one">
                          <div className="accordion" id={`accordion-${category.id}`}>
                            {category.items.map((item, itemIndex) => (
                              <div className="accordion-item" key={item.id}>
                                <h2 className="accordion-header" id={`heading-${item.id}`}>
                                  <button
                                    className={`accordion-button ${itemIndex === 0 && categoryIndex === 0 ? '' : 'collapsed'}`}
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-${item.id}`}
                                    aria-expanded={itemIndex === 0 && categoryIndex === 0}
                                    aria-controls={`collapse-${item.id}`}
                                  >
                                    {getQuestion(item)}
                                  </button>
                                </h2>
                                <div
                                  id={`collapse-${item.id}`}
                                  className={`accordion-collapse collapse ${itemIndex === 0 && categoryIndex === 0 ? 'show' : ''}`}
                                  aria-labelledby={`heading-${item.id}`}
                                  data-bs-parent={`#accordion-${category.id}`}
                                >
                                  <div className="accordion-body">{getAnswer(item)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bd-faq-page-shape d-none d-xxl-block">
            <Image src={faqShape} alt="shape" />
          </div>
        </div>
      </section>
      {/* -- faq area end -- */}
    </>
  );
};

export default FaqMain;
