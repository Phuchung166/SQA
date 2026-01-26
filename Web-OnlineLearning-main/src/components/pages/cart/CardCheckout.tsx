'use client';
import { RootState } from '@/redux/store';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { createOrder, checkPrice } from '@/services/orderService';
import { toast } from 'sonner';
import Image from 'next/image';
import { App } from 'antd';
import { formatCurrency } from '@/utils/HelperUtils';

const CardCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const cartProducts = useSelector((state: RootState) => state.cart.cartProducts);
  const t = useTranslations('Cart');
  const { modal } = App.useApp();

  // Get currency from first product, default to VND
  const currency = cartProducts[0]?.currency || 'VND';

  const totalPrice = cartProducts.reduce((total, product) => {
    if (typeof product.price === 'number' && product.price !== 0) {
      return total + (product.price ?? 0) * (product.quantity ?? 0);
    }
    return total;
  }, 0);

  const handleCheckout = async () => {
    if (cartProducts.length === 0) {
      toast.error(t('emptyCartError'));
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare cart items for order
      const cart_item_list = cartProducts.map(item => {
        if (item.course_type === 'GROUP') {
          return { course_group_id: item.course_id };
        } else {
          return { course_id: item.course_id };
        }
      });

      // Check price first to see enrolled courses
      const checkPriceData = {
        total_money: totalPrice,
        cart_item_list,
      };

      const priceCheckResponse = await checkPrice(checkPriceData);
      console.log('Price check response:', priceCheckResponse);
      const enrolledCourses = priceCheckResponse.course_enrolled_responses || [];

      if (enrolledCourses.length > 0) {
        // Show modal with enrolled courses
        modal.confirm({
          title: t('enrolledCoursesTitle'),
          okText: t('continueCheckout'),
          cancelText: t('cancel'),
          width: 600,
          content: (
            <div>
              <p className="mb-3">{t('enrolledCoursesMessage')}</p>
              <div className="enrolled-courses-container">
                <div className="enrolled-courses-list">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="enrolled-course-item">
                      {course.image && (
                        <img src={course.image} alt={course.title} className="course-image" />
                      )}
                      <div className="course-info">
                        <p className="course-title">{course.title}</p>
                        <p className="course-price">
                          {t('price')}: {formatCurrency(course.price)} {currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="total-price-summary">
                <p className="total-text">
                  <strong>{t('totalToPay')}:</strong>{' '}
                  {formatCurrency(priceCheckResponse.total_money || totalPrice)} {currency}
                </p>
              </div>
            </div>
          ),
          onOk: async () => {
            // User confirmed - proceed with order creation
            const orderResponse = await createOrder({
              total_money: priceCheckResponse.total_money || totalPrice,
              cart_item_list,
            });

            // Show success message
            toast.success(t('orderCreated'));

            // Redirect to payment URL
            if (orderResponse.payment_response?.payment_url) {
              toast.info(t('redirectingToPayment'));
              window.location.href = orderResponse.payment_response.payment_url;
            } else {
              toast.error(t('paymentUrlNotAvailable'));
            }
          },
          onCancel: () => {
            // User cancelled
            console.log('User cancelled checkout');
            setIsProcessing(false);
          },
        });
      } else {
        // No enrolled courses - proceed directly with order
        const orderResponse = await createOrder({
          total_money: totalPrice,
          cart_item_list,
        });

        // Show success message
        toast.success(t('orderCreated'));

        // Redirect to payment URL
        if (orderResponse.payment_response?.payment_url) {
          toast.info(t('redirectingToPayment'));
          window.location.href = orderResponse.payment_response.payment_url;
        } else {
          toast.error(t('paymentUrlNotAvailable'));
        }
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || t('orderCreateFailed'));
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <>
      <div className="bd-cart-checkout-wrapper wow bdFadeInRight" data-wow-delay=".4s">
        {/* Order Summary Header */}
        <div
          className="bd-cart-checkout-header mb-25"
          style={{
            borderBottom: '2px solid #0e9f6e',
            paddingBottom: '15px',
          }}
        >
          <h5
            className="mb-0"
            style={{
              fontWeight: '700',
              fontSize: '20px',
              color: '#1f2937',
              letterSpacing: '-0.5px',
            }}
          >
            <i className="fa-solid fa-receipt me-2" style={{ color: '#0e9f6e' }}></i>
            {t('orderSummary')}
          </h5>
        </div>

        {/* Items Count */}
        <div className="bd-cart-items-count mb-20">
          <div className="d-flex align-items-center justify-content-between">
            <span
              className="text-muted"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.3px',
              }}
            >
              <i className="fa-solid fa-bag-shopping me-2"></i>
              {cartProducts.length} {cartProducts.length === 1 ? t('item') : t('items')}
            </span>
          </div>
        </div>

        {/* Subtotal */}
        <div
          className="bd-cart-checkout-top d-flex align-items-center justify-content-between mb-20 pb-20"
          style={{ borderBottom: '1px solid #e5e7eb' }}
        >
          <span
            className="bd-cart-checkout-top-title"
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#6b7280',
              letterSpacing: '0.2px',
            }}
          >
            {t('subtotal')}
          </span>
          <span
            className="bd-cart-checkout-top-price"
            style={{
              fontWeight: '700',
              fontSize: '16px',
              color: '#1f2937',
              letterSpacing: '-0.3px',
            }}
          >
            {currency === 'VND' ? `${totalPrice.toLocaleString()} ₫` : `$${totalPrice.toFixed(2)}`}
          </span>
        </div>

        {/* Discount Section (Optional - can be enabled later) */}
        {/* <div className="bd-cart-discount mb-20 pb-20" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-success">
              <i className="fa-solid fa-tag me-2"></i>
              {t('discount')}
            </span>
            <span className="text-success fw-bold">- $0.00</span>
          </div>
        </div> */}

        {/* Total */}
        <div
          className="bd-cart-checkout-total mb-25 pb-25"
          style={{ borderBottom: '2px solid #e5e7eb' }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <span
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                letterSpacing: '-0.3px',
              }}
            >
              {t('total')}
            </span>
            <span
              style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#0e9f6e',
                letterSpacing: '-0.5px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              {currency === 'VND'
                ? `${totalPrice.toLocaleString()} ₫`
                : `$${totalPrice.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Payment Information Alert */}
        <div className="bd-cart-checkout-info mb-25">
          <div
            className="alert alert-info d-flex align-items-start mb-0"
            style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
          >
            <i
              className="fa-solid fa-shield-halved me-3 mt-1"
              style={{ color: '#3b82f6', fontSize: '20px' }}
            ></i>
            <div>
              <strong
                className="d-block mb-1"
                style={{
                  color: '#1e40af',
                  fontSize: '14px',
                  fontWeight: '700',
                  letterSpacing: '0.2px',
                }}
              >
                {t('securePayment')}
              </strong>
              <small
                className="text-muted"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  letterSpacing: '0.1px',
                }}
              >
                {t('paymentInfo')}
              </small>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="bd-cart-checkout-proceed mb-25">
          <button
            className="bd-btn btn-primary w-100"
            onClick={handleCheckout}
            disabled={isProcessing || cartProducts.length === 0}
            style={{
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            <span className="bd-btn-inner">
              <span className="bd-btn-hover d-flex align-items-center justify-content-center">
                {isProcessing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin me-2"></i>
                    <span style={{ letterSpacing: '0.5px' }}>{t('processing')}</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock me-2"></i>
                    <span style={{ letterSpacing: '0.5px' }}>{t('proceedToCheckout')}</span>
                  </>
                )}
              </span>
            </span>
          </button>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-section text-center">
          <p
            className="text-muted small mb-3"
            style={{
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            <i className="fa-solid fa-credit-card me-1"></i>
            {t('acceptedPayments')}
          </p>
          <div className="d-flex justify-content-center">
            <div
              className="payment-badge"
              style={{
                padding: '12px 20px',
                backgroundColor: '#fff',
                border: '2px solid #0e9f6e',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <Image
                src="/assets/images/cart/vnpay_logo.svg"
                alt="VNPay"
                width={80}
                height={24}
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="security-badge text-center mt-20">
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <small
              className="text-muted d-flex align-items-center justify-content-center gap-2"
              style={{
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.3px',
              }}
            >
              <i className="fa-solid fa-check-circle" style={{ color: '#10b981' }}></i>
              {t('ssl128Bit')}
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardCheckout;
