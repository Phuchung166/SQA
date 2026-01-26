import Link from 'next/link';
import React from 'react';
import emtyImg from '../../../../public/assets/images/shop/empty-cart.webp';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { CartItem, removeCartItem } from '@/redux/slices/cartSlice';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface HeaderCartProps {
  setOpenCart: (isOpen: boolean) => void;
  openCart: boolean;
}

const SidebarCart: React.FC<HeaderCartProps> = ({ openCart, setOpenCart }) => {
  const dispatch = useAppDispatch();
  const t = useTranslations('Cart');
  const handleRemoveCart = (product: CartItem) => {
    dispatch(removeCartItem(product.id));
  };
  const cartProducts = useAppSelector((state: RootState) => state.cart.cartProducts);

  const totalPrice = cartProducts.reduce(
    (total, product) => total + (product.price ?? 0) * (product.quantity ?? 0),
    0,
  );

  // Determine currency (assuming all items have same currency)
  const currency = cartProducts.length > 0 ? cartProducts[0].currency : 'VND';

  // Format total price based on currency
  const formattedTotal =
    currency === 'VND' ? `${totalPrice.toLocaleString('vi-VN')}₫` : `$${totalPrice.toFixed(2)}`;

  return (
    <>
      <div className={`bd-sidebar-cart-area ${openCart ? 'bd-sidebar-cart-opened' : ''}`}>
        <div className="bd-sidebar-cart-wrapper d-flex justify-content-between flex-column">
          <div className="bd-sidebar-cart-top-wrapper">
            <div className="bd-sidebar-cart-top p-relative">
              <div className="bd-sidebar-cart-top-title">
                <h5>{t('shoppingCart')}</h5>
              </div>
              <div className="bd-sidebar-cart-close">
                <button
                  onClick={() => setOpenCart(false)}
                  type="button"
                  className="bd-sidebar-cart-close-btn cartmini-close-btn"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
            <div className="bd-sidebar-cart-widget">
              {cartProducts.length > 0 ? (
                cartProducts.map(item => {
                  const courseLink =
                    item.course_type === 'GROUP'
                      ? `/course-program/${item.slug}`
                      : `/course-details/${item.slug}`;

                  // Format price based on currency
                  const formattedPrice =
                    item.currency === 'VND'
                      ? `${Number(item.price || 0).toLocaleString('vi-VN')}₫`
                      : `$${Number(item.price || 0).toFixed(2)}`;

                  return (
                    <div className="bd-sidebar-cart-widget-item" key={item.id}>
                      <div className="bd-sidebar-cart-content">
                        <h5 className="bd-sidebar-cart-title">
                          <Link href={courseLink}>{item.title}</Link>
                        </h5>
                        <div className="bd-sidebar-cart-price-wrapper">
                          <span className="bd-sidebar-cart-price">{formattedPrice}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCart(item)}
                        className="bd-sidebar-cart-del"
                        style={{
                          background: 'transparent',
                          border: '1px solid #e5e7eb',
                          color: '#6b7280',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.borderColor = '#ef4444';
                          e.currentTarget.style.background = '#fef2f2';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.color = '#6b7280';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div
                  className={`bd-sidebar-cart-empty text-center ${cartProducts.length === 0 ? '' : 'd-none'}`}
                >
                  <Image src={emtyImg} style={{ width: '100%', height: 'auto' }} alt="Empty Cart" />
                  <p>{t('yourCartEmpty')}</p>
                  <Link href="/" className="bd-btn btn-primary">
                    {t('viewCart') || 'Go to Shop'}
                  </Link>
                </div>
              )}
            </div>
          </div>
          {cartProducts.length > 0 && (
            <div className="bd-sidebar-cart-checkout">
              <div
                className="bd-sidebar-cart-checkout-title mb-30"
                style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '20px',
                }}
              >
                <h5
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '-0.3px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {t('subtotal')}:
                </h5>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#0e9f6e',
                    letterSpacing: '-0.5px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {formattedTotal}
                </span>
              </div>
              <div className="bd-sidebar-cart-checkout-btn">
                <Link
                  className="bd-btn btn-primary w-100"
                  href="/cart"
                  style={{
                    padding: '14px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    letterSpacing: '0.3px',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {t('viewCart')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        onClick={() => setOpenCart(false)}
        className={`body-overlay ${openCart ? 'opened' : ''}`}
      ></div>
    </>
  );
};

export default SidebarCart;
