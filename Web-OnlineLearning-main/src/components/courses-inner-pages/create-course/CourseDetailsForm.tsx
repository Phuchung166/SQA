import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Form, Input, Select } from 'antd';
import { useNotification } from '@/hooks/useMessage';
import { CreateCourseRequest } from '@/services/courseService';
import { categoryService, Category } from '@/services/categoryService';

const { TextArea } = Input;

interface CourseDetailsFormProps {
  courseData: CreateCourseRequest;
  updateCourseData: (field: keyof CreateCourseRequest, value: unknown) => void;
}

const CourseDetailsForm: React.FC<CourseDetailsFormProps> = ({ courseData, updateCourseData }) => {
  const t = useTranslations('CreateCourse');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await categoryService.getCategories({
          page: 1,
          pageSize: 100,
          sortBy: 'name',
          sortOrder: 'asc',
          isActive: true,
        });

        setCategories(response.data);
      } catch (err: unknown) {
        console.error('Error fetching categories:', err);
        const errorMsg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as Error)?.message ||
          'Failed to load categories';
        setError(errorMsg);
        notification.error({
          message: tNotif('error'),
          description: errorMsg,
          placement: 'topRight',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [notification, tNotif]);

  return (
    <div className="course-details-form">
      <Form layout="vertical">
        <Form.Item
          label={t('details.category') ?? 'Category'}
          required
          rules={[
            { required: true, message: t('details.selectCategory') ?? 'Please select a category' },
          ]}
        >
          <Select
            value={
              courseData.category_id && courseData.category_id > 0
                ? courseData.category_id
                : undefined
            }
            onChange={value => updateCourseData('category_id', value)}
            placeholder={t('details.selectCategory') ?? 'Select a category'}
            size="large"
            style={{ width: '100%' }}
            loading={loading}
            disabled={!!error}
          >
            {categories.map(category => (
              <Select.Option key={category.id} value={parseInt(category.id)}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
          {error && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
        </Form.Item>

        <Form.Item
          label={t('details.whatYouLearn') ?? "What You'll Learn"}
          help={t('details.whatYouLearnHelp') ?? 'Enter each learning outcome on a separate line'}
        >
          <TextArea
            rows={4}
            value={
              Array.isArray(courseData.what_you_learn)
                ? courseData.what_you_learn.join('\n')
                : courseData.what_you_learn || ''
            }
            onChange={e => {
              const items = e.target.value
                .split('\n')
                .map(item => item.trim())
                .filter(item => item.length > 0);
              updateCourseData('what_you_learn', items);
            }}
            placeholder={
              t('details.whatYouLearnHelp') ?? 'Enter each learning outcome on a new line'
            }
          />
        </Form.Item>

        <Form.Item
          label={t('details.targetAudiences') ?? 'Target Audiences'}
          help={t('details.targetAudiencesHelp') ?? 'Enter each target audience on a separate line'}
        >
          <TextArea
            rows={4}
            value={
              Array.isArray(courseData.target_audiences)
                ? courseData.target_audiences.join('\n')
                : courseData.target_audiences || ''
            }
            onChange={e => {
              const items = e.target.value
                .split('\n')
                .map(item => item.trim())
                .filter(item => item.length > 0);
              updateCourseData('target_audiences', items);
            }}
            placeholder={
              t('details.targetAudiencesHelp') ?? 'Enter each target audience on a new line'
            }
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default CourseDetailsForm;
