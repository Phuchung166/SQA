'use client';

import Link from 'next/link';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import categoryService, { Category } from '@/services/categoryService';
import { useNotification } from '@/hooks/useMessage';
import Image from 'next/image';
import { encodeUrl } from '@/utils/HelperUtils';
import styles from './CourseCatagory.module.scss';

const CourseCatagory = React.memo(() => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const t = useTranslations('OnlineCourse');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories({ page: 1, pageSize: 8, isActive: true });
      setCategories(res.data);
    } catch (error) {
      setCategories([]);
      const errMsg = (error as any)?.message || 'Failed to load categories';
      notification.error({
        message: tNotif('error'),
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }, [notification, tNotif]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const topCategoriesText = useMemo(() => t('topCategories') ?? 'Categories', [t]);
  const loadingText = useMemo(() => t('loading') ?? 'Loading...', [t]);

  return (
    <>
      {/* -- category area start -- */}
      <section className={`${styles.categoryArea} section-space`}>
        <div className={`${styles.container} container`}>
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <div
                className={`${styles.sectionTitle} bd-section-wrapper section-title-space text-center`}
              >
                <h2 className="bd-section-title">
                  <span className={styles.downMarkLine}>{topCategoriesText}</span>
                </h2>
              </div>
            </div>
          </div>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingText}>{loadingText}</div>
            </div>
          ) : categories.length === 0 ? (
            <div className={styles.emptyState}>No categories available</div>
          ) : (
            <div className={styles.categoryGrid}>
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`courses-filter-category/${encodeUrl(category.name)}?category=${category.id}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryItem}>
                    <span className={styles.categoryIcon}>
                      <Image
                        src={category.image ?? '/images/default-category.png'}
                        alt={category.name ?? ''}
                        width={65}
                        height={65}
                        loading="lazy"
                      />
                    </span>
                    <div className={styles.categoryContent}>
                      <h6 className={styles.categoryTitle}>{category.name}</h6>
                      <span className={styles.categoryTotal}>
                        {category.total_courses ? `${category.total_courses} courses` : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* -- category area end -- */}
    </>
  );
});

CourseCatagory.displayName = 'CourseCatagory';

export default CourseCatagory;
