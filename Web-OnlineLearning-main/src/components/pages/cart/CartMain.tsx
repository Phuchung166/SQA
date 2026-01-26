'use client';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import React from 'react';
import CardCheckout from './CardCheckout';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { CartItem, removeCartItem, clearCartOnServer } from '@/redux/slices/cartSlice';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { formatCurrency } from '@/utils/HelperUtils';

const CartMain = () => {
  const dispatch = useAppDispatch();
  const t = useTranslations('Cart');
  const cartProducts = useAppSelector((state: RootState) => state.cart.cartProducts);

  // Debug log
  console.log('CartMain cartProducts:', cartProducts);
  console.log(
    'Standalone items:',
    cartProducts.filter(item => item.course_type === 'STANDALONE'),
  );
  console.log(
    'Group items:',
    cartProducts.filter(item => item.course_type === 'GROUP'),
  );

  const removeAllProduct = () => {
    // Clear all items on server and update state
    dispatch(clearCartOnServer());
  };
  const handleDelteProduct = (product: CartItem) => {
    dispatch(removeCartItem(product.id));
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('shoppingCart')} />
      {/* -- Cart area start -- */}

      {cartProducts.length === 0 && (
        <div className="container">
          <div className="empty-text pt-100 pb-100 text-center">
            <h3>{t('yourCartEmpty')}</h3>
          </div>
        </div>
      )}
      {cartProducts.length >= 1 && (
        <section className="bd-shop-details-area section-space">
          <div className="container">
            <div className="row gy-30">
              <div className="col-xl-9 col-lg-8 wow bdFadeInLeft" data-wow-delay=".3s">
                {/* Regular Courses Table */}
                {cartProducts.some(item => item.course_type === 'STANDALONE') && (
                  <div className="bd-cart-list mb-25 mr-30">
                    <h4 className="mb-20">{t('courses') || 'Courses'}</h4>
                    <div className="shop-table-content table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th className="cart-table-header">{t('product') || 'Product'}</th>
                            <th>{t('unitPrice')}</th>
                            <th>{t('quantity')}</th>
                            <th>{t('remove')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartProducts.map((item, index) => {
                            if (item.course_type !== 'STANDALONE') return null;

                            const courseLink = `/course-details/${item.slug}`;

                            return (
                              <tr key={index}>
                                <td>
                                  <Link href={courseLink}>{item?.title}</Link>
                                </td>
                                <td>{formatCurrency(item.price || 0)} VND</td>
                                <td>
                                  <div className="bd-product-quantity">
                                    <span className="bd-product-quantity-static">1</span>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleDelteProduct(item)}
                                    className="remove-cart-btn"
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                    <span>{t('remove')}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Group Courses Table */}
                {cartProducts.some(item => item.course_type === 'GROUP') && (
                  <div className="bd-cart-list mb-25 mr-30">
                    <h4 className="mb-20">{t('groupCourses') || 'Group Courses'}</h4>
                    <div className="shop-table-content table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th className="cart-table-header">{t('product') || 'Product'}</th>
                            <th>{t('unitPrice')}</th>
                            <th>{t('quantity')}</th>
                            <th>{t('remove')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartProducts.map((item, index) => {
                            if (item.course_type !== 'GROUP') return null;

                            const courseLink = `/course-program/${item.slug}`;

                            return (
                              <tr key={index}>
                                <td>
                                  <Link href={courseLink}>{item?.title}</Link>
                                </td>
                                <td>{formatCurrency(item.price || 0)} VND</td>
                                <td>
                                  <div className="bd-product-quantity">
                                    <span className="bd-product-quantity-static">1</span>
                                  </div>
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleDelteProduct(item)}
                                    className="remove-cart-btn"
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                    <span>{t('remove')}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="bd-cart-bottom mr-30">
                  <div className="row gy-30 align-items-end">
                    <div className="col-xl-12 col-md-12">
                      <div className="bd-cart-update text-md-end">
                        <button type="submit" className="clear-cart-btn" onClick={removeAllProduct}>
                          <i className="fa-solid fa-trash-can"></i>
                          <span>{t('clearCart')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6">
                <CardCheckout />
              </div>
            </div>
          </div>
        </section>
      )}
      {/* -- Cart area end -- */}
    </>
  );
};

export default CartMain;
