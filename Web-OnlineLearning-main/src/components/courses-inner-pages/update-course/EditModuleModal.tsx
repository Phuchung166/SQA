'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';
import { UpdateCourseModuleRequest, CourseModule } from '@/services/courseService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';

const { TextArea } = Input;

interface EditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleId: number, moduleData: UpdateCourseModuleRequest) => void;
  module?: CourseModule;
  isLoading?: boolean;
}

const EditModuleModal: React.FC<EditModuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  module,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const t = useTranslations('CreateCourse.moduleModal');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when modal opens with module data
  useEffect(() => {
    if (isOpen && module) {
      form.setFieldsValue({
        title: module.title,
        description: module.description,
        sort_order: module.sort_order,
      });
    }
  }, [isOpen, module, form]);

  const handleOk = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();

      if (!module) {
        notification.error({
          message: tNotif('error'),
          description: 'Module not found',
          placement: 'topRight',
          duration: 3,
        });
        return;
      }

      const updateData: UpdateCourseModuleRequest = {
        title: values.title,
        description: values.description,
        sort_order: values.sort_order,
      };

      onSave(module.id, updateData);
      handleCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={t('editModuleTitle') || 'Edit Module'}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      okText={t('saveButton') || 'Save'}
      cancelText={t('cancelButton') || 'Cancel'}
      confirmLoading={isSaving || isLoading}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label={t('titleLabel') || 'Title'}
          name="title"
          rules={[
            { required: true, message: t('titleRequired') || 'Please enter module title' },
            { max: 255, message: 'Title must be less than 255 characters' },
          ]}
        >
          <Input placeholder="Enter module title" />
        </Form.Item>

        <Form.Item
          label={t('descriptionLabel') || 'Description'}
          name="description"
          rules={[
            {
              required: true,
              message: t('descriptionRequired') || 'Please enter module description',
            },
          ]}
        >
          <TextArea rows={4} placeholder="Enter module description" />
        </Form.Item>

        <Form.Item
          label={t('sortOrderLabel') || 'Sort Order'}
          name="sort_order"
          rules={[
            { required: true, message: t('sortOrderRequired') || 'Please enter sort order' },
            { type: 'number', min: 1, message: 'Sort order must be at least 1' },
          ]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModuleModal;
