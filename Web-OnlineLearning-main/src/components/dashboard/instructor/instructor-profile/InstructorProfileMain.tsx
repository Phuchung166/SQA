'use client';
import React, { useEffect, useState } from 'react';
import {
  userService,
  InstructorDetailProfile,
  UpdateInstructorProfileRequest,
} from '@/services/userService';
import { Spin, Modal, Form, Input, InputNumber, Upload, message, Select, Tag, Divider } from 'antd';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { UploadOutlined, StarFilled } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { createUrlFile } from '@/services/fileService';
import Image from 'next/image';

const InstructorProfileMain = () => {
  const [profile, setProfile] = useState<InstructorDetailProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const notification = useNotification();
  const tNotif = useTranslations('notification');
  const t = useTranslations('instructorDashboard.profile');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getInstructorProfile();
        setProfile(data);
      } catch (error: any) {
        notification.error({
          message: tNotif('error'),
          description: error?.message || tNotif('profile.fetchError'),
          placement: 'topRight',
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    if (profile) {
      form.setFieldsValue({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio,
        expertise: profile.expertise,
        experience_years: profile.experience_years ? parseInt(profile.experience_years) : undefined,
        qualifications: profile.qualification,
        gender: undefined,
        date_of_birth: undefined,
        bank_account: profile.bank_account,
        bank_name: profile.bank_name,
        phone: profile.phone,
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
    bio?: string;
    expertise?: string;
    experience_years?: number;
    qualifications?: string;
    gender?: string;
    date_of_birth?: string;
    bank_account?: string;
    bank_name?: string;
    phone?: string;
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

      const updateData: UpdateInstructorProfileRequest = {
        first_name: values.first_name,
        last_name: values.last_name,
        bio: values.bio,
        expertise: values.expertise,
        experience_years: values.experience_years,
        qualifications: values.qualifications,
        gender: values.gender,
        date_of_birth: values.date_of_birth,
        bank_account: values.bank_account,
        bank_name: values.bank_name,
        phone: values.phone?.trim(),
        avatar: avatarUrl,
      };

      await userService.updateInstructorProfile(updateData);

      notification.success({
        message: tNotif('success'),
        description: tNotif('profile.updateSuccess'),
        placement: 'topRight',
        duration: 3,
      });

      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);

      // Refresh profile
      const updatedProfile = await userService.getInstructorProfile();
      setProfile(updatedProfile);
    } catch (error: any) {
      notification.error({
        message: tNotif('error'),
        description: error?.message || tNotif('profile.updateError'),
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner text-center" style={{ padding: '100px 0' }}>
          <Spin size="large" tip={t('loading')} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <p>{t('loadError')}</p>
        </div>
      </div>
    );
  }

  const profileDetails = [
    { field: t('fields.firstName'), value: profile.first_name },
    { field: t('fields.lastName'), value: profile.last_name },
    { field: t('fields.email'), value: profile.email },
    { field: t('fields.phoneNumber'), value: profile.phone },
    { field: t('fields.expertise'), value: profile.expertise },
    { field: t('fields.experienceYears'), value: profile.experience_years },
    { field: t('fields.qualification'), value: profile.qualification },
    { field: t('fields.totalCourses'), value: profile.total_courses },
    { field: t('fields.totalStudents'), value: profile.total_students },
    { field: t('fields.biography'), value: profile.bio },
    { field: t('fields.bankAccount'), value: profile.bank_account },
    { field: t('fields.bankName'), value: profile.bank_name },
  ];

  return (
    <>
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <div className="bd-dashboard-title-inner d-flex justify-content-between align-items-center">
            <h4 className="bd-dashboard-title">{t('title')}</h4>
            <button className="bd-btn btn-primary" onClick={handleEditClick}>
              <i className="fa-light fa-pen-to-square me-2"></i>
              {t('modal.editProfileButton')}
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

          {/* Review/Rating Section */}
          {profile.review && (
            <div
              className="bd-dashboard-review-info mb-4 p-3"
              style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
            >
              <h6 className="mb-3">{t('review.title')}</h6>
              <div className="d-flex align-items-center gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="h5 mb-0">{profile.review.avg_rating.toFixed(1)}</span>
                    <div>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarFilled
                          key={i}
                          style={{
                            color: i < Math.round(profile.review!.avg_rating) ? '#ffb800' : '#ddd',
                            marginRight: '4px',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <small className="text-muted">
                    {profile.review.total_reviews} {t('review.reviews')}
                  </small>
                </div>
              </div>
            </div>
          )}

          <div className="bd-dashboard-profile-info table-responsive">
            <table className="table table-bordered table-head-bg">
              <thead>
                <tr>
                  <th style={{ width: '200px' }}>{t('tableHeaders.field')}</th>
                  <th>{t('tableHeaders.details')}</th>
                </tr>
              </thead>
              <tbody>
                {profileDetails.map(({ field, value }) => (
                  <tr key={field}>
                    <td>{field}</td>
                    <td>{value || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title={t('modal.title')}
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Avatar Upload */}
          <Form.Item label={t('modal.profilePicture')}>
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
                  <div style={{ marginTop: 8 }}>{t('modal.upload')}</div>
                </div>
              )}
            </Upload>
            <small className="text-muted">{t('modal.maxFileSize')}</small>
          </Form.Item>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                label={t('fields.firstName')}
                name="first_name"
                rules={[
                  {
                    required: true,
                    message: `${t('fields.firstName')} ${t('common.required')}`,
                  },
                ]}
              >
                <Input
                  placeholder={`${t('common.enter')} ${t('fields.firstName').toLowerCase()}`}
                />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                label={t('fields.lastName')}
                name="last_name"
                rules={[  
                  {
                    required: true,
                    message: `${t('fields.lastName')} ${t('common.required')}`,
                  },
                ]}
              >
                <Input placeholder={`${t('common.enter')} ${t('fields.lastName').toLowerCase()}`} />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            label={t('fields.phoneNumber')}
            name="phone"
            rules={[
              {
                pattern: /^[0-9\-\+\(\)]+$/,
                message: t('validation.phoneInvalidFormat'),
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const trimmedPhone = value.trim();
                  const digitsOnly = trimmedPhone.replace(/\D/g, '');
                  if (digitsOnly.length < 7) {
                    return Promise.reject(new Error(t('validation.phoneMinDigits')));
                  }
                  if (digitsOnly.length > 15) {
                    return Promise.reject(new Error(t('validation.phoneMaxDigits')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder={`${t('common.enter')} ${t('fields.phoneNumber').toLowerCase()}`} />
          </Form.Item>

          <Form.Item label={t('fields.expertise')} name="expertise">
            <Input placeholder={`${t('common.enter')} e.g., Web Development, Data Science`} />
          </Form.Item>

          <Form.Item label={t('fields.experienceYears')} name="experience_years">
            <InputNumber
              min={0}
              max={50}
              placeholder={`${t('common.enter')} ${t('fields.experienceYears').toLowerCase()}`}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label={t('fields.qualification')} name="qualifications">
            <Input placeholder={`${t('common.enter')} e.g., PhD in Computer Science`} />
          </Form.Item>

          <div className="row">
            <div className="col-md-6">
              <Form.Item label={t('fields.gender')} name="gender">
                <Select
                  placeholder={`${t('common.select')} ${t('fields.gender').toLowerCase()}`}
                  allowClear
                >
                  <Select.Option value="male">{t('genderOptions.male')}</Select.Option>
                  <Select.Option value="female">{t('genderOptions.female')}</Select.Option>
                  <Select.Option value="other">{t('genderOptions.other')}</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label={t('fields.dateOfBirth')} name="date_of_birth">
                <Input type="date" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item label={t('fields.bankAccount')} name="bank_account">
                <Input placeholder="e.g., 1234567890" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item label={t('fields.bankName')} name="bank_name">
                <Input placeholder="e.g., ABC Bank" />
              </Form.Item>
            </div>
          </div>

          <Form.Item label={t('fields.biography')} name="bio">
            <Input.TextArea rows={4} placeholder={`${t('common.tell')} us about yourself`} />
          </Form.Item>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="bd-btn btn-outline-secondary"
              onClick={handleModalCancel}
            >
              {t('modal.cancel')}
            </button>
            <button type="submit" className="bd-btn btn-primary" disabled={loading || uploading}>
              {loading || uploading ? t('modal.saving') : t('modal.save')}
            </button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default InstructorProfileMain;
