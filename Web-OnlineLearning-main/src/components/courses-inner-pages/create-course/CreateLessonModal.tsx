'use client';

import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Checkbox, Upload, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/hooks/useMessage';
import { CloudUploadOutlined } from '@ant-design/icons';
import { createUrlFile, UploadRequest, UploadResponse } from '../../../services/fileService';
import {
  CreateLessonStandaloneRequest,
  CreateCourseModuleRequest,
  CourseModule,
} from '@/services/courseService';

const { TextArea } = Input;
const { Option } = Select;

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lessonData: CreateLessonStandaloneRequest) => void;
  moduleId: number;
  modules?: (CreateCourseModuleRequest | CourseModule)[];
  editingLesson?: any;
  editingModuleId?: number;
  onUpdate?: (lessonData: CreateLessonStandaloneRequest) => void;
}

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  moduleId,
  modules = [],
  editingLesson,
  editingModuleId,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [uploadLoading, setUploadLoading] = React.useState(false);
  const [documentUploadLoading, setDocumentUploadLoading] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState('');
  const [documentUrl, setDocumentUrl] = React.useState('');
  const [videoDuration, setVideoDuration] = React.useState<number | undefined>(undefined);
  const t = useTranslations('CreateCourse.lessonModal');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && editingLesson) {
      form.setFieldsValue({
        title: editingLesson.title,
        description: editingLesson.description,
        content_type: editingLesson.content_type || 'video',
        is_mandatory: editingLesson.is_mandatory || false,
        sort_order: editingLesson.sort_order || 1,
        module_id: editingModuleId || moduleId,
        video_url: editingLesson.video_url || editingLesson.videoUrl,
      });
      setVideoUrl(editingLesson.video_url || editingLesson.videoUrl || '');
      setVideoDuration(editingLesson.duration);
    } else if (isOpen) {
      form.resetFields();
      setVideoUrl('');
      setVideoDuration(undefined);
    }
  }, [isOpen, editingLesson, editingModuleId, moduleId, form]);

  const extractErrorMessage = (err: unknown): string | undefined => {
    if (!err) return undefined;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null) {
      const maybe = err as { response?: { data?: { message?: unknown } }; message?: unknown };
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

  // antd/rc-upload's UploadRequestOption shape is broad; allow a single suppressed `any` here
  type UploadOptions = any;

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const selectedModuleId = values.module_id || moduleId || editingModuleId;
      const lessonData: CreateLessonStandaloneRequest = {
        ...values,
        module_id: selectedModuleId,
        video_url: videoUrl || values.video_url,
        duration: videoDuration,
      };

      if (editingLesson && onUpdate) {
        // Update mode
        onUpdate({ ...editingLesson, ...lessonData });
      } else {
        // Create mode
        onSave(lessonData);
      }
      handleCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Handle video file upload (S3 presigned URL)
  const handleVideoUpload = async (file: File) => {
    try {
      // extract duration from file before upload
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

      const durationSecs = await getDuration(file);
      setVideoDuration(durationSecs);

      setUploadLoading(true);
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
        description: t('videoUploadSuccess'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error uploading video:', error);
      const extracted = extractErrorMessage(error);
      const errorMsg = extracted || t('videoUploadFailed');
      notification.error({
        message: tNotif('error'),
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Custom upload behavior
  const customUploadVideo = (options: UploadOptions) => {
    const { file } = options;
    handleVideoUpload(file);
    return false;
  };

  // Handle document file upload (PDF, Word)
  const handleDocumentUpload = async (file: File) => {
    try {
      setDocumentUploadLoading(true);
      const uploadData: UploadRequest = {
        variant: 'document',
        extension: file.name.split('.').pop() || 'pdf',
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
      setDocumentUploadLoading(false);
    }
  };

  const customUploadDocument = (options: UploadOptions) => {
    const { file } = options;
    handleDocumentUpload(file);
    return false;
  };

  const handleCancel = () => {
    form.resetFields();
    setVideoUrl('');
    onClose();
  };

  const contentType = Form.useWatch('content_type', form);
  const showModuleSelect = modules.length > 0 && moduleId === 0;

  return (
    <Modal
      title={editingLesson ? `${t('title')} - Edit` : t('title')}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText={editingLesson ? 'Update' : t('save')}
      cancelText={t('cancel')}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          content_type: 'video',
          sort_order: 1,
          is_mandatory: false,
          module_id: moduleId || undefined,
        }}
      >
        {showModuleSelect && (
          <Form.Item
            name="module_id"
            label={t('selectModule') || 'Select Module'}
            rules={[
              {
                required: true,
                message: t('selectModuleRequired') || 'Please select a module',
              },
            ]}
          >
            <Select size="large" placeholder={t('selectModulePlaceholder') || 'Choose a module'}>
              {modules.map((module, index) => {
                // For CourseModule (update mode), use module.id
                // For CreateCourseModuleRequest (create mode), use index + 1
                const moduleValue = 'id' in module ? module.id : index + 1;
                return (
                  <Option key={index} value={moduleValue}>
                    {module.title || `Module ${index + 1}`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        )}

        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="title"
            label={t('lessonTitle')}
            rules={[{ required: true, message: t('lessonTitleRequired') }]}
            style={{ flex: 2 }}
          >
            <Input placeholder={t('lessonTitlePlaceholder')} size="large" />
          </Form.Item>

          <Form.Item name="sort_order" label={t('sortOrder')} style={{ flex: 1 }}>
            <InputNumber min={1} style={{ width: '100%' }} size="large" />
          </Form.Item>
        </div>

        <Form.Item name="description" label={t('description')}>
          <TextArea rows={3} placeholder={t('descriptionPlaceholder')} />
        </Form.Item>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
          <Form.Item name="content_type" label={t('contentType')} style={{ flex: 1 }}>
            <Select size="large">
              <Option value="video">{t('contentTypeVideo')}</Option>
              <Option value="text">{t('contentTypeText')}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="is_mandatory" valuePropName="checked" style={{ flex: 1 }}>
            <Checkbox>{t('mandatoryLesson')}</Checkbox>
          </Form.Item>
        </div>

        {/* Document URL - Always available for both video and text */}
        <Form.Item label={t('documentUrl') || 'Document URL (PDF, slides, etc.)'}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item
              name="document_url"
              noStyle
              rules={[{ type: 'url', message: t('invalidUrl') || 'Please enter a valid URL' }]}
            >
              <Input
                placeholder={t('documentUrlPlaceholder') || 'https://example.com/document.pdf'}
                size="large"
                style={{ flex: 1 }}
              />
            </Form.Item>
            <Upload
              customRequest={customUploadDocument}
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
              <Button icon={<CloudUploadOutlined />} loading={documentUploadLoading} size="large">
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

        {contentType === 'video' && (
          <Form.Item label={t('video')}>
            <Upload
              customRequest={customUploadVideo}
              accept="video/*"
              showUploadList={false}
              beforeUpload={file => {
                const isVideo = file.type.startsWith('video/');
                if (!isVideo) {
                  notification.error({
                    message: tNotif('error'),
                    description: t('videoFileTypeError'),
                    placement: 'topRight',
                    duration: 3,
                  });
                }
                const isLt50M = file.size / 1024 / 1024 < 50;
                if (!isLt50M) {
                  notification.error({
                    message: tNotif('error'),
                    description: t('videoFileSizeError'),
                    placement: 'topRight',
                    duration: 3,
                  });
                }
                return isVideo && isLt50M;
              }}
            >
              <Button icon={<CloudUploadOutlined />} loading={uploadLoading} size="large" block>
                {videoUrl ? t('changeVideo') : t('uploadVideo')}
              </Button>
            </Upload>
            {/* Allow pasting a direct video URL instead of uploading */}
            <Form.Item
              name="video_url"
              label={t('orVideoUrl') || 'Or paste video URL'}
              style={{ marginTop: 8 }}
            >
              <Input placeholder={t('videoUrlPlaceholder') || 'https://example.com/video.mp4'} />
            </Form.Item>
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
              {t('maxFileSize50')}
            </small>
            {videoUrl && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
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
        )}

        {contentType === 'text' && (
          <Form.Item
            name="content"
            label={t('textContent') || 'Text Content'}
            rules={[
              { required: true, message: t('textContentRequired') || 'Please enter text content' },
            ]}
          >
            <TextArea rows={6} placeholder={t('textContentPlaceholder')} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CreateLessonModal;
