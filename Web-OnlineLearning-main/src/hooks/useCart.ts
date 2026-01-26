import { CartItem } from '@/redux/slices/cartSlice';
import { WishlistCourse } from '@/redux/slices/wishlistSlice';
import { useAppSelector } from '@/redux/hooks';

const useCart = () => {
  const cartProducts = useAppSelector(state => state.cart.cartProducts);
  const wishlistProducts = useAppSelector(state => state?.wishlist.wishlistItems);

  // Cart quantity
  const getCartProductQuantity = () => {
    const uniqueProductId = new Set();
    cartProducts.forEach((product: CartItem) => uniqueProductId.add(product.id));
    return uniqueProductId.size;
  };

  // Wishlist quantity
  const getWishlistQuantity = () => {
    const uniqueProductId = new Set();
    wishlistProducts?.forEach((product: WishlistCourse) => uniqueProductId.add(product.id));
    return uniqueProductId.size;
  };

  const getTotalPrice = () => {
    const totalPrice = cartProducts.reduce((total, product) => {
      if (typeof product.price === 'number' && product.price !== 0) {
        return total + (product.price ?? 0) * (product.quantity ?? 0);
      }
      return total;
    }, 0);
    return totalPrice;
  };

  return {
    getCartProductQuantity,
    getWishlistQuantity,
    getTotalPrice,
  };
};

export default useCart;
