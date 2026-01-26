'use client';
import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Statistic,
  Image,
  Tag,
  Empty,
  Spin,
  Pagination,
  Tooltip,
  Button,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { userService } from '@/services/userService';
import { InstructorIncomeResponse, CourseIncomeData } from '@/services/userService';

interface IncomeState {
  data: InstructorIncomeResponse | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
}

const InstructorIncomeMain: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('instructorDashboard');
  const [state, setState] = useState<IncomeState>({
    data: null,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
  });

  // Fetch income data
  useEffect(() => {
    const fetchIncomeData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const response = await userService.getInstructorIncome({
          page: state.currentPage,
          pageSize: state.pageSize,
        });
        setState(prev => ({ ...prev, data: response, loading: false }));
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          error: err.message || 'Failed to fetch income data',
          loading: false,
        }));
      }
    };

    fetchIncomeData();
  }, [state.currentPage, state.pageSize]);

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  };

  // Table columns
  const columns = [
    {
      title: 'Khóa Học',
      key: 'course_title',
      width: 200,
      render: (_: unknown, record: CourseIncomeData) => (
        <div className="course-column">
          {record.thumbnail ? (
            <Image
              src={record.thumbnail}
              alt={record.course_title}
              width={50}
              height={50}
              style={{ borderRadius: '4px', marginRight: '12px' }}
              preview={true}
            />
          ) : (
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '4px',
                marginRight: '12px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileTextOutlined style={{ fontSize: '20px', color: '#999' }} />
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 500, maxWidth: '150px' }}>{record.course_title}</p>
          </div>
        </div>
      ),
    },
    {
      title: t('courseType'),
      key: 'course_type',
      width: 120,
      render: (_: unknown, record: CourseIncomeData) => (
        <Tag color={record.course_type === 'STANDALONE' ? 'blue' : 'green'}>
          {record.course_type === 'STANDALONE' ? t('standalone') : t('groupCourse')}
        </Tag>
      ),
    },
    {
      title: t('totalSales'),
      key: 'total_sales',
      width: 100,
      dataIndex: 'total_sales',
      render: (text: number) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          <ShoppingCartOutlined style={{ marginRight: '8px' }} />
          {text}
        </span>
      ),
    },
    {
      title: t('income'),
      key: 'income',
      width: 150,
      render: (_: unknown, record: CourseIncomeData) => (
        <span style={{ fontWeight: 600, color: '#52c41a', fontSize: '14px' }}>
          <DollarOutlined style={{ marginRight: '4px' }} />
          {record.income.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
  ];

  return (
    <div className="col-xl-9 col-lg-9 col-md-8">
      <div className="instructor-income-container">
        {/* Title */}
        <div
          className="income-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h4 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{t('incomeStatistics')}</h4>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="income-stats" style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Tooltip title={t('totalIncomeTooltip')}>
              <Card
                className="stat-card total-income"
                bordered={false}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: 'help',
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                      {t('totalIncome')}
                    </span>
                  }
                  value={state.data?.total_income || 0}
                  suffix="₫"
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 600 }}
                  prefix={<DollarOutlined style={{ marginRight: '8px' }} />}
                  formatter={value => (value as number).toLocaleString('vi-VN')}
                />
              </Card>
            </Tooltip>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Tooltip title={t('commissionRateTooltip')}>
              <Card
                className="stat-card commission-rate"
                bordered={false}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  cursor: 'help',
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                      {t('commissionRate')}
                    </span>
                  }
                  value={state.data?.commission_rate || 0}
                  suffix="%"
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 600 }}
                  formatter={value => `${value}`}
                />
              </Card>
            </Tooltip>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              className="stat-card total-courses"
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    {t('totalCourses')}
                  </span>
                }
                value={state.data?.courses?.total_elements || 0}
                valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 600 }}
                prefix={<FileTextOutlined style={{ marginRight: '8px' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Courses Table */}
        <Card
          className="income-table-card"
          bordered={false}
          style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}
        >
          <Spin spinning={state.loading} tip={t('loading')}>
            {state.error ? (
              <Empty
                description={`Lỗi: ${state.error}`}
                style={{ marginTop: '48px', marginBottom: '48px' }}
              />
            ) : state.data?.courses?.data?.length === 0 ? (
              <Empty
                description={t('noCoursesFound')}
                style={{ marginTop: '48px', marginBottom: '48px' }}
              />
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={state.data?.courses?.data}
                  rowKey={record => record.course_title}
                  pagination={false}
                  scroll={{ x: 800 }}
                  style={{ marginBottom: '20px' }}
                />
                {state.data?.courses && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <Pagination
                      current={state.currentPage}
                      pageSize={state.pageSize}
                      total={state.data.courses.total_elements}
                      onChange={handlePageChange}
                      onShowSizeChange={handlePageSizeChange}
                      showSizeChanger
                      pageSizeOptions={['5', '10', '20', '50']}
                      showTotal={total => t('pageSize', { total })}
                    />
                  </div>
                )}
              </>
            )}
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default InstructorIncomeMain;
