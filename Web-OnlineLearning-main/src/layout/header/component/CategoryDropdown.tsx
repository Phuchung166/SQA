'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { categoryService, Category } from '@/services/categoryService';
import { ALL_CATEGORIES } from '@/constants/CategoryConstants';
import { useTranslations } from 'next-intl';
import { encodeUrl } from '@/utils/HelperUtils';
import { useNotification } from '@/hooks/useMessage';

const CategoryDropdown = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('Header');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  // Safely extract message from various error shapes without using `any`
  const extractErrorMessage = (error: unknown): string | undefined => {
    if (!error) return undefined;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
      const maybe = error as { response?: { data?: { message?: unknown } }; message?: unknown };
      if (
        maybe.response &&
        maybe.response.data &&
        typeof maybe.response.data.message === 'string'
      ) {
        return maybe.response.data.message as string;
      }
      if (typeof maybe.message === 'string') return maybe.message as string;
    }
    return undefined;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch active categories, sorted by name
        const response = await categoryService.getCategories({
          page: 1,
          pageSize: 10, // Limit to 10 categories for dropdown
          sortBy: 'name',
          sortOrder: 'asc',
          isActive: true,
        });

        setCategories(
          [
            {
              id: ALL_CATEGORIES,
              name: t('all'),
              is_active: true,
              created_at: '',
              updated_at: '',
            },
          ].concat(response.data as any),
        );
      } catch (err) {
        console.error('Error fetching categories:', err);
        const defaultMsg = tNotif ? tNotif('error') : 'Error';
        const extracted = extractErrorMessage(err);
        const errMsg = extracted || (t('failedLoadCategories') ?? 'Failed to load categories');
        setError(errMsg);
        // use project notification hook for consistency
        notification.error({
          message: defaultMsg,
          description: errMsg,
          placement: 'topRight',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t, tNotif, notification]);

  if (loading) {
    return (
      <ul>
        <li className="loading">Loading categories...</li>
      </ul>
    );
  }

  if (error) {
    return (
      <ul>
        <li className="error">Error loading categories</li>
      </ul>
    );
  }

  return (
    <>
      <ul>
        {categories.length > 0 ? (
          categories.map(category => (
            <li key={category.id}>
              <Link
                href={`/courses-filter-category/${encodeUrl(category.name)}?category=${category.id}`}
              >
                {category.name}
              </Link>
            </li>
          ))
        ) : (
          <li>No categories available</li>
        )}
      </ul>
    </>
  );
};

export default CategoryDropdown;
