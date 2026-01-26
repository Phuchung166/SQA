'use client';
import React, { useState } from 'react';
import { UserProfile, UpdateStudentProfileRequest, userService } from '@/services/userService';
import { useTranslations } from 'next-intl';
import { Modal, Form, Input, Select, DatePicker, Upload, message } from 'antd';
import { useNotification } from '@/hooks/useMessage';
import { useAppDispatch } from '@/redux/hooks';
import { updateUser } from '@/redux/slices/authSlice';
import dayjs, { Dayjs } from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { createUrlFile } from '@/services/fileService';
import Image from 'next/image';

interface StudentProfileMainProps {
  profile: UserProfile | null;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

const StudentProfileMain: React.FC<StudentProfileMainProps> = ({ profile, onProfileUpdate }) => {
  const t = useTranslations('student_dashboard.profile');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const handleEditClick = () => {
    if (profile) {
      form.setFieldsValue({
        first_name: profile.first_name,
        last_name: profile.last_name,
        account_name: profile.account_name,
        phone: profile.phone,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth ? dayjs(profile.date_of_birth) : null,
        bio: profile.bio,
      });
      // Set avatar if exists
      if (profile.avatar) {
        setFileList([
          {
            uid: '-1',
            name: 'avatar.jpg',
            status: 'done',
            url: profile.avatar,
          },
        ]);
      }
      setIsModalOpen(true);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setFileList([]);
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  const uploadToS3 = async (file: RcFile): Promise<string> => {
    try {
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const uploadRequest = {
        variant: 'avatar',
        extension: fileExtension,
        file_name: file.name,
      };

      const { presignedUrl, cloudFrontUrl } = await createUrlFile(uploadRequest);

      // Upload to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      return cloudFrontUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  interface FormValues {
    first_name?: string;
    last_name?: string;
    account_name?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: Dayjs | null;
    bio?: string;
  }

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      let avatarUrl = profile?.avatar;

      // Upload avatar if changed
      if (fileList.length > 0 && fileList[0].originFileObj) {
        setUploading(true);
        avatarUrl = await uploadToS3(fileList[0].originFileObj as RcFile);
        setUploading(false);
      }

      const updateData: UpdateStudentProfileRequest = {
        first_name: values.first_name,
        last_name: values.last_name,
        account_name: values.account_name,
        phone: values.phone,
        gender: values.gender,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
        bio: values.bio,
        avatar: avatarUrl,
      };

      const updatedProfile = await userService.updateStudentProfile(updateData);
      notification.success({
        message: tNotif ? tNotif('success') : 'Success',
        description: 'Profile updated successfully!',
        placement: 'topRight',
        duration: 3,
      });

      // Update Redux state with new profile data
      dispatch(
        updateUser({
          account_name: updatedProfile.account_name || '',
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          avatar: updatedProfile.avatar,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          gender: updatedProfile.gender,
          date_of_birth: updatedProfile.date_of_birth,
          bio: updatedProfile.bio,
          roles: updatedProfile.roles,
        }),
      );

      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);

      // Call parent callback to refresh profile
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
    } catch (error: unknown) {
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
      const errMsg = extractErrorMessage(error) || 'Failed to update profile';
      notification.error({
        message: tNotif ? tNotif('error') : 'Error',
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (!profile) {
    return (
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <div className="alert alert-warning">{t('unableToLoad')}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <div className="bd-dashboard-title-inner d-flex justify-content-between align-items-center">
            <h4 className="bd-dashboard-title">{t('title')}</h4>
            <button className="bd-btn btn-primary" onClick={handleEditClick}>
              <i className="fa-light fa-pen-to-square me-2"></i>
              {t('editButton')}
            </button>
          </div>

          {/* Avatar Section */}
          {profile.avatar && (
            <div className="text-center mb-4">
              <Image
                src={profile.avatar}
                alt={`${profile.first_name} ${profile.last_name}`}
                width={150}
                height={150}
                className="rounded-circle"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}

          <div className="bd-dashboard-profile-info table-responsive">
            <table className="table table-bordered table-head-bg">
              <thead>
                <tr>
                  <th style={{ minWidth: '200px' }}>{t('field')}</th>
                  <th style={{ minWidth: '736.5px' }}>{t('details')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>{t('registrationDate')}</th>
                  <td>{profile.createdAt ? formatDate(profile.createdAt) : t('na')}</td>
                </tr>
                <tr>
                  <th>{t('firstName')}</th>
                  <td>{profile.first_name || t('na')}</td>
                </tr>
                <tr>
                  <th>{t('lastName')}</th>
                  <td>{profile.last_name || t('na')}</td>
                </tr>
                <tr>
                  <th>{t('username')}</th>
                  <td>{profile.account_name}</td>
                </tr>
                <tr>
                  <th>{t('email')}</th>
                  <td>{profile.email}</td>
                </tr>
                <tr>
                  <th>{t('phoneNumber')}</th>
                  <td>{profile.phone || t('na')}</td>
                </tr>
                <tr>
                  <th>{t('gender')}</th>
                  <td>{profile.gender || t('na')}</td>
                </tr>
                <tr>
                  <th>{t('dateOfBirth')}</th>
                  <td>
                    {profile.date_of_birth ? formatBirthDate(profile.date_of_birth) : t('na')}
                  </td>
                </tr>
                <tr>
                  <th>{t('biography')}</th>
                  <td>{profile.bio || t('noBiography')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          title={t('editProfile')}
          open={isModalOpen}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Avatar Upload */}
            <Form.Item label="Profile Picture">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                maxCount={1}
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              <small className="text-muted">Max file size: 2MB. Formats: JPG, PNG</small>
            </Form.Item>

            <div className="row">
              <div className="col-md-6">
                <Form.Item
                  label={t('firstNameLabel')}
                  name="first_name"
                  rules={[{ required: true, message: t('firstNameRequired') }]}
                >
                  <Input placeholder={t('firstNamePlaceholder')} />
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item
                  label={t('lastNameLabel')}
                  name="last_name"
                  rules={[{ required: true, message: t('lastNameRequired') }]}
                >
                  <Input placeholder={t('lastNamePlaceholder')} />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              label={t('usernameLabel')}
              name="account_name"
              rules={[{ required: true, message: t('usernameRequired') }]}
            >
              <Input placeholder={t('usernamePlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('phoneLabel')}
              name="phone"
              rules={[
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: t('phoneInvalid'),
                },
              ]}
            >
              <Input placeholder={t('phonePlaceholder')} maxLength={11} />
            </Form.Item>

            <div className="row">
              <div className="col-md-6">
                <Form.Item label={t('genderLabel')} name="gender">
                  <Select placeholder={t('genderPlaceholder')}>
                    <Select.Option value="male">
                      {t('genderMale', { defaultValue: 'Male' })}
                    </Select.Option>
                    <Select.Option value="female">
                      {t('genderFemale', { defaultValue: 'Female' })}
                    </Select.Option>
                    <Select.Option value="other">
                      {t('genderOther', { defaultValue: 'Other' })}
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item label={t('dateOfBirth')} name="date_of_birth">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    placeholder={t('datePlaceholder')}
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item label={t('biography')} name="bio">
              <Input.TextArea rows={4} placeholder={t('biographyPlaceholder')} />
            </Form.Item>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="bd-btn btn-outline-secondary"
                onClick={handleModalCancel}
              >
                {t('cancel')}
              </button>
              <button type="submit" className="bd-btn btn-primary" disabled={loading || uploading}>
                {loading || uploading ? t('saving') : t('saveChanges')}
              </button>
            </div>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default StudentProfileMain;
