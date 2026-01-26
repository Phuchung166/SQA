import React from 'react';
import { Form, InputNumber, Select, Checkbox, DatePicker, Space } from 'antd';
import { CreateCourseRequest } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

const { Option } = Select;

interface PricingFormProps {
  courseData: CreateCourseRequest;
  updateCourseData: (field: keyof CreateCourseRequest, value: any) => void;
}

const PricingForm: React.FC<PricingFormProps> = ({ courseData, updateCourseData }) => {
  const t = useTranslations('CreateCourse');

  return (
    <div className="pricing-form">
      <Form layout="vertical">
        <Form.Item>
          <Checkbox
            checked={courseData.is_free}
            onChange={e => updateCourseData('is_free', e.target.checked)}
          >
            {t('pricingForm.freeCourse')}
          </Checkbox>
        </Form.Item>

        {!courseData.is_free && (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item label={t('pricingForm.price')} style={{ flex: 1 }}>
              <InputNumber
                min={0}
                value={courseData.price}
                onChange={value => updateCourseData('price', value || 0)}
                placeholder="0"
                size="large"
                style={{ width: '100%' }}
                addonAfter="₫"
              />
            </Form.Item>

            <Form.Item label={t('pricingForm.currency')} style={{ flex: 1 }}>
              <Select
                value={courseData.currency || 'VND'}
                onChange={value => updateCourseData('currency', value)}
                size="large"
              >
                <Option value="VND">VND</Option>
              </Select>
            </Form.Item>
          </div>
        )}

        <Form.Item label={t('fields.enrollmentType')} required>
          <Select
            value={courseData.enrollment_type || 'LIFETIME'}
            onChange={value => updateCourseData('enrollment_type', value)}
            size="large"
          >
            <Option value="LIFETIME">{t('enrollment.lifetime')}</Option>
          </Select>
        </Form.Item>

        {/* Pre-order section */}
        {!courseData.is_free && (
          <>
            <Form.Item style={{ marginTop: '24px' }}>
              <Checkbox
                checked={courseData.is_pre_order}
                onChange={e => updateCourseData('is_pre_order', e.target.checked)}
              >
                {t('pricingForm.preOrder')}
              </Checkbox>
            </Form.Item>

            {courseData.is_pre_order && (
              <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '4px' }}>
                {!courseData.is_free && (
                  <Form.Item label={t('pricingForm.preOrderPrice')} required>
                    <InputNumber
                      min={0}
                      value={courseData.pre_order_price}
                      onChange={value => updateCourseData('pre_order_price', value || 0)}
                      placeholder="0"
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                )}

                <Form.Item label={t('pricingForm.preOrderSlots')} required>
                  <InputNumber
                    min={1}
                    value={courseData.pre_order_total_slots}
                    onChange={value => updateCourseData('pre_order_total_slots', value || 0)}
                    placeholder="0"
                    size="large"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item label={t('pricingForm.preOrderStartDate')} required>
                    <DatePicker
                      value={
                        courseData.pre_order_start_date
                          ? dayjs(courseData.pre_order_start_date)
                          : undefined
                      }
                      onChange={date =>
                        updateCourseData('pre_order_start_date', date ? date.toISOString() : '')
                      }
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item label={t('pricingForm.preOrderEndDate')} required>
                    <DatePicker
                      value={
                        courseData.pre_order_end_date
                          ? dayjs(courseData.pre_order_end_date)
                          : undefined
                      }
                      onChange={date =>
                        updateCourseData('pre_order_end_date', date ? date.toISOString() : '')
                      }
                      size="large"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Space>
              </div>
            )}
          </>
        )}
      </Form>
    </div>
  );
};

export default PricingForm;
