'use client';
import { Form, Input, Select, Row, Col } from 'antd';
import { useTranslations } from 'next-intl';
import { CreateGroupCourse, Course } from '@/services/courseService';

interface GroupCoursePricingFormProps {
  courseData: Partial<CreateGroupCourse>;
  updateCourseData: (field: string, value: unknown) => void;
  courses: Course[];
  selectedCourses: string[];
}

const GroupCoursePricingForm = ({
  courseData,
  updateCourseData,
  courses,
  selectedCourses,
}: GroupCoursePricingFormProps) => {
  const t = useTranslations('CreateGroupCourse');

  // Create course map for quick lookup
  const courseMap = new Map<string, Course>(courses.map(c => [c.code, c]));

  // Calculate total price from selected courses
  const calculateTotalPrice = () => {
    return selectedCourses.reduce((total, code) => {
      const course = courseMap.get(code);
      return total + (course?.price || 0);
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Form layout="vertical">
      <Form.Item label={t('fields.enrollmentType')} tooltip={t('courseSelection.loadingCourses')}>
        <Select
          value={courseData.enrollment_type || 'LIFETIME'}
          onChange={value => updateCourseData('enrollment_type', value)}
          options={[
            { label: t('enrollment.lifetime'), value: 'LIFETIME' },
            { label: t('enrollment.subscription'), value: 'SUBSCRIPTION' },
          ]}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label={t('fields.price')} tooltip={t('courseSelection.courseDescription')}>
            <Input
              type="number"
              placeholder="0"
              min={0}
              step={0.01}
              value={totalPrice}
              disabled
              addonAfter="$"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label={t('fields.currency')} tooltip={t('courseSelection.courseDescription')}>
        <Select
          value={courseData.currency || 'VND'}
          onChange={value => updateCourseData('currency', value)}
          options={[{ label: 'VND', value: 'VND' }]}
        />
      </Form.Item>
    </Form>
  );
};

export default GroupCoursePricingForm;
