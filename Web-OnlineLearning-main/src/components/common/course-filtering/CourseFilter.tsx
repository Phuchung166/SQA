import React, { useState } from 'react';
import SlideToggle from '@/utils/SlideToggle';
import useGlobalContext from '@/hooks/useContexts';
import { Select, Radio, Space } from 'antd';
import { useTranslations } from 'next-intl';

type Filters = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enrollmentType?: 'LIFETIME';
};

type CourseFilterProps = {
  onFilterChange: (updatedFilters: Filters) => void;
};

const CourseFilter = ({ onFilterChange }: CourseFilterProps) => {
  const { isOpen } = useGlobalContext();
  const t = useTranslations('OnlineCourse');

  // State management
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [enrollmentType, setEnrollmentType] = useState<'LIFETIME' | ''>('');

  // Handle sort by change
  const handleSortByChange = (value: string) => {
    setSortBy(value);
    onFilterChange({
      sortBy: value,
      sortOrder,
      enrollmentType: enrollmentType as 'LIFETIME' | undefined,
    });
  };

  // Handle sort order change
  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    setSortOrder(value);
    onFilterChange({
      sortBy,
      sortOrder: value,
      enrollmentType: enrollmentType as 'LIFETIME' | undefined,
    });
  };

  // Handle enrollment type change
  const handleEnrollmentTypeChange = (value: string) => {
    setEnrollmentType(value as 'LIFETIME' | '');
    onFilterChange({
      sortBy,
      sortOrder,
      enrollmentType: value ? (value as 'LIFETIME') : undefined,
    });
  };

  const sortByOptions = [
    { label: t('selectSortOption') || 'Select sort option', value: '' },
    { label: t('title') || 'Title', value: 'title' },
    { label: t('price') || 'Price', value: 'price' },
    { label: t('newest') || 'Newest', value: 'createdAt' },
  ];

  return (
    <SlideToggle>
      <div className={`bd-course-filter-content mt-30 ${isOpen ? 'd-block' : 'd-none'}`}>
        <div className="container">
          <div className="row gy-30">
            <div className="bd-course-filter-widget">
              {/* Sort By Filter */}
              <div className="bd-course-filter-item">
                <h5 className="bd-widget-title mb-20">{t('sortBy') || 'Sort By'}</h5>
                <div className="bd-widget-content">
                  <Select
                    value={sortBy || undefined}
                    onChange={handleSortByChange}
                    placeholder={t('selectSortOption') || 'Select sort option'}
                    style={{ width: '100%' }}
                    options={sortByOptions}
                    allowClear
                  />
                </div>
              </div>

              {/* Sort Order Filter */}
              <div className="bd-course-filter-item">
                <h5 className="bd-widget-title mb-20">{t('sortOrder') || 'Sort Order'}</h5>
                <div className="bd-widget-content">
                  <Radio.Group
                    value={sortOrder}
                    onChange={e => handleSortOrderChange(e.target.value)}
                  >
                    <Space direction="vertical">
                      <Radio value="asc">{t('ascending') || 'Ascending'}</Radio>
                      <Radio value="desc">{t('descending') || 'Descending'}</Radio>
                    </Space>
                  </Radio.Group>
                </div>
              </div>

              {/* Enrollment Type Filter */}
              <div className="bd-course-filter-item">
                <h5 className="bd-widget-title mb-20">
                  {t('enrollmentType') || 'Enrollment Type'}
                </h5>
                <div className="bd-widget-content">
                  <Radio.Group
                    value={enrollmentType}
                    onChange={e => handleEnrollmentTypeChange(e.target.value)}
                  >
                    <Space direction="vertical">
                      <Radio value="">{t('allTypes') || 'All Types'}</Radio>
                      <Radio value="LIFETIME">{t('lifetimeAccess') || 'Lifetime Access'}</Radio>
                    </Space>
                  </Radio.Group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideToggle>
  );
};

export default CourseFilter;
