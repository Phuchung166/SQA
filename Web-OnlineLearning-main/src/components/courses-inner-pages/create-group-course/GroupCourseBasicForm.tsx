'use client';
import { Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { CreateGroupCourse } from '@/services/courseService';
import { createUrlFile, UploadRequest, UploadResponse } from '@/services/fileService';
import React from 'react';

interface GroupCourseBasicFormProps {
  courseData: Partial<CreateGroupCourse>;
  updateCourseData: (field: string, value: unknown) => void;
}

const GroupCourseBasicForm = ({ courseData, updateCourseData }: GroupCourseBasicFormProps) => {
  const t = useTranslations('CreateGroupCourse');
  const [isUploading, setIsUploading] = React.useState(false);

  const handleThumbnailUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const uploadData: UploadRequest = {
        variant: 'image',
        extension: file.name.split('.').pop() || 'jpg',
        file_name: file.name,
      };

      const uploadResponse: UploadResponse = await createUrlFile(uploadData);

      const uploadToS3Response = await fetch(uploadResponse.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadToS3Response.ok) {
        throw new Error(t('messages.s3UploadError'));
      }

      // Use CloudFront URL
      updateCourseData('thumbnail', uploadResponse.cloudFrontUrl);
      message.success(t('messages.createSuccess'));
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      message.error(t('messages.createError'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item label={t('fields.title')} required tooltip={t('courseSelection.courseTitle')}>
        <Input
          placeholder={t('courseSelection.courseTitle')}
          value={courseData.title || ''}
          onChange={e => updateCourseData('title', e.target.value)}
          maxLength={255}
        />
      </Form.Item>

      <Form.Item label={t('fields.description')} tooltip={t('courseSelection.courseDescription')}>
        <Input.TextArea
          placeholder={t('courseSelection.courseDescription')}
          rows={5}
          value={courseData.description || ''}
          onChange={e => updateCourseData('description', e.target.value)}
        />
      </Form.Item>

      <Form.Item label={t('fields.whatYouLearn')} tooltip={t('courseSelection.whatYouLearn')}>
        <Input.TextArea
          placeholder={t('courseSelection.whatYouLearn')}
          rows={5}
          value={
            Array.isArray(courseData.what_you_learn)
              ? courseData.what_you_learn.join('\n')
              : courseData.what_you_learn || ''
          }
          onChange={e => updateCourseData('what_you_learn', e.target.value)}
        />
      </Form.Item>

      <Form.Item
        label={t('fields.thumbnail')}
        required
        tooltip={t('courseSelection.courseDescription')}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {courseData.thumbnail && typeof courseData.thumbnail === 'string' && (
            <div
              style={{
                width: '100px',
                height: '60px',
                borderRadius: '4px',
                backgroundImage: `url(${courseData.thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          <Upload
            accept="image/*"
            beforeUpload={file => {
              handleThumbnailUpload(file);
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} loading={isUploading}>
              {t('buttons.uploadThumbnail')}
            </Button>
          </Upload>
        </div>
      </Form.Item>
    </Form>
  );
};

export default GroupCourseBasicForm;
