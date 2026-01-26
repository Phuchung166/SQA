'use client';

import React from 'react';
import { Card, List, Typography, Alert, Tag, Button } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  VideoCameraOutlined,
  FileImageOutlined,
  DollarOutlined,
  BookOutlined,
  UserOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

import { useTranslations } from 'next-intl';

const CourseUploadTips: React.FC = () => {
  const t = useTranslations('CreateCourse');
  const tips = [
    {
      icon: <FileImageOutlined />,
      title: t('media.courseThumbnail') ?? 'Course Thumbnail',
      description:
        t('media.recommendedSize') ?? 'Use high-quality images (1280x720px) in JPG or PNG format',
      color: 'blue',
    },
    {
      icon: <VideoCameraOutlined />,
      title: t('media.previewVideo') ?? 'Preview Video',
      description:
        t('media.previewGuidance') ?? 'Keep it under 2 minutes to showcase course highlights',
      color: 'green',
    },
    {
      icon: <BookOutlined />,
      title: t('tips.title') ?? 'Course Content',
      description: 'Structure your course with clear modules and lessons',
      color: 'orange',
    },
    {
      icon: <DollarOutlined />,
      title: 'Pricing Strategy',
      description: 'Research competitor pricing for similar courses',
      color: 'red',
    },
    {
      icon: <UserOutlined />,
      title: 'Target Audience',
      description: 'Clearly define who will benefit from your course',
      color: 'purple',
    },
  ];

  const qualityChecklist = [
    t('tips.qualityChecklist') ?? 'Clear course title and description',
    'Professional thumbnail image',
    'Well-structured course modules',
    'Engaging preview video',
    'Appropriate pricing strategy',
    'Defined learning outcomes',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Course Creation Tips */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            {t('tips.title') ?? 'Course Creation Tips'}
          </div>
        }
        size="small"
      >
        <List
          size="small"
          dataSource={tips}
          renderItem={tip => (
            <List.Item style={{ padding: '8px 0' }}>
              <List.Item.Meta
                avatar={
                  <Tag
                    icon={tip.icon}
                    color={tip.color}
                    style={{ margin: 0, display: 'flex', alignItems: 'center' }}
                  />
                }
                title={
                  <Text strong style={{ fontSize: '13px' }}>
                    {tip.title}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {tip.description}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Quality Checklist */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            {t('tips.qualityChecklist') ?? 'Quality Checklist'}
          </div>
        }
        size="small"
      >
        <List
          size="small"
          dataSource={qualityChecklist}
          renderItem={item => (
            <List.Item style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                <Text style={{ fontSize: '12px' }}>{item}</Text>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Best Practices Alert */}
      <Alert
        message={t('tips.bestPractices') ?? 'Best Practices'}
        description={
          <div>
            <Paragraph style={{ margin: '8px 0', fontSize: '12px' }}>
              • {t('tips.bestPractices') ?? 'Keep course modules focused and concise'}
            </Paragraph>
            <Paragraph style={{ margin: '8px 0', fontSize: '12px' }}>
              • Use clear, descriptive lesson titles
            </Paragraph>
            <Paragraph style={{ margin: '8px 0', fontSize: '12px' }}>
              • Include practical exercises and examples
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
        style={{ fontSize: '12px' }}
      />

      {/* Quick Actions */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlayCircleOutlined style={{ color: '#722ed1' }} />
            Quick Actions
          </div>
        }
        size="small"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            type="link"
            size="small"
            style={{ padding: '0', height: 'auto', textAlign: 'left' }}
          >
            📚 Course Creation Guidelines
          </Button>
          <Button
            type="link"
            size="small"
            style={{ padding: '0', height: 'auto', textAlign: 'left' }}
          >
            🎥 Video Recording Tips
          </Button>
          <Button
            type="link"
            size="small"
            style={{ padding: '0', height: 'auto', textAlign: 'left' }}
          >
            💰 Pricing Calculator
          </Button>
          <Button
            type="link"
            size="small"
            style={{ padding: '0', height: 'auto', textAlign: 'left' }}
          >
            📊 Market Research Tool
          </Button>
        </div>
      </Card>

      {/* Support */}
      <Card size="small">
        <div style={{ textAlign: 'center' }}>
          <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            {t('tips.needHelp') ?? 'Need Help?'}
          </Title>
          <Paragraph style={{ margin: '0 0 12px 0', fontSize: '12px' }} type="secondary">
            {t('tips.contactSupport') ??
              'Our team is here to support you in creating amazing courses.'}
          </Paragraph>
          <Button type="primary" size="small" block>
            {t('tips.contactSupport') ?? 'Contact Support'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CourseUploadTips;
