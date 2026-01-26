'use client';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import * as cartService from '@/services/cartService';
import type { CartItemResponse } from '@/services/cartService';
import { ensureCourseType } from '@/services/cartService';
import { selectIsLoggedIn } from './authSlice';

// i18n messages
const MESSAGES = {
  PLEASE_LOGIN_ADD_COURSE: {
    en: 'Please log in to add courses to cart',
    vi: 'Vui lòng đăng nhập để thêm khóa học vào giỏ hàng',
  },
  PLEASE_LOGIN_ADD_GROUP_COURSE: {
    en: 'Please log in to add group courses to cart',
    vi: 'Vui lòng đăng nhập để thêm khóa học nhóm vào giỏ hàng',
  },
  PLEASE_LOGIN_MANAGE_CART: {
    en: 'Please log in to manage your cart',
    vi: 'Vui lòng đăng nhập để quản lý giỏ hàng',
  },
  FAILED_FETCH_CART: {
    en: 'Failed to fetch cart',
    vi: 'Không thể tải giỏ hàng',
  },
  FAILED_ADD_COURSE: {
    en: 'Failed to add course to cart',
    vi: 'Không thể thêm khóa học vào giỏ hàng',
  },
  FAILED_ADD_GROUP_COURSE: {
    en: 'Failed to add group course to cart',
    vi: 'Không thể thêm khóa học nhóm vào giỏ hàng',
  },
  FAILED_REMOVE_ITEM: {
    en: 'Failed to remove item from cart',
    vi: 'Không thể xóa mục khỏi giỏ hàng',
  },
  FAILED_CLEAR_CART: {
    en: 'Failed to clear cart',
    vi: 'Không thể xóa giỏ hàng',
  },
  ADDED_TO_CART: {
    en: 'added to cart',
    vi: 'đã được thêm vào giỏ hàng',
  },
  REMOVED_FROM_CART: {
    en: 'Removed from your cart',
    vi: 'Đã xóa khỏi giỏ hàng của bạn',
  },
  CART_CLEARED: {
    en: 'Cart cleared',
    vi: 'Giỏ hàng đã được xóa',
  },
};

// Helper function to get message in current language
const getMessage = (key: keyof typeof MESSAGES, lang: string = 'vi'): string => {
  return MESSAGES[key][lang as keyof (typeof MESSAGES)[typeof key]] || MESSAGES[key].en;
};

// Cart item for Redux state
export interface CartItem {
  id: number; // cart item id
  course_id: number;
  title: string;
  slug: string;
  price: number;
  currency: 'USD' | 'VND';
  course_type: 'GROUP' | 'STANDALONE';
  quantity: number; // Always 1 for courses
}

interface CartState {
  cartProducts: CartItem[];
  loading: boolean;
  error: { message: string; status?: number } | null;
}

const initialState: CartState = {
  cartProducts: [],
  loading: false,
  error: null,
};

// Async thunks to interact with backend cart APIs
export const fetchCartForUser = createAsyncThunk(
  'cart/fetchForUser',
  async (params: { page?: number; pageSize?: number } = { page: 1, pageSize: 100 }, thunkAPI) => {
    // Check if user is logged in
    const state = thunkAPI.getState() as any;
    const isLoggedIn = selectIsLoggedIn(state);

    if (!isLoggedIn) {
      // If not logged in, just return empty cart
      console.log('User not logged in, skipping cart fetch');
      return {
        current_page: 1,
        total_pages: 0,
        total_elements: 0,
        page_size: 0,
        has_next: false,
        has_previous: false,
        data: [],
      };
    }

    try {
      const res = await cartService.getCartItemsByUser({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 100,
      });
      return res; // PagedCartResponse
    } catch (error: any) {
      // Extract status code from axios error
      const status = error?.response?.status;
      return thunkAPI.rejectWithValue({
        message: error?.message || getMessage('FAILED_FETCH_CART'),
        status,
      });
    }
  },
);

export const addCartItem = createAsyncThunk('cart/addItem', async (course_id: number, thunkAPI) => {
  // Check if user is logged in
  const state = thunkAPI.getState() as any;
  const isLoggedIn = selectIsLoggedIn(state);

  if (!isLoggedIn) {
    const toastId = toast.loading('');
    toast.error(getMessage('PLEASE_LOGIN_ADD_COURSE'), { id: toastId, duration: 2000 });
    return thunkAPI.rejectWithValue({
      message: 'User not authenticated',
      status: 401,
    });
  }

  try {
    const res = await cartService.createCartItem({ course_id });

    // After successfully adding to cart, fetch the updated cart
    thunkAPI.dispatch(fetchCartForUser({ page: 1, pageSize: 100 }));

    return res; // CartItemResponse
  } catch (error: any) {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || error?.message || getMessage('FAILED_ADD_COURSE');
    return thunkAPI.rejectWithValue({
      message,
      status,
    });
  }
});

