import React from 'react';
import { useTranslations } from 'next-intl';

const CartCouponCodeForm = () => {
  const t = useTranslations('coupon');
  return (
    <>
      <form action="#">
        <div className="bd-cart-coupon-input-box">
          <label>{t('label')}</label>
          <div className="bd-cart-coupon-input d-flex flex-wrap gap-30 align-items-center">
            <input type="text" placeholder={t('placeholder')} />
            <button type="submit" className="bd-btn btn-primary">
              {t('apply')}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default CartCouponCodeForm;
