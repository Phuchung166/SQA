import CountUpContent from '@/components/common/counter/CountUpContent';
import counterData from '@/data/counter-data';
import { useTranslations } from 'next-intl';
import React from 'react';

const BecomeInstructorCounter = () => {
  const t = useTranslations('instructors');
  return (
    <>
      {/* -- counter area start -- */}
      <div className="bd-counter-area section-space-small theme-bg-05">
        <div className="container">
          <div className="row">
            <div className="bd-counter-wrapper bd-counter-style-five">
              {counterData.slice(16, 20).map((item, index) => (
                <div className="bd-counter-item" key={index}>
                  <div className="bd-counter-content">
                    <span className="bd-counter-icon">
                      <i className={item.iconClass}></i>
                    </span>
                    <h2>
                      <CountUpContent number={item.counterNum} text={item.suffix} />
                    </h2>
                    <p>{item.counterText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* -- counter area end -- */}
    </>
  );
};

export default BecomeInstructorCounter;