export const addGroupCartItem = createAsyncThunk(
  'cart/addGroupItem',
  async (course_group_id: number, thunkAPI) => {
    // Check if user is logged in
    const state = thunkAPI.getState() as any;
    const isLoggedIn = selectIsLoggedIn(state);

    if (!isLoggedIn) {
      const toastId = toast.loading('');
      toast.error(getMessage('PLEASE_LOGIN_ADD_GROUP_COURSE'), { id: toastId, duration: 2000 });
      return thunkAPI.rejectWithValue({
        message: 'User not authenticated',
        status: 401,
      });
    }

    try {
      const res = await cartService.createCartItem({ course_group_id });

      // After successfully adding to cart, fetch the updated cart
      thunkAPI.dispatch(fetchCartForUser({ page: 1, pageSize: 100 }));

      return res; // CartItemResponse
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || error?.message || getMessage('FAILED_ADD_GROUP_COURSE');
      return thunkAPI.rejectWithValue({
        message,
        status,
      });
    }
  },
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId: number, thunkAPI) => {
    // Check if user is logged in
    const state = thunkAPI.getState() as any;
    const isLoggedIn = selectIsLoggedIn(state);

    if (!isLoggedIn) {
      const toastId = toast.loading('');
      toast.error(getMessage('PLEASE_LOGIN_MANAGE_CART'), { id: toastId, duration: 2000 });
      return thunkAPI.rejectWithValue({
        message: 'User not authenticated',
        status: 401,
      });
    }

    try {
      await cartService.deleteCartItem(cartItemId);
      return cartItemId;
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || error?.message || getMessage('FAILED_REMOVE_ITEM');
      return thunkAPI.rejectWithValue({
        message,
        status,
      });
    }
  },
);

export const clearCartOnServer = createAsyncThunk('cart/clearCart', async (_, thunkAPI) => {
  // Check if user is logged in
  const state = thunkAPI.getState() as any;
  const isLoggedIn = selectIsLoggedIn(state);

  if (!isLoggedIn) {
    const toastId = toast.loading('');
    toast.error(getMessage('PLEASE_LOGIN_MANAGE_CART'), { id: toastId, duration: 2000 });
    return thunkAPI.rejectWithValue({
      message: 'User not authenticated',
      status: 401,
    });
  }

  // delete all cart items for the current user
  const cartProducts: CartItem[] = state.cart?.cartProducts ?? [];
  const promises: Promise<void>[] = [];
  cartProducts.forEach(p => {
    promises.push(cartService.deleteCartItem(p.id));
  });
  try {
    await Promise.all(promises);
    return;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || getMessage('FAILED_CLEAR_CART');
    return thunkAPI.rejectWithValue({
      message,
      status,
    });
  }
});

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // no local quantity reducer: courses are single-quantity (1) only
    clear_cart_local: state => {
      // local-only clear (keeps UI responsive). Prefer using clearCartOnServer thunk to clear on backend.
      state.cartProducts = [];
    },
  },
  extraReducers: builder => {
    builder
      // fetchCartForUser cases
      .addCase(fetchCartForUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartForUser.fulfilled, (state, action) => {
        // map server CartItemResponse[] -> CartItem[]
        const payload = action.payload;
        console.log('Fetched cart payload:', payload); // Debug
        state.cartProducts = (payload.data || []).map((ci: CartItemResponse) => {
          const item = {
            id: ci.id,
            course_id: ci.course_id,
            title: ci.title,
            slug: ci.slug,
            price: ci.price,
            currency: ci.currency,
            course_type: ensureCourseType(ci), // Use helper to ensure course_type is set
            quantity: 1,
          };
          console.log('Mapped cart item:', item); // Debug
          return item;
        });
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCartForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any) || { message: getMessage('FAILED_FETCH_CART') };
        state.cartProducts = []; // Clear cart on error
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        // Cart will be refreshed by fetchCartForUser dispatch in the thunk
        // Just show success toast here
        const ci = action.payload;
        const courseTitle = ci.title ? ci.title.slice(0, 20) : 'Course';
        toast.success(`${courseTitle}... ${getMessage('ADDED_TO_CART')}`, {
          duration: 1500,
        });
      })
      .addCase(addGroupCartItem.fulfilled, (state, action) => {
        // Cart will be refreshed by fetchCartForUser dispatch in the thunk
        // Just show success toast here
        const ci = action.payload;
        const courseTitle = ci.title ? ci.title.slice(0, 20) : 'Group Course';
        toast.success(`${courseTitle}... ${getMessage('ADDED_TO_CART')}`, {
          duration: 1500,
        });
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.error = (action.payload as any) || { message: getMessage('FAILED_ADD_COURSE') };
        const errorMsg = (action.payload as any)?.message || getMessage('FAILED_ADD_COURSE');
        toast.error(errorMsg, { duration: 2000 });
        console.error('addCartItem error:', errorMsg);
      })
      .addCase(addGroupCartItem.rejected, (state, action) => {
        state.error = (action.payload as any) || { message: getMessage('FAILED_ADD_GROUP_COURSE') };
        const errorMsg = (action.payload as any)?.message || getMessage('FAILED_ADD_GROUP_COURSE');
        toast.error(errorMsg, { duration: 2000 });
        console.error('addGroupCartItem error:', errorMsg);
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const removedId = action.payload as number;
        state.cartProducts = state.cartProducts.filter(p => p.id !== removedId);
        toast.success(getMessage('REMOVED_FROM_CART'), { duration: 1500 });
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.error = (action.payload as any) || { message: getMessage('FAILED_REMOVE_ITEM') };
        const errorMsg = (action.payload as any)?.message || getMessage('FAILED_REMOVE_ITEM');
        toast.error(errorMsg, { duration: 2000 });
        console.error('removeCartItem error:', errorMsg);
      })
      .addCase(clearCartOnServer.fulfilled, state => {
        state.cartProducts = [];
        toast.success(getMessage('CART_CLEARED'), { duration: 1500 });
      })
      .addCase(clearCartOnServer.rejected, (state, action) => {
        state.error = (action.payload as any) || { message: getMessage('FAILED_CLEAR_CART') };
        const errorMsg = (action.payload as any)?.message || getMessage('FAILED_CLEAR_CART');
        toast.error(errorMsg, { duration: 2000 });
        console.error('clearCartOnServer error:', errorMsg);
      });
  },
});

export const { clear_cart_local } = cartSlice.actions;

// Export thunks
export default cartSlice.reducer;
