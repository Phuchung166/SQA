'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Checkbox, Upload, Button } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { UpdateLessonRequest, Lesson } from '@/services/courseService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { createUrlFile, UploadRequest, UploadResponse } from '../../../services/fileService';

const { TextArea } = Input;
const { Option } = Select;

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lessonId: number, lessonData: UpdateLessonRequest) => void;
  lesson?: Lesson;
  isLoading?: boolean;
}

const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lesson,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const t = useTranslations('CreateCourse.lessonModal');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | undefined>(undefined);

  // Populate form when modal opens with lesson data
  useEffect(() => {
    if (isOpen && lesson) {
      form.setFieldsValue({
        title: lesson.title,
        description: lesson.description,
        content_type: lesson.content_type,
        video_url: lesson.video_url,
        document_url: lesson.document_url,
        content: lesson.content,
        sort_order: lesson.sort_order,
        is_mandatory: lesson.is_mandatory,
      });
      setVideoUrl(lesson.video_url || '');
      setDocumentUrl(lesson.document_url || '');
      setVideoDuration(lesson.duration);
    }
  }, [isOpen, lesson, form]);

  const handleVideoUpload = async (file: File) => {
    try {
      // Extract duration from video file before upload
      const getDuration = (f: File): Promise<number> =>
        new Promise(resolve => {
          try {
            const url = URL.createObjectURL(f);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = url;
            const onLoaded = () => {
              // convert seconds -> milliseconds
              const raw = video.duration || 0;
              const d = Math.floor(raw * 1000);
              URL.revokeObjectURL(url);
              resolve(Number.isFinite(d) ? d : 0);
            };
            const onError = () => {
              URL.revokeObjectURL(url);
              resolve(0);
            };
            video.addEventListener('loadedmetadata', onLoaded, { once: true });
            video.addEventListener('error', onError, { once: true });
          } catch {
            resolve(0);
          }
        });

      const durationMs = await getDuration(file);
      setVideoDuration(durationMs);

      setUploadingVideo(true);

      const uploadData: UploadRequest = {
        variant: 'video',
        extension: file.name.split('.').pop() || 'mp4',
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
        const errorText = await uploadToS3Response.text();
        throw new Error(errorText || 'Failed to upload video');
      }

      setVideoUrl(uploadResponse.cloudFrontUrl);
      form.setFieldsValue({ video_url: uploadResponse.cloudFrontUrl });

      notification.success({
        message: tNotif('success'),
        description: t('videoUploadSuccess'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error uploading video:', error);
      notification.error({
        message: tNotif('error'),
        description: t('videoUploadFailed'),
        placement: 'topRight',
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    try {
      setUploadingDocument(true);
      const uploadData: UploadRequest = {
        variant: 'document',
        extension: file.name.split('.').pop() || 'pdf',
        file_name: file.name,
      };
      const uploadResponse: UploadResponse = await createUrlFile(uploadData);
      const uploadToS3Response = await fetch(uploadResponse.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadToS3Response.ok) {
        const errorText = await uploadToS3Response.text();
        throw new Error(errorText || 'Failed to upload document');
      }
      setDocumentUrl(uploadResponse.cloudFrontUrl);
      form.setFieldsValue({ document_url: uploadResponse.cloudFrontUrl });
      notification.success({
        message: tNotif('success'),
        description: t('documentUploadSuccess'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (err) {
      console.error('Error uploading document:', err);
      notification.error({
        message: tNotif('error'),
        description: t('documentUploadFailed'),
        placement: 'topRight',
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleOk = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();

      if (!lesson) {
        notification.error({
          message: tNotif('error'),
          description: 'Lesson not found',
          placement: 'topRight',
          duration: 3,
        });
        return;
      }

      const updateData: UpdateLessonRequest = {
        title: values.title,
        description: values.description,
        content_type: values.content_type,
        video_url: videoUrl || values.video_url,
        document_url: values.document_url,
        content: values.content,
        sort_order: values.sort_order,
        is_mandatory: values.is_mandatory || false,
        duration: videoDuration,
      };

      onSave(lesson.id, updateData);
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
      title={t('editLessonTitle') || 'Edit Lesson'}
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
            { required: true, message: t('titleRequired') || 'Please enter lesson title' },
            { max: 255, message: 'Title must be less than 255 characters' },
          ]}
        >
          <Input placeholder="Enter lesson title" />
        </Form.Item>

        <Form.Item
          label={t('descriptionLabel') || 'Description'}
          name="description"
          rules={[
            {
              required: true,
              message: t('descriptionRequired') || 'Please enter lesson description',
            },
          ]}
        >
          <TextArea rows={3} placeholder="Enter lesson description" />
        </Form.Item>

        <Form.Item
          label={t('contentTypeLabel') || 'Content Type'}
          name="content_type"
          rules={[
            { required: true, message: t('contentTypeRequired') || 'Please select content type' },
          ]}
        >
          <Select placeholder="Select content type">
            <Option value="video">Video</Option>
            <Option value="text">Text</Option>
          </Select>
        </Form.Item>

        {/* Document URL - Always available for both video and text */}
        <Form.Item label={t('documentUrlLabel') || 'Document URL (PDF, slides, etc.)'}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item
              name="document_url"
              noStyle
              rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
            >
              <Input
                placeholder="https://example.com/document.pdf"
                type="url"
                style={{ flex: 1 }}
              />
            </Form.Item>
            <Upload
              customRequest={async options => {
                const { file } = options as any;
                await handleDocumentUpload(file as File);
                return false;
              }}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              showUploadList={false}
              beforeUpload={file => {
                const isPdfOrWord =
                  file.type === 'application/pdf' ||
                  file.type === 'application/msword' ||
                  file.type ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (!isPdfOrWord) {
                  notification.error({
                    message: tNotif('error'),
                    description: t('documentFileTypeError'),
                    placement: 'topRight',
                    duration: 3,
                  });
                }
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  notification.error({
                    message: tNotif('error'),
                    description: t('documentFileSizeError'),
                    placement: 'topRight',
                    duration: 3,
                  });
                }
                return isPdfOrWord && isLt10M;
              }}
            >
              <Button icon={<CloudUploadOutlined />} loading={uploadingDocument}>
                {t('uploadDocument')}
              </Button>
            </Upload>
          </div>
          {documentUrl && (
            <small
              style={{ color: '#52c41a', fontSize: '11px', marginTop: '4px', display: 'block' }}
            >
              {t('documentUploadSuccess')}
            </small>
          )}
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.content_type !== currentValues.content_type
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('content_type') === 'video' ? (
              <div>
                <Form.Item label={t('video') || 'Video'}>
                  <Upload
                    customRequest={async options => {
                      const { file } = options as any;
                      await handleVideoUpload(file as File);
                      return false;
                    }}
                    accept="video/*"
                    showUploadList={false}
                    beforeUpload={file => {
                      const isVideo = file.type.startsWith('video/');
                      if (!isVideo) {
                        notification.error({
                          message: tNotif('error'),
                          description: t('videoFileTypeError') || 'Only video files are allowed',
                          placement: 'topRight',
                          duration: 3,
                        });
                      }
                      const isLt50M = file.size / 1024 / 1024 < 50;
                      if (!isLt50M) {
                        notification.error({
                          message: tNotif('error'),
                          description: t('videoFileSizeError') || 'Video must be smaller than 50MB',
                          placement: 'topRight',
                          duration: 3,
                        });
                      }
                      return isVideo && isLt50M;
                    }}
                  >
                    <Button icon={<CloudUploadOutlined />} loading={uploadingVideo}>
                      {videoUrl
                        ? t('changeVideo') || 'Change Video'
                        : t('uploadVideo') || 'Upload Video'}
                    </Button>
                  </Upload>

                  {/* Optional: allow pasting a direct video URL */}
                  <div style={{ marginTop: 8 }}>
                    <Form.Item
                      name="video_url"
                      label={t('videoUrlLabel') || 'Or paste video URL'}
                      rules={[{ max: 500, message: 'Video URL must be less than 500 characters' }]}
                    >
                      <Input placeholder="https://example.com/video.mp4" type="url" />
                    </Form.Item>
                  </div>

                  {videoUrl && (
                    <div style={{ marginTop: 8 }}>
                      <small style={{ color: '#52c41a', fontWeight: 500 }}>
                        {t('videoUploadSuccessShort') || 'Video uploaded'}
                      </small>
                    </div>
                  )}
                </Form.Item>
              </div>
            ) : (
              <Form.Item
                label={t('contentLabel') || 'Text Content'}
                name="content"
                rules={[
                  { required: true, message: 'Please enter text content' },
                  { max: 5000, message: 'Content must be less than 5000 characters' },
                ]}
              >
                <TextArea rows={5} placeholder="Enter text content" />
              </Form.Item>
            )
          }
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

        <Form.Item
          label={t('isMandatoryLabel') || 'Mandatory'}
          name="is_mandatory"
          valuePropName="checked"
        >
          <Checkbox>{t('isMandatoryLabel') || 'Mark as mandatory'}</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditLessonModal;
