'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getOrderStatus,
  getOrderDetail,
  OrderStatusResponse,
  OrderDetailResponse,
} from '@/services/orderService';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// VNPay response parameters interface
interface VNPayParams {
  vnp_Amount?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo?: string;
  vnp_PayDate?: string;
  vnp_ResponseCode?: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef?: string;
}

const OrderCallbackMain = () => {
  const searchParams = useSearchParams();
  const t = useTranslations('OrderCallback');
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
  const [_orderDetail, setOrderDetail] = useState<OrderDetailResponse | null>(null);
  const [vnpayParams, setVnpayParams] = useState<VNPayParams>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format VNPay date (yyyyMMddHHmmss)
  const formatVNPayDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 14) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Helper function to get VNPay response message
  const getVNPayResponseMessage = (code: string) => {
    const messages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá giới hạn giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác',
    };
    return messages[code] || 'Unknown response code';
  };

  useEffect(() => {
    const fetchOrderStatus = async () => {
      // Get order number from URL parameters
      // Support both 'orderNumber' and 'vnp_TxnRef' (VNPay callback)
      let orderNumber = searchParams.get('orderNumber');

      // If orderNumber not found, try VNPay parameter
      if (!orderNumber) {
        orderNumber = searchParams.get('vnp_TxnRef');
      }

      if (!orderNumber) {
        setError(t('orderNumberNotFound'));
        setLoading(false);
        toast.error(t('orderNumberMissing'));
        return;
      }

      // Extract VNPay parameters if available
      const vnpay: VNPayParams = {
        vnp_Amount: searchParams.get('vnp_Amount') || undefined,
        vnp_BankCode: searchParams.get('vnp_BankCode') || undefined,
        vnp_BankTranNo: searchParams.get('vnp_BankTranNo') || undefined,
        vnp_CardType: searchParams.get('vnp_CardType') || undefined,
        vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || undefined,
        vnp_PayDate: searchParams.get('vnp_PayDate') || undefined,
        vnp_ResponseCode: searchParams.get('vnp_ResponseCode') || undefined,
        vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || undefined,
        vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus') || undefined,
        vnp_TxnRef: searchParams.get('vnp_TxnRef') || undefined,
      };
      setVnpayParams(vnpay);

      try {
        setLoading(true);
        const response = await getOrderStatus(orderNumber);
        setOrderStatus(response);

        // Fetch order detail
        const detail = await getOrderDetail(orderNumber);
        setOrderDetail(detail);

        // Show toast based on payment status
        if (response.paymentStatus === 'SUCCESS') {
          toast.success(t('paymentSuccess'));
        } else if (response.paymentStatus === 'FAILED') {
          toast.error(t('paymentFailed'));
        } else if (response.paymentStatus === 'CANCELLED') {
          toast.warning(t('paymentCancelled'));
        } else if (response.paymentStatus === 'EXPIRED') {
          toast.error(t('paymentExpired'));
        } else if (response.paymentStatus === 'REFUND_REQUESTED') {
          toast.info(t('refundRequested'));
        } else if (response.paymentStatus === 'REFUND_SUCCESS') {
          toast.success(t('refundSuccess'));
        } else if (response.paymentStatus === 'REFUND_FAILED') {
          toast.error(t('refundFailed'));
        } else {
          toast.info(t('paymentPending'));
        }
      } catch (err: any) {
        console.error('Error fetching order status:', err);
        setError(err.message || t('failedToFetchOrder'));
        toast.error(t('failedToFetchOrder'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [searchParams, t]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'REFUND_SUCCESS':
        return <i className="fa-solid fa-circle-check"></i>;
      case 'FAILED':
      case 'REFUND_FAILED':
        return <i className="fa-solid fa-circle-xmark"></i>;
      case 'CANCELLED':
      case 'EXPIRED':
        return <i className="fa-solid fa-ban"></i>;
      case 'REFUND_REQUESTED':
        return <i className="fa-solid fa-rotate-left"></i>;
      case 'PENDING':
      default:
        return <i className="fa-solid fa-clock"></i>;
    }
  };

  if (loading) {
    return (
      <section className="bd-cart-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bd-cart-inner text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t('loading')}</span>
                </div>
                <h4 className="mt-3">{t('processingOrder')}</h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !orderStatus) {
    return (
      <section className="bd-cart-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bd-cart-inner text-center py-5">
                <div className="mb-4">
                  <i
                    className="fa-solid fa-circle-exclamation text-danger"
                    style={{ fontSize: '64px' }}
                  ></i>
                </div>
                <h3 className="mb-3">{t('orderNotFound')}</h3>
                <p className="mb-4">{error || t('unableToRetrieveOrder')}</p>
                <Link href="/" className="bd-btn btn-primary">
                  <span className="bd-btn-inner">
                    <span className="bd-btn-normal">{t('goToHomepage')}</span>
                    <span className="bd-btn-hover">{t('goToHomepage')}</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bd-cart-area section-space">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="bd-cart-inner">
              {/* Order Status Header */}
              <div className="text-center mb-40">
                <div className="mb-4">
                  <span
                    style={{
                      fontSize: '64px',
                      color:
                        orderStatus.paymentStatus === 'SUCCESS'
                          ? '#28a745'
                          : orderStatus.paymentStatus === 'FAILED' ||
                              orderStatus.paymentStatus === 'REFUND_FAILED'
                            ? '#dc3545'
                            : '#ffc107',
                    }}
                  >
                    {getStatusIcon(orderStatus.paymentStatus)}
                  </span>
                </div>
                <h2 className="mb-3">
                  {orderStatus.paymentStatus === 'SUCCESS' && t('statusSuccess')}
                  {orderStatus.paymentStatus === 'FAILED' && t('statusFailed')}
                  {orderStatus.paymentStatus === 'CANCELLED' && t('statusCancelled')}
                  {orderStatus.paymentStatus === 'EXPIRED' && t('statusExpired')}
                  {orderStatus.paymentStatus === 'PENDING' && t('statusPending')}
                  {orderStatus.paymentStatus === 'REFUND_REQUESTED' && t('statusRefundRequested')}
                  {orderStatus.paymentStatus === 'REFUND_SUCCESS' && t('statusRefundSuccess')}
                  {orderStatus.paymentStatus === 'REFUND_FAILED' && t('statusRefundFailed')}
                </h2>
                <p className="text-muted">
                  {t('orderNumberLabel')} {orderStatus.orderNumber}
                </p>
              </div>

              {/* Order Details */}
              <div className="bd-dashboard-table table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td>
                        <strong>{t('orderNumber')}</strong>
                      </td>
                      <td>{orderStatus.orderNumber}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('orderDate')}</strong>
                      </td>
                      <td>{new Date(orderStatus.orderDate).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('totalAmount')}</strong>
                      </td>
                      <td>
                        <strong style={{ fontSize: '18px' }}>
                          {orderStatus.currency === 'VND'
                            ? `${orderStatus.totalMoney.toLocaleString()} VND`
                            : `$${orderStatus.totalMoney.toFixed(2)}`}
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('paymentStatus')}</strong>
                      </td>
                      <td>
                        <span
                          className={`bd-badge ${getStatusBadgeClass(orderStatus.paymentStatus)}`}
                        >
                          {orderStatus.paymentStatus}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('currency')}</strong>
                      </td>
                      <td>{orderStatus.currency}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('lastUpdated')}</strong>
                      </td>
                      <td>{new Date(orderStatus.updated_at).toLocaleString()}</td>
                    </tr>

                    {/* VNPay Transaction Details */}
                    {vnpayParams.vnp_TransactionNo && (
                      <>
                        <tr>
                          <td colSpan={2} className="bg-light">
                            <strong>{t('paymentGatewayDetails')}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>{t('transactionNo')}</strong>
                          </td>
                          <td>{vnpayParams.vnp_TransactionNo}</td>
                        </tr>
                        {vnpayParams.vnp_BankCode && (
                          <tr>
                            <td>
                              <strong>{t('bankCode')}</strong>
                            </td>
                            <td>{vnpayParams.vnp_BankCode}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_BankTranNo && (
                          <tr>
                            <td>
                              <strong>{t('bankTransactionNo')}</strong>
                            </td>
                            <td>{vnpayParams.vnp_BankTranNo}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_CardType && (
                          <tr>
                            <td>
                              <strong>{t('paymentMethod')}</strong>
                            </td>
                            <td>{vnpayParams.vnp_CardType}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_PayDate && (
                          <tr>
                            <td>
                              <strong>{t('paymentDate')}</strong>
                            </td>
                            <td>{formatVNPayDate(vnpayParams.vnp_PayDate)}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_ResponseCode && (
                          <tr>
                            <td>
                              <strong>{t('responseCode')}</strong>
                            </td>
                            <td>
                              <span
                                className={
                                  vnpayParams.vnp_ResponseCode === '00'
                                    ? 'text-success'
                                    : 'text-danger'
                                }
                              >
                                {vnpayParams.vnp_ResponseCode} -{' '}
                                {getVNPayResponseMessage(vnpayParams.vnp_ResponseCode)}
                              </span>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Items - Course List */}
              {_orderDetail && _orderDetail.order_items && _orderDetail.order_items.length > 0 && (
                <div className="mt-40">
                  <h4 className="mb-20">{t('orderItems')}</h4>
                  <div className="bd-dashboard-table table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>{t('thumbnail')}</th>
                          <th>{t('courseName')}</th>
                          <th>{t('courseType')}</th>
                          <th className="text-end">{t('price')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {_orderDetail.order_items.map((item, index) => (
                          <tr key={index}>
                            <td style={{ width: '100px' }}>
                              {item.thumbnail ? (
                                <Image
                                  src={item.thumbnail}
                                  alt={item.course_title}
                                  width={80}
                                  height={60}
                                  style={{
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '80px',
                                    height: '60px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <i className="fas fa-book text-muted"></i>
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{item.course_title}</strong>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  item.course_type === 'STANDALONE' ? 'bg-primary' : 'bg-success'
                                }`}
                              >
                                {item.course_type === 'STANDALONE'
                                  ? t('standalone')
                                  : t('groupCourse')}
                              </span>
                            </td>
                            <td className="text-end">
                              <strong>
                                {orderStatus?.currency === 'VND'
                                  ? `${item.course_price.toLocaleString()} ₫`
                                  : `$${item.course_price.toFixed(2)}`}
                              </strong>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-light">
                          <td colSpan={3} className="text-end">
                            <strong>{t('totalAmount')}:</strong>
                          </td>
                          <td className="text-end">
                            <strong style={{ fontSize: '18px', color: '#28a745' }}>
                              {orderStatus?.currency === 'VND'
                                ? `${_orderDetail.total_money.toLocaleString()} ₫`
                                : `$${_orderDetail.total_money.toFixed(2)}`}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="text-center mt-40">
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link href="/student-orders" className="bd-btn btn-primary">
                    <span className="bd-btn-inner">
                      <span className="bd-btn-normal">{t('viewMyOrders')}</span>
                    </span>
                  </Link>

                  {orderStatus.paymentStatus === 'SUCCESS' && (
                    <Link href="/student-enrolled-courses" className="bd-btn btn-outline-primary">
                      <span className="bd-btn-inner">
                        <span className="bd-btn-normal">{t('myCourses')}</span>
                      </span>
                    </Link>
                  )}

                  {(orderStatus.paymentStatus === 'FAILED' ||
                    orderStatus.paymentStatus === 'CANCELLED' ||
                    orderStatus.paymentStatus === 'EXPIRED') && (
                    <Link href="/cart" className="bd-btn btn-outline-primary">
                      <span className="bd-btn-inner">
                        <span className="bd-btn-normal">{t('backToCart')}</span>
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {orderStatus.paymentStatus === 'SUCCESS' && (
                <div className="alert alert-success mt-4" role="alert">
                  <i className="fa-solid fa-circle-info me-2"></i>
                  {t('successMessage')}
                </div>
              )}

              {orderStatus.paymentStatus === 'PENDING' && (
                <div className="alert alert-info mt-4" role="alert">
                  <i className="fa-solid fa-clock me-2"></i>
                  {t('pendingMessage')}
                </div>
              )}

              {(orderStatus.paymentStatus === 'FAILED' ||
                orderStatus.paymentStatus === 'CANCELLED' ||
                orderStatus.paymentStatus === 'EXPIRED') && (
                <div className="alert alert-warning mt-4" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {t('failureMessage')}
                </div>
              )}

              {orderStatus.paymentStatus === 'REFUND_REQUESTED' && (
                <div className="alert alert-info mt-4" role="alert">
                  <i className="fa-solid fa-rotate-left me-2"></i>
                  {t('refundRequestedMessage')}
                </div>
              )}

              {orderStatus.paymentStatus === 'REFUND_SUCCESS' && (
                <div className="alert alert-success mt-4" role="alert">
                  <i className="fa-solid fa-circle-check me-2"></i>
                  {t('refundSuccessMessage')}
                </div>
              )}

              {orderStatus.paymentStatus === 'REFUND_FAILED' && (
                <div className="alert alert-danger mt-4" role="alert">
                  <i className="fa-solid fa-circle-xmark me-2"></i>
                  {t('refundFailedMessage')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderCallbackMain;
