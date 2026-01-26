'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Select, Checkbox, Upload } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { CreateLessonStandaloneRequest } from '@/services/courseService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { createUrlFile, UploadRequest, UploadResponse } from '../../../services/fileService';

const { TextArea } = Input;
const { Option } = Select;

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lessonData: CreateLessonStandaloneRequest) => void;
  moduleId: number;
}

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  moduleId,
}) => {
  const [form] = Form.useForm();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | undefined>(undefined);
  const t = useTranslations('CreateCourse.lessonModal');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  const extractErrorMessage = (err: unknown): string | undefined => {
    if (!err) return undefined;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    try {
      return String(err);
    } catch {
      return undefined;
    }
  };

  // Handle video upload
  const handleVideoUpload = async (file: File) => {
    try {
      // extract duration locally before uploading
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
          } catch (err) {
            resolve(0);
          }
        });

      const durationSecs = await getDuration(file);
      setVideoDuration(durationSecs);

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
        throw new Error(errorText || 'Failed to upload file to S3');
      }

      setVideoUrl(uploadResponse.cloudFrontUrl);

      notification.success({
        message: tNotif('success'),
        description: 'Video uploaded successfully',
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error uploading video:', error);
      const extracted = extractErrorMessage(error);
      const errorMsg = extracted || 'Failed to upload video';
      notification.error({
        message: tNotif('error'),
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
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
    } catch (error: unknown) {
      console.error('Error uploading document:', error);
      const extracted = extractErrorMessage(error);
      const errorMsg = extracted || t('documentUploadFailed');
      notification.error({
        message: tNotif('error'),
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const lessonData: CreateLessonStandaloneRequest = {
        module_id: moduleId,
        title: values.title,
        description: values.description,
        content_type: values.content_type,
        video_url: videoUrl || values.video_url,
        document_url: values.document_url,
        content: values.content,
        sort_order: values.sort_order || 1,
        is_mandatory: values.is_mandatory || false,
        duration: videoDuration,
      };

      onSave(lessonData);
      handleCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setVideoUrl('');
    onClose();
  };

  return (
    <Modal
      title={t('title')}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={700}
      okText={t('saveButton')}
      cancelText={t('cancelButton')}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label={t('lessonTitle')}
          rules={[{ required: true, message: t('lessonTitleRequired') }]}
        >
          <Input placeholder={t('lessonTitlePlaceholder')} size="large" />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('description')}
          rules={[{ required: true, message: t('descriptionRequired') }]}
        >
          <TextArea rows={3} placeholder={t('descriptionPlaceholder')} />
        </Form.Item>

        <Form.Item
          name="content_type"
          label={t('contentType')}
          initialValue="video"
          rules={[{ required: true, message: t('contentTypeRequired') }]}
        >
          <Select>
            <Option value="video">{t('contentTypeVideo')}</Option>
            <Option value="text">{t('contentTypeText')}</Option>
          </Select>
        </Form.Item>

        {/* Document URL - Always available for both video and text */}
        <Form.Item label={t('documentUrl') || 'Document URL (PDF, slides, etc.)'}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item name="document_url" noStyle>
              <Input
                placeholder={t('documentUrlPlaceholder') || 'https://example.com/document.pdf'}
                style={{ flex: 1 }}
              />
            </Form.Item>
            <Upload
              customRequest={options => {
                const { file } = options as any;
                handleDocumentUpload(file as File);
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
              <Form.Item label={t('video')} required>
                <Upload
                  maxCount={1}
                  beforeUpload={file => {
                    handleVideoUpload(file);
                    return false;
                  }}
                  disabled={uploadingVideo}
                  accept="video/*"
                >
                  <Button icon={<CloudUploadOutlined />} loading={uploadingVideo} block>
                    {videoUrl ? t('changeVideo') : t('uploadVideo')}
                  </Button>
                </Upload>
                {/* Allow pasting a direct video URL instead of uploading */}
                <Form.Item
                  name="video_url"
                  label={t('orVideoUrl') || 'Or paste video URL'}
                  style={{ marginTop: 8 }}
                >
                  <Input
                    placeholder={t('videoUrlPlaceholder') || 'https://example.com/video.mp4'}
                  />
                </Form.Item>
                {videoUrl && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '6px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                    }}
                  >
                    <small style={{ color: '#52c41a', fontWeight: 500 }}>
                      {t('videoUploadSuccessShort')}
                    </small>
                  </div>
                )}
              </Form.Item>
            ) : (
              <Form.Item
                name="content"
                label={t('textContent')}
                rules={[{ required: true, message: t('textContentPlaceholder') }]}
              >
                <TextArea rows={4} placeholder={t('textContentPlaceholder')} />
              </Form.Item>
            )
          }
        </Form.Item>

        <Form.Item
          name="sort_order"
          label={t('sortOrder')}
          initialValue={1}
          rules={[{ required: true, message: t('sortOrderRequired') }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="is_mandatory"
          label={t('mandatoryLesson')}
          valuePropName="checked"
          initialValue={false}
        >
          <Checkbox>{t('mandatoryLesson')}</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateLessonModal;
