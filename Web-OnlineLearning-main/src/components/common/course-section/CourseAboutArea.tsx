import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import circleImg from '../../../../public/assets/images/shape/about-solid-circle.webp';
import bookShapeImg from '../../../../public/assets/images/shape/about-book-shape.webp';
import aboutWaveShape from '../../../../public/assets/images/shape/about-wave-shape.webp';
import aboutCircle from '../../../../public/assets/images/shape/about-circle.webp';
import aboutThumb1 from '../../../../public/assets/images/about/about-thumb-01.webp';
import aboutThumbSmall from '../../../../public/assets/images/about/about-thumb-small-01.webp';
import dotShape from '../../../../public/assets/images/shape/dot-shape-01.webp';

interface AboutFeatureProps {
  iconClass: string;
  title: string;
  description: string;
}

const AboutFeatureItem: React.FC<AboutFeatureProps> = ({ iconClass, title, description }) => (
  <div className="bd-about-feature-item">
    <div className="bd-about-feature-icon">
      <span>
        <i className={iconClass}></i>
      </span>
    </div>
    <div className="bd-about-feature-content">
      <h6 className="bd-about-feature-title">{title}</h6>
      <p className="bd-about-feature-desc">{description}</p>
    </div>
  </div>
);

interface AboutShapeProps {
  src: StaticImageData;
  alt: string;
  className: string;
}

const AboutShape: React.FC<AboutShapeProps> = ({ src, alt, className }) => (
  <div className={className}>
    <Image src={src} style={{ width: '100%', height: 'auto' }} alt={alt} />
  </div>
);

const CourseAboutArea: React.FC = () => {
  return (
    <section className="bd-about-area section-space theme-bg p-relative ">
      <div className="container">
        <div className="bd-about-shape-wrap">
          <AboutShape src={circleImg} alt="shape" className="shape-1" />
          <AboutShape src={bookShapeImg} alt="shape" className="shape-2" />
          <AboutShape src={aboutWaveShape} alt="shape" className="shape-3" />
          <AboutShape src={aboutCircle} alt="shape" className="shape-4" />
        </div>
        <div className="row g-5">
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="bd-about-wrapper style-one">
              <div className="bd-about-thumb-inner">
                <div className="bd-about-thumb-wrapper">
                  <div className="bd-about-thumb">
                    <Image
                      src={aboutThumb1}
                      style={{ width: '100%', height: 'auto' }}
                      alt="image"
                      priority
                    />
                  </div>
                  <div className="bd-about-thumb-small">
                    <Image
                      src={aboutThumbSmall}
                      style={{ width: '100%', height: 'auto' }}
                      alt="image"
                      priority
                    />
                  </div>
                </div>
                <div className="bd-about-thumb-shape">
                  <Image src={dotShape} alt="image" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="bd-about-wrapper style-one">
              <div className="bd-about-content-wrapper">
                <div className="bd-section-title-wrapper">
                  <span className="bd-section-subtitle text-secondary">Về chúng tôi</span>
                  <h2 className="bd-section-title white-text mb-20">
                    Cách mới khác biệt để cải thiện <span className="down-mark-line">kỹ năng</span>
                  </h2>
                  <p className="bd-section-paragraph has-border-sec">
                    Giáo dục là một trong những tài sản quan trọng và có giá trị nhất mà mỗi cá nhân
                    có thể sở hữu. Nó đóng vai trò then chốt trong việc định hình tương lai.
                  </p>
                </div>
                <div className="bd-about-feature-list">
                  <AboutFeatureItem
                    iconClass="icon-online-class"
                    title="Lớp học linh hoạt"
                    description="Tính năng lớp học linh hoạt cho phép học viên tùy chỉnh lịch học theo nhu cầu của mình."
                  />
                  <AboutFeatureItem
                    iconClass="icon-expert-trainers"
                    title="Giảng viên chuyên môn"
                    description="Tất cả giảng viên đều có chứng chỉ và trình độ cao, đảm bảo bạn được học từ những chuyên gia có năng lực."
                  />
                  <AboutFeatureItem
                    iconClass="icon-career-growth"
                    title="Xây dựng sự nghiệp"
                    description="Chuẩn bị cho phỏng vấn xin việc với các buổi giả lập, phản hồi và mẹo để tự tin thể hiện bản thân."
                  />
                </div>
                <div className="bd-about-btn">
                  <Link className="bd-btn btn-secondary-white" href="/about-online-course">
                    Tìm hiểu thêm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseAboutArea;
