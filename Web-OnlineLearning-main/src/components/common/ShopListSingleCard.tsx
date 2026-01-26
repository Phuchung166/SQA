import { ProductsType } from '@/interFace/interFace';
// Note: Shop products (books, etc.) currently don't support cart functionality
// Cart is designed for Course type only. Consider implementing separate cart for products if needed.
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import GetRating from './GetRating';

interface IShopListProps {
  item: ProductsType;
}

const ShopListSingleCard = ({ item }: IShopListProps) => {
  // Temporarily disabled: Cart only supports Course type
  const handleAddToCart = () => {
    console.warn('Add to cart is not yet implemented for shop products');
    // TODO: Implement separate cart for shop products or convert to Course type
  };
  return (
    <>
      <div className="bd-product-list">
        <div className="bd-product-wrapper">
          <div className="bd-product-thumb text-center">
            <Link href={`/shop/shop-details/${item.id}`}>
              {item.image && <Image src={item.image} alt="image" />}
            </Link>
          </div>
        </div>
        <div className="bd-product-content">
          {item.badge && <div className={`bd-badge ${item.badgeClass} mb-15`}>{item.badge}</div>}
          <h6 className="bd-product-title underline mb-10">{item.title}</h6>
          <div className="bd-product-price mb-10">
            <span className="current-price">{`$${item.price}`}</span>{' '}
            {item.discount ? (
              <>
                <span className="old-price">{`$${item.discount}`}</span>
              </>
            ) : (
              ''
            )}
          </div>
          <span className="bd-product-rating fs-14 d-flex rating-color mb-15">
            {item.rating && <GetRating averageRating={item.rating} />}
          </span>
          <p>{item.description}</p>
          <div className="bd-product-btn">
            <button onClick={handleAddToCart} className="bd-btn btn-primary">
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopListSingleCard;
