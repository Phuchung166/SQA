import React from 'react';
import { Form, Input, Button, Upload } from 'antd';
import { useNotification } from '@/hooks/useMessage';
// import { useTranslations } from 'next-intl';
import { UploadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { CreateCourseRequest } from '@/services/courseService';
import { createUrlFile, UploadRequest, UploadResponse } from '../../../services/fileService';

interface MediaResourcesFormProps {
  courseData: CreateCourseRequest;
  updateCourseData: (field: keyof CreateCourseRequest, value: unknown) => void;
}

interface MediaFile {
  videoUrl: string;
  thumbnailUrl: string;
}

import { useTranslations } from 'next-intl';

const MediaResourcesForm: React.FC<MediaResourcesFormProps> = ({
  courseData,
  updateCourseData,
}) => {
  const t = useTranslations('CreateCourse');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const [fileUrl, setFileUrl] = React.useState<MediaFile>({ videoUrl: '', thumbnailUrl: '' });
  const [uploadLoading, setUploadLoading] = React.useState({ thumbnail: false, video: false });

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

  // Handle thumbnail file upload
  const handleThumbnailUpload = async (file: File) => {
    try {
      setUploadLoading(prev => ({ ...prev, thumbnail: true }));

      // Step 1: Get presigned URL from your API
      const uploadData: UploadRequest = {
        variant: 'thumbnail',
        extension: file.name.split('.').pop() || 'jpg',
        file_name: file.name,
      };

      const uploadResponse: UploadResponse = await createUrlFile(uploadData);

      // Step 2: Upload file to S3 using presigned URL
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

      // Step 3: Use CloudFront URL as the final thumbnail URL
      updateCourseData('thumbnail', uploadResponse.cloudFrontUrl);
      setFileUrl(prev => ({ ...prev, thumbnailUrl: uploadResponse.cloudFrontUrl }));

      notification.success({
        message: tNotif ? tNotif('success') : 'Success',
        description: t('media.thumbnailUploadSuccess'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error uploading thumbnail:', error);
      const extracted = extractErrorMessage(error);
      const errorMsg = extracted || t('media.thumbnailUploadError');
      notification.error({
        message: tNotif ? tNotif('error') : 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setUploadLoading(prev => ({ ...prev, thumbnail: false }));
    }
  };

  // Handle video file upload
  const handleVideoUpload = async (file: File) => {
    try {
      setUploadLoading(prev => ({ ...prev, video: true }));

      // Step 1: Get presigned URL from your API
      const uploadData: UploadRequest = {
        variant: 'video',
        extension: file.name.split('.').pop() || 'mp4',
        file_name: file.name,
      };

      const uploadResponse: UploadResponse = await createUrlFile(uploadData);

      // Step 2: Upload file to S3 using presigned URL
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

      // Step 3: Use CloudFront URL as the final video URL
      updateCourseData('preview_video', uploadResponse.cloudFrontUrl);
      setFileUrl(prev => ({ ...prev, videoUrl: uploadResponse.cloudFrontUrl }));

      notification.success({
        message: tNotif ? tNotif('success') : 'Success',
        description: t('media.videoUploadSuccess'),
        placement: 'topRight',
        duration: 3,
      });
    } catch (error: unknown) {
      console.error('Error uploading video:', error);
      const extracted = extractErrorMessage(error);
      const errorMsg = extracted || t('media.videoUploadError');
      notification.error({
        message: tNotif ? tNotif('error') : 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setUploadLoading(prev => ({ ...prev, video: false }));
    }
  };

  // Custom upload behavior
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customUploadThumbnail = (options: any) => {
    const { file } = options;
    handleThumbnailUpload(file);
    return false; // Prevent default upload behavior
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customUploadVideo = (options: any) => {
    const { file } = options;
    handleVideoUpload(file);
    return false; // Prevent default upload behavior
  };
  return (
    <div className="media-resources-form">
      <Form layout="vertical">
        {/* Thumbnail Section */}
        <div style={{ marginBottom: '24px' }}>
          <Form.Item label={t('media.courseThumbnail') ?? 'Course Thumbnail'}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
              <Input
                type="url"
                value={courseData.thumbnail}
                onChange={e => updateCourseData('thumbnail', e.target.value)}
                placeholder={t('media.thumbnailPlaceholder') ?? 'https://example.com/thumbnail.jpg'}
                size="large"
                style={{ flex: 1 }}
              />
              <Upload
                customRequest={customUploadThumbnail}
                accept="image/*"
                showUploadList={false}
                beforeUpload={file => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    notification.error({
                      message: tNotif ? tNotif('error') : 'Error',
                      description: t('media.imageFileError'),
                      placement: 'topRight',
                      duration: 3,
                    });
                  }
                  // const isLt2M = file.size / 1024 / 1024 < 2;
                  // if (!isLt2M) {
                  //   notification.error({
                  //     message: tNotif ? tNotif('error') : 'Error',
                  //     description: 'Image must smaller than 2MB!',
                  //     placement: 'topRight',
                  //     duration: 3,
                  //   });
                  // }
                  return isImage;
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploadLoading.thumbnail} size="large">
                  {t('media.uploadThumbnail')}
                </Button>
              </Upload>
            </div>
            <small style={{ color: '#666', fontSize: '12px' }}>
              {t('media.recommendedSize') ??
                'Recommended size: 1280x720px. Max file size: 2MB. Formats: JPG, PNG'}
            </small>
          </Form.Item>
        </div>

        {/* Preview Video Section */}
        <div style={{ marginBottom: '24px' }}>
          <Form.Item label={t('media.previewVideo') ?? 'Preview Video'}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
              <Input
                type="url"
                value={courseData.preview_video}
                onChange={e => updateCourseData('preview_video', e.target.value)}
                placeholder={
                  t('media.previewPlaceholder') ?? 'https://example.com/preview-video.mp4'
                }
                size="large"
                style={{ flex: 1 }}
              />
              <Upload
                customRequest={customUploadVideo}
                accept="video/*"
                showUploadList={false}
                beforeUpload={file => {
                  const isVideo = file.type.startsWith('video/');
                  if (!isVideo) {
                    notification.error({
                      message: tNotif ? tNotif('error') : 'Error',
                      description: t('media.videoFileError'),
                      placement: 'topRight',
                      duration: 3,
                    });
                  }
                  const isLt50M = file.size / 1024 / 1024 < 50;
                  if (!isLt50M) {
                    notification.error({
                      message: tNotif ? tNotif('error') : 'Error',
                      description: t('media.videoSizeError'),
                      placement: 'topRight',
                      duration: 3,
                    });
                  }
                  return isVideo && isLt50M;
                }}
              >
                <Button icon={<CloudUploadOutlined />} loading={uploadLoading.video} size="large">
                  {t('media.uploadVideo')}
                </Button>
              </Upload>
            </div>
            <small style={{ color: '#666', fontSize: '12px' }}>
              {t('media.previewGuidance') ??
                'Keep under 2 minutes for preview. Max file size: 50MB. Formats: MP4, MOV, AVI'}
            </small>
          </Form.Item>
        </div>

        {/* File URLs Display */}
        {(fileUrl.thumbnailUrl || fileUrl.videoUrl) && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginTop: '16px',
            }}
          >
            <h4 style={{ marginBottom: '12px', color: '#666' }}>
              {t('media.generatedUrls') ?? 'Generated URLs:'}
            </h4>
            {fileUrl.thumbnailUrl && (
              <div style={{ marginBottom: '8px' }}>
                <strong>{t('media.thumbnailLabel') ?? 'Thumbnail:'}</strong>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                  {fileUrl.thumbnailUrl}
                </span>
              </div>
            )}
            {fileUrl.videoUrl && (
              <div>
                <strong>{t('media.videoLabel') ?? 'Video:'}</strong>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                  {fileUrl.videoUrl}
                </span>
              </div>
            )}
          </div>
        )}
      </Form>
    </div>
  );
};

export default MediaResourcesForm;
