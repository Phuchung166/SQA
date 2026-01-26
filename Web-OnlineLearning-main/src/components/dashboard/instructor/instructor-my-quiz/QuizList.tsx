'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Table, Button, Modal, Spin, Alert, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  getInstructorQuizStatistic,
  updateStatusQuiz,
  QuizStatisticItem,
} from '@/services/quizzService';
import { useMessage } from '@/hooks/useMessage';

const PRIMARY_COLOR = '#20c997';
const SECONDARY_COLOR = '#ffb800';

const QuizList: React.FC<{ instructorId: number }> = ({ instructorId }) => {
  const [quizzes, setQuizzes] = useState<QuizStatisticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const message = useMessage();
  const pathname = usePathname();
  const t = useTranslations('InstructorQuizzes');

  // Extract locale from pathname
  const locale = pathname.split('/')[1];

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getInstructorQuizStatistic(1, 100);
      setQuizzes(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load quizzes');
      message.error(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (quizId: number) => {
    try {
      setIsUpdating(true);
      await updateStatusQuiz(quizId);
      // Refresh the list to get updated status
      await fetchQuizzes();
      message.success(t('statusUpdatedSuccessfully'));
      setShowConfirmation(null);
    } catch (err: any) {
      message.error(err.message || t('failedToUpdateStatus'));
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    {
      title: t('tableTitle'),
      dataIndex: 'quiz_title',
      key: 'quiz_title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: t('tableDescription'),
      dataIndex: 'course_module_name',
      key: 'course_module_name',
    },
    {
      title: t('tableAttempts'),
      dataIndex: 'total_attempts',
      key: 'total_attempts',
    },
    {
      title: t('tableMandatory'),
      dataIndex: 'course_name',
      key: 'course_name',
      render: (text: string) => <Tag color={SECONDARY_COLOR}>{text}</Tag>,
    },
    {
      title: t('tableStatus'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('statusActive') : t('statusInactive')}
        </Tag>
      ),
    },
    {
      title: t('tableAction'),
      key: 'action',
      render: (_: any, record: QuizStatisticItem) => (
        <Space>
          {record.is_active === false && (
            <Link href={`/${locale}/quizzes/${record.quiz_id}/edit`}>
              <Button type="text" icon={<EditOutlined />} title={t('actionEdit')} />
            </Link>
          )}
          <Button
            type="text"
            icon={<DeleteOutlined />}
            title={record.is_active ? t('actionDeactivate') : t('actionActivate')}
            danger={record.is_active}
            style={!record.is_active ? { color: 'green' } : undefined}
            onClick={() => setShowConfirmation(record.quiz_id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="col-xl-9 col-lg-9 col-md-8">
      <div className="bd-dashboard-inner">
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: '24px', margin: 0, color: PRIMARY_COLOR }}>
                {t('myQuizzes')}
              </h2>
              <Link href={`/${locale}/quizzes`}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                >
                  {t('createQuiz')}
                </Button>
              </Link>
            </div>

            {quizzes.length === 0 ? (
              <div style={{ marginTop: 48, textAlign: 'center' }}>
                <p>{t('noQuizzesFound')}</p>
                <Link href={`/${locale}/quizzes/create`}>
                  <Button
                    type="primary"
                    style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    {t('createFirstQuiz')}
                  </Button>
                </Link>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={quizzes.map(quiz => ({
                  ...quiz,
                  key: quiz.quiz_id,
                }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: total => `${t('paginationTotal')} ${total} ${t('paginationItems')}`,
                }}
                bordered
              />
            )}
          </>
        )}
      </div>

      <Modal
        title={t('confirmStatusChangeTitle')}
        open={showConfirmation !== null}
        onCancel={() => setShowConfirmation(null)}
        footer={[
          <Button key="back" onClick={() => setShowConfirmation(null)}>
            {t('cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isUpdating}
            onClick={() => {
              if (showConfirmation !== null) {
                handleToggleStatus(showConfirmation);
              }
            }}
          >
            {t('confirm')}
          </Button>,
        ]}
      >
        <p>
          {quizzes.find(q => q.quiz_id === showConfirmation)?.is_active
            ? t('confirmDeactivateMessage')
            : t('confirmActivateMessage')}{' '}
          &quot;
          <strong>{quizzes.find(q => q.quiz_id === showConfirmation)?.quiz_title}</strong>
          &quot;?
        </p>
      </Modal>
    </div>
  );
};

export default QuizList;
