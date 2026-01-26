import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { CreateCourseRequest } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { LEVEL_COURSE } from './const';
import { ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

interface BasicInfoFormProps {
  courseData: CreateCourseRequest;
  updateCourseData: (field: keyof CreateCourseRequest, value: any) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ courseData, updateCourseData }) => {
  const t = useTranslations('CreateCourse');

  // Function to generate course code: ONL + 8 random digits
  const generateCourseCode = () => {
    const randomDigits = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    return `ONL${randomDigits}`;
  };

  // Initialize course code on component mount if not already set
  React.useEffect(() => {
    if (!courseData.code) {
      const newCode = generateCourseCode();
      updateCourseData('code', newCode);
    }
  }, [courseData.code, updateCourseData]);

  return (
    <div className="basic-info-form">
      <Form layout="vertical">
        <Form.Item label={t('course_title')} required>
          <Input
            value={courseData.title}
            onChange={e => updateCourseData('title', e.target.value)}
            placeholder={t('course_title')}
            size="large"
          />
        </Form.Item>

        <Form.Item label="Course Code" required>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Input
              value={courseData.code}
              readOnly
              placeholder="Auto-generated"
              size="large"
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                const newCode = generateCourseCode();
                updateCourseData('code', newCode);
              }}
              title="Regenerate course code"
            />
          </div>
        </Form.Item>

        <Form.Item label={t('short_description')} required>
          <Input.TextArea
            value={courseData.short_description}
            onChange={e => updateCourseData('short_description', e.target.value)}
            placeholder={t('short_description')}
            rows={4}
          />
        </Form.Item>

        <Form.Item label={t('full_description')} required>
          <Input.TextArea
            value={courseData.description}
            onChange={e => updateCourseData('description', e.target.value)}
            placeholder={t('full_description')}
            rows={6}
          />
        </Form.Item>

        <Form.Item label={t('level')}>
          <Select
            value={courseData.level}
            onChange={value => updateCourseData('level', value)}
            size="large"
          >
            {LEVEL_COURSE.map(level => (
              <Option key={level.value} value={level.value}>
                {t(level.label)}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BasicInfoForm;
