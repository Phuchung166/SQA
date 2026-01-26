'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCartForUser, clear_cart_local } from '@/redux/slices/cartSlice';
import { selectIsLoggedIn, selectToken } from '@/redux/slices/authSlice';

const CART_FETCHED_KEY = 'cart_fetched_for_session';

/**
 * CartInitializer Component
 *
 * Responsible for loading cart data from the server when the user is logged in.
 * - Only fetches cart ONCE per login session (not on every F5/refresh)
 * - Clears cart when user logs out
 * - Clears cart on 401/403 errors (token expired)
 */
export const CartInitializer = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const token = useAppSelector(selectToken);
  const prevIsLoggedInRef = useRef<boolean>(false);
  const prevTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const wasLoggedIn = prevIsLoggedInRef.current;
    const prevToken = prevTokenRef.current;

    // Case 1: User just logged in (transition from not logged in to logged in)
    if (!wasLoggedIn && isLoggedIn) {
      console.log('CartInitializer: User just logged in, fetching cart...');

      // Clear the flag and fetch fresh cart
      localStorage.removeItem(CART_FETCHED_KEY);
      dispatch(fetchCartForUser({ page: 1, pageSize: 100 }))
        .unwrap()
        .then(() => {
          // Mark cart as fetched for this session
          localStorage.setItem(CART_FETCHED_KEY, 'true');
        })
        .catch(error => {
          // Handle 401/403 errors - token invalid/expired
          if (error?.status === 401 || error?.status === 403) {
            console.log('CartInitializer: Token expired, clearing cart');
            dispatch(clear_cart_local());
            localStorage.removeItem(CART_FETCHED_KEY);
          }
        });
    }

    // Case 2: User just logged out (transition from logged in to not logged in)
    else if (wasLoggedIn && !isLoggedIn) {
      console.log('CartInitializer: User logged out, clearing cart...');
      dispatch(clear_cart_local());
      localStorage.removeItem(CART_FETCHED_KEY);
    }

    // Case 3: Token changed (possible token refresh or re-login)
    else if (isLoggedIn && prevToken && token && prevToken !== token) {
      console.log('CartInitializer: Token changed, re-fetching cart...');
      localStorage.removeItem(CART_FETCHED_KEY);
      dispatch(fetchCartForUser({ page: 1, pageSize: 100 }))
        .unwrap()
        .then(() => {
          localStorage.setItem(CART_FETCHED_KEY, 'true');
        })
        .catch(error => {
          if (error?.status === 401 || error?.status === 403) {
            dispatch(clear_cart_local());
            localStorage.removeItem(CART_FETCHED_KEY);
          }
        });
    }

    // Case 4: User is already logged in and cart hasn't been fetched yet
    // This handles page refreshes - only fetch if not already fetched
    else if (isLoggedIn && !localStorage.getItem(CART_FETCHED_KEY)) {
      console.log('CartInitializer: Cart not fetched yet, fetching...');
      dispatch(fetchCartForUser({ page: 1, pageSize: 100 }))
        .unwrap()
        .then(() => {
          localStorage.setItem(CART_FETCHED_KEY, 'true');
        })
        .catch(error => {
          if (error?.status === 401 || error?.status === 403) {
            dispatch(clear_cart_local());
            localStorage.removeItem(CART_FETCHED_KEY);
          }
        });
    }

    // Update refs for next render
    prevIsLoggedInRef.current = isLoggedIn;
    prevTokenRef.current = token;
  }, [isLoggedIn, token, dispatch]);

  return null; // This component doesn't render anything
};

export default CartInitializer;
