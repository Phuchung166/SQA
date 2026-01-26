'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getPreOrderEnrollmentStatus,
  PreOrderEnrollmentStatusResponse,
} from '@/services/courseService';
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

const PreOrderCallbackMain = () => {
  const searchParams = useSearchParams();
  const t = useTranslations('PreOrderCallback');
  const [enrollmentStatus, setEnrollmentStatus] = useState<PreOrderEnrollmentStatusResponse | null>(
    null,
  );
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
    const fetchEnrollmentStatus = async () => {
      // Get payment ID from URL parameters
      let paymentId = searchParams.get('paymentId');

      // If paymentId not found, try VNPay parameter (vnp_TxnRef)
      if (!paymentId) {
        paymentId = searchParams.get('vnp_TxnRef');
      }

      if (!paymentId) {
        setError(t('paymentIdNotFound') || 'Payment ID not found');
        setLoading(false);
        toast.error(t('paymentIdMissing') || 'Payment ID is missing');
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
        const response = await getPreOrderEnrollmentStatus(paymentId);
        setEnrollmentStatus(response);

        // Show toast based on enrollment status
        if (response.status === 'RESERVED') {
          toast.success(t('reservationSuccess') || 'Pre-order reservation successful');
        } else if (response.status === 'PENDING') {
          toast.info(t('reservationPending') || 'Reservation is pending');
        } else if (response.status === 'COMPLETED') {
          toast.success(t('reservationCompleted') || 'Pre-order reservation completed');
        } else if (response.status === 'CANCELLED') {
          toast.warning(t('reservationCancelled') || 'Reservation has been cancelled');
        } else {
          toast.info(t('reservationPending') || 'Checking reservation status');
        }
      } catch (err: any) {
        console.error('Error fetching enrollment status:', err);
        setError(err.message || t('failedToFetchStatus') || 'Failed to fetch enrollment status');
        toast.error(t('failedToFetchStatus') || 'Failed to fetch enrollment status');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentStatus();
  }, [searchParams, t]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'RESERVED':
      case 'COMPLETED':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-danger';
      case 'PENDING':
      default:
        return 'badge-info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESERVED':
      case 'COMPLETED':
        return <i className="fa-solid fa-circle-check"></i>;
      case 'CANCELLED':
        return <i className="fa-solid fa-circle-xmark"></i>;
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
                  <span className="visually-hidden">{t('loading') || 'Loading'}</span>
                </div>
                <h4 className="mt-3">
                  {t('processingReservation') || 'Processing your pre-order reservation'}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !enrollmentStatus) {
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
                <h3 className="mb-3">{t('reservationNotFound') || 'Reservation Not Found'}</h3>
                <p className="mb-4">
                  {error ||
                    t('unableToRetrieveReservation') ||
                    'Unable to retrieve reservation details'}
                </p>
                <Link href="/" className="bd-btn btn-primary">
                  <span className="bd-btn-inner">
                    <span className="bd-btn-normal">{t('goToHomepage') || 'Go to Homepage'}</span>
                    <span className="bd-btn-hover">{t('goToHomepage') || 'Go to Homepage'}</span>
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
              {/* Reservation Status Header */}
              <div className="text-center mb-40">
                <div className="mb-4">
                  <span
                    style={{
                      fontSize: '64px',
                      color:
                        enrollmentStatus.status === 'RESERVED' ||
                        enrollmentStatus.status === 'COMPLETED'
                          ? '#28a745'
                          : enrollmentStatus.status === 'CANCELLED'
                            ? '#dc3545'
                            : '#ffc107',
                    }}
                  >
                    {getStatusIcon(enrollmentStatus.status)}
                  </span>
                </div>
                <h2 className="mb-3">
                  {enrollmentStatus.status === 'RESERVED' &&
                    (t('statusReserved') || 'Reservation Confirmed')}
                  {enrollmentStatus.status === 'COMPLETED' &&
                    (t('statusCompleted') || 'Pre-order Completed')}
                  {enrollmentStatus.status === 'CANCELLED' &&
                    (t('statusCancelled') || 'Reservation Cancelled')}
                  {enrollmentStatus.status === 'PENDING' &&
                    (t('statusPending') || 'Reservation Pending')}
                </h2>
                <p className="text-muted">
                  {t('slotNumber') || 'Slot Number'}: {enrollmentStatus.slotNumber}
                </p>
              </div>

              {/* Enrollment Details */}
              <div className="bd-dashboard-table table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td>
                        <strong>{t('slotNumber') || 'Slot Number'}</strong>
                      </td>
                      <td>{enrollmentStatus.slotNumber}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('preOrderDate') || 'Pre-order Date'}</strong>
                      </td>
                      <td>{new Date(enrollmentStatus.preOrderDate).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('amountPaid') || 'Amount Paid'}</strong>
                      </td>
                      <td>
                        <strong style={{ fontSize: '18px' }}>
                          {enrollmentStatus.pricePaid.toLocaleString()} VND
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('reservationStatus') || 'Reservation Status'}</strong>
                      </td>
                      <td>
                        <span
                          className={`bd-badge ${getStatusBadgeClass(enrollmentStatus.status)}`}
                        >
                          {enrollmentStatus.status}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('paymentId') || 'Payment ID'}</strong>
                      </td>
                      <td>{enrollmentStatus.paymentId}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('createdAt') || 'Created At'}</strong>
                      </td>
                      <td>{new Date(enrollmentStatus.created_at).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>{t('updatedAt') || 'Updated At'}</strong>
                      </td>
                      <td>{new Date(enrollmentStatus.updated_at).toLocaleString()}</td>
                    </tr>

                    {/* VNPay Transaction Details */}
                    {vnpayParams.vnp_TransactionNo && (
                      <>
                        <tr>
                          <td colSpan={2} className="bg-light">
                            <strong>
                              {t('paymentGatewayDetails') || 'Payment Gateway Details'}
                            </strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <strong>{t('transactionNo') || 'Transaction No'}</strong>
                          </td>
                          <td>{vnpayParams.vnp_TransactionNo}</td>
                        </tr>
                        {vnpayParams.vnp_BankCode && (
                          <tr>
                            <td>
                              <strong>{t('bankCode') || 'Bank Code'}</strong>
                            </td>
                            <td>{vnpayParams.vnp_BankCode}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_BankTranNo && (
                          <tr>
                            <td>
                              <strong>{t('bankTransactionNo') || 'Bank Transaction No'}</strong>
                            </td>
                            <td>{vnpayParams.vnp_BankTranNo}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_CardType && (
                          <tr>
                            <td>
                              <strong>{t('paymentMethod') || 'Payment Method'}</strong>
                            </td>
                            <td>{vnpayParams.vnp_CardType}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_PayDate && (
                          <tr>
                            <td>
                              <strong>{t('paymentDate') || 'Payment Date'}</strong>
                            </td>
                            <td>{formatVNPayDate(vnpayParams.vnp_PayDate)}</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_Amount && (
                          <tr>
                            <td>
                              <strong>{t('transactionAmount') || 'Transaction Amount'}</strong>
                            </td>
                            <td>{parseInt(vnpayParams.vnp_Amount).toLocaleString()} VND</td>
                          </tr>
                        )}
                        {vnpayParams.vnp_ResponseCode && (
                          <tr>
                            <td>
                              <strong>{t('responseCode') || 'Response Code'}</strong>
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

              {/* Action Buttons */}
              <div className="text-center mt-40">
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  {(enrollmentStatus.status === 'RESERVED' ||
                    enrollmentStatus.status === 'COMPLETED') && (
                    <Link href="/student-enrolled-courses" className="bd-btn btn-primary">
                      <span className="bd-btn-inner">
                        <span className="bd-btn-normal">{t('myCourses') || 'My Courses'}</span>
                      </span>
                    </Link>
                  )}

                  {enrollmentStatus.status === 'CANCELLED' && (
                    <Link href="/" className="bd-btn btn-outline-primary">
                      <span className="bd-btn-inner">
                        <span className="bd-btn-normal">{t('backHome') || 'Back Home'}</span>
                      </span>
                    </Link>
                  )}

                  <Link href="/" className="bd-btn btn-outline-secondary">
                    <span className="bd-btn-inner">
                      <span className="bd-btn-normal">{t('goToHomepage') || 'Go to Homepage'}</span>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Additional Information */}
              {(enrollmentStatus.status === 'RESERVED' ||
                enrollmentStatus.status === 'COMPLETED') && (
                <div className="alert alert-success mt-4" role="alert">
                  <i className="fa-solid fa-circle-info me-2"></i>
                  {t('successMessage') ||
                    'Your pre-order reservation has been confirmed. You can now access the course materials.'}
                </div>
              )}

              {enrollmentStatus.status === 'PENDING' && (
                <div className="alert alert-info mt-4" role="alert">
                  <i className="fa-solid fa-clock me-2"></i>
                  {t('pendingMessage') ||
                    'Your reservation is being processed. Please wait for confirmation.'}
                </div>
              )}

              {enrollmentStatus.status === 'CANCELLED' && (
                <div className="alert alert-warning mt-4" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {t('cancelledMessage') ||
                    'Your reservation has been cancelled. Please contact support for more information.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreOrderCallbackMain;
