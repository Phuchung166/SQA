'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Checkbox,
  Card,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { CreateCourseModuleRequest, CreateLessonRequest } from '@/services/courseService';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { createUrlFile, UploadRequest, UploadResponse } from '../../../services/fileService';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: CreateCourseModuleRequest) => void;
  courseId?: number;
  editingModule?: CreateCourseModuleRequest | null;
  onUpdate?: (moduleData: CreateCourseModuleRequest) => void;
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courseId,
  editingModule,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [lessons, setLessons] = useState<CreateLessonRequest[]>([]);
  const [uploadLoading, setUploadLoading] = useState<{ [key: number]: boolean }>({});
  const [documentUploadLoading, setDocumentUploadLoading] = useState<{ [key: number]: boolean }>(
    {},
  );
  const t = useTranslations('CreateCourse.moduleModal');
  const tLesson = useTranslations('CreateCourse.lessonModal');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && editingModule) {
      form.setFieldsValue({
        title: editingModule.title,
        description: editingModule.description,
        sort_order: editingModule.sort_order,
      });
      setLessons(editingModule.lessons || []);
    } else if (isOpen) {
      form.resetFields();
      setLessons([]);
    }
  }, [isOpen, editingModule, form]);

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

  type UploadOptions = any;

  // Handle video file upload for a specific lesson
  const handleVideoUpload = async (file: File, lessonIndex: number) => {
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

      setUploadLoading(prev => ({ ...prev, [lessonIndex]: true }));

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

      updateLesson(lessonIndex, { video_url: uploadResponse.cloudFrontUrl, duration: durationMs });

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
      setUploadLoading(prev => ({ ...prev, [lessonIndex]: false }));
    }
  };

  const customUploadVideo = (options: UploadOptions, lessonIndex: number) => {
    const { file } = options;
    handleVideoUpload(file, lessonIndex);
    return false;
  };

  // Handle document file upload (PDF, Word) for a specific lesson
  const handleDocumentUpload = async (file: File, lessonIndex: number) => {
    try {
      setDocumentUploadLoading(prev => ({ ...prev, [lessonIndex]: true }));

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
        throw new Error(errorText || 'Failed to upload document to S3');
      }

      updateLesson(lessonIndex, { document_url: uploadResponse.cloudFrontUrl });

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
      setDocumentUploadLoading(prev => ({ ...prev, [lessonIndex]: false }));
    }
  };

  const customUploadDocument = (options: UploadOptions, lessonIndex: number) => {
    const { file } = options;
    handleDocumentUpload(file, lessonIndex);
    return false;
  };

  const addLesson = () => {
    const newLesson: CreateLessonRequest = {
      title: '',
      description: '',
      content_type: 'video',
      sort_order: lessons.length + 1,
      is_mandatory: false,
    };
    setLessons(prev => [...prev, newLesson]);
  };

  const updateLesson = (index: number, lessonData: Partial<CreateLessonRequest>) => {
    setLessons(prev =>
      prev.map((lesson, i) => (i === index ? { ...lesson, ...lessonData } : lesson)),
    );
  };

  const removeLesson = (index: number) => {
    setLessons(prev => prev.filter((_, i) => i !== index));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const moduleData: CreateCourseModuleRequest = {
        ...values,
        course_id: courseId,
        lessons: lessons,
      };

      if (editingModule && onUpdate) {
        // Update mode
        onUpdate({ ...editingModule, ...moduleData });
      } else {
        // Create mode
        onSave(moduleData);
      }
      handleCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setLessons([]);
    onClose();
  };

  return (
    <Modal
      title={editingModule ? `${t('title')} - Edit` : t('title')}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText={editingModule ? 'Update' : t('save')}
      cancelText={t('cancel')}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label={t('moduleTitle')}
          rules={[{ required: true, message: t('moduleTitleRequired') }]}
        >
          <Input placeholder={t('moduleTitlePlaceholder')} size="large" />
        </Form.Item>

        <Form.Item name="description" label={t('description')}>
          <TextArea rows={3} placeholder={t('descriptionPlaceholder')} />
        </Form.Item>

        <Form.Item name="sort_order" label={t('sortOrder')} initialValue={1}>
          <InputNumber min={1} style={{ width: '100%' }} size="large" />
        </Form.Item>

        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              {t('lessonsSection')}
            </Title>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addLesson}>
              {t('addLesson')}
            </Button>
          </div>

          {lessons.map((lesson, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: '12px' }}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeLesson(index)}
                >
                  {t('removeLesson')}
                </Button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Input
                    placeholder={t('lessonTitlePlaceholder')}
                    value={lesson.title}
                    onChange={e => updateLesson(index, { title: e.target.value })}
                    style={{ flex: 2 }}
                  />
                  <Select
                    value={lesson.content_type}
                    onChange={value => updateLesson(index, { content_type: value })}
                    style={{ flex: 1 }}
                  >
                    <Option value="video">{t('contentTypeVideo')}</Option>
                    <Option value="text">{t('contentTypeText')}</Option>
                  </Select>
                </div>

                <TextArea
                  rows={2}
                  placeholder={t('lessonDescription')}
                  value={lesson.description}
                  onChange={e => updateLesson(index, { description: e.target.value })}
                />

                {/* Document URL - Always available */}
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <Input
                      placeholder={t('documentUrlPlaceholder') || 'Document URL or upload PDF/Word'}
                      value={lesson.document_url || ''}
                      onChange={e => updateLesson(index, { document_url: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <Upload
                      customRequest={options => customUploadDocument(options, index)}
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
                      <Button
                        icon={<CloudUploadOutlined />}
                        loading={documentUploadLoading[index]}
                        size="small"
                      >
                        {lesson.document_url ? t('changeDocument') : t('uploadDocument')}
                      </Button>
                    </Upload>
                  </div>
                  {lesson.document_url && (
                    <small style={{ color: '#52c41a', fontSize: '11px' }}>
                      {t('documentUploadSuccess')}
                    </small>
                  )}
                </div>

                {lesson.content_type === 'video' && (
                  <div>
                    <Upload
                      customRequest={options => customUploadVideo(options, index)}
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
                      <Button icon={<CloudUploadOutlined />} loading={uploadLoading[index]} block>
                        {lesson.video_url ? t('changeVideo') : t('uploadVideo')}
                      </Button>
                    </Upload>
                    <small
                      style={{
                        color: '#666',
                        fontSize: '12px',
                        display: 'block',
                        marginTop: '4px',
                      }}
                    >
                      {t('maxFileSize50')}
                    </small>
                    {/* Allow pasting a direct video URL instead of uploading */}
                    <Input
                      placeholder={tLesson('videoUrlPlaceholder')}
                      value={lesson.video_url || ''}
                      onChange={e => updateLesson(index, { video_url: e.target.value })}
                      style={{ marginTop: 8 }}
                    />
                    {lesson.video_url && (
                      <div
                        style={{
                          marginTop: '4px',
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
                  </div>
                )}

                {lesson.content_type === 'text' && (
                  <TextArea
                    rows={3}
                    placeholder={t('textContentPlaceholder')}
                    value={lesson.content || ''}
                    onChange={e => updateLesson(index, { content: e.target.value })}
                  />
                )}

                <Checkbox
                  checked={lesson.is_mandatory}
                  onChange={e => updateLesson(index, { is_mandatory: e.target.checked })}
                >
                  {t('mandatoryLesson')}
                </Checkbox>
              </div>
            </Card>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

export default CreateModuleModal;
