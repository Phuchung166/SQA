'use client';
import React, { useEffect, useState } from 'react';
import { getUserOrders, OrderListItem, PagedOrderResponse } from '@/services/orderService';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const StudentOrdersMain = () => {
  const t = useTranslations('StudentOrders');
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response: PagedOrderResponse = await getUserOrders({ page, size });
      setOrders(response.data);
      setPagination({
        currentPage: response.current_page,
        totalPages: response.total_pages,
        totalElements: response.total_elements,
        pageSize: response.page_size,
        hasNext: response.has_next,
        hasPrevious: response.has_previous,
      });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.message || t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page, pagination.pageSize);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'badge-success';
      case 'FAILED':
        return 'badge-danger';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'badge-warning';
      case 'REFUND_REQUESTED':
        return 'badge-info';
      case 'REFUND_SUCCESS':
        return 'badge-success';
      case 'REFUND_FAILED':
        return 'badge-danger';
      case 'PENDING':
      default:
        return 'badge-info';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return `${amount.toLocaleString()} VND`;
    }
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="col-xl-9 col-lg-9 col-md-8">
      <div className="bd-dashboard-inner">
        <div className="bd-dashboard-title-inner">
          <h4 className="bd-dashboard-title">{t('title')}</h4>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('loading')}</span>
            </div>
            <p className="mt-3">{t('loadingOrders')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bd-cart-empty text-center py-5">
            <i className="fa-solid fa-bag-shopping" style={{ fontSize: '64px', color: '#ccc' }}></i>
            <h4 className="mt-4">{t('noOrders')}</h4>
            <p className="text-muted mb-4">{t('noOrdersDescription')}</p>
            <Link href="/online-course" className="bd-btn btn-primary">
              <span className="bd-btn-inner">
                <span className="bd-btn-normal">{t('browseCourses')}</span>
              </span>
            </Link>
          </div>
        ) : (
          <>
            <div className="bd-dashboard-table table-responsive mt-30">
              <table className="table table-bordered table-head-bg">
                <thead>
                  <tr>
                    <th>{t('orderNumber')}</th>
                    <th>{t('date')}</th>
                    <th>{t('total')}</th>
                    <th>{t('status')}</th>
                    <th>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={index}>
                      <td>
                        <p className="fw-bold">{order.order_number}</p>
                      </td>
                      <td>
                        <p>{formatDate(order.order_date)}</p>
                      </td>
                      <td>
                        <p className="fw-bold">
                          {formatCurrency(order.total_money, order.currency)}
                        </p>
                      </td>
                      <td>
                        <div className={`bd-badge ${getStatusBadgeClass(order.payment_status)}`}>
                          {order.payment_status}
                        </div>
                      </td>
                      <td>
                        <div className="bd-button-action">
                          <Link
                            className="bd-default-tooltip view"
                            href={`/orders?orderNumber=${order.order_number}`}
                            title={t('viewDetails')}
                          >
                            <span>
                              <i className="fa-sharp fa-light fa-eye"></i>
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bd-basic-pagination d-flex align-items-center justify-content-center mt-30">
                <nav>
                  <ul>
                    {/* Previous Button */}
                    {pagination.hasPrevious && (
                      <li>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          className="bd-pagination-link"
                        >
                          <i className="fa-regular fa-angle-left"></i>
                        </button>
                      </li>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page}>
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`bd-pagination-link ${
                            page === pagination.currentPage ? 'active' : ''
                          }`}
                        >
                          <span>{page}</span>
                        </button>
                      </li>
                    ))}

                    {/* Next Button */}
                    {pagination.hasNext && (
                      <li>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          className="bd-pagination-link"
                        >
                          <i className="fa-regular fa-angle-right"></i>
                        </button>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            )}

            {/* Order Summary */}
            <div className="mt-4">
              <p className="text-muted">
                {t('showingOrders', {
                  count: orders.length,
                  total: pagination.totalElements,
                })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentOrdersMain;
