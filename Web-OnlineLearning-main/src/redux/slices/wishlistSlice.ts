'use client';

import { Course } from '@/services/courseService';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

// Extend Course type for wishlist
export interface WishlistCourse extends Course {
  addedAt?: number; // timestamp when added to wishlist
}

interface WishlistState {
  wishlistItems: WishlistCourse[];
}

const initialState: WishlistState = {
  wishlistItems: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    wishlist_product: (state, { payload }: PayloadAction<Course>) => {
      const productIndex = state.wishlistItems.findIndex(item => item.id === payload.id);
      if (productIndex >= 0) {
        const toastId = toast.loading('');
        toast.info(`Already in your wishlist`, {
          id: toastId,
          duration: 1000,
        });
      } else {
        const tempProduct: WishlistCourse = { 
          ...payload, 
          addedAt: Date.now()
        };
        const toastId = toast.loading('');
        state.wishlistItems.push(tempProduct);
        toast.success(`${payload.title.slice(0, 15)} added to wishlist`, {
          id: toastId,
          duration: 1000,
        });
      }
    },
    remove_wishlist_product: (state, { payload }: PayloadAction<Course>) => {
      const toastId = toast.loading('');
      state.wishlistItems = state.wishlistItems.filter(item => item.id !== payload.id);
      toast.error(`Remove from your wishlist`, { id: toastId, duration: 1000 });
    },

    clear_wishlist: state => {
      // Skip confirmation on SSR, allow it to work safely
      try {
        if (typeof window !== 'undefined' && typeof window.confirm !== 'undefined') {
          const confirmMsg = window.confirm('Are you sure deleted your all wishlist items ?');
          if (!confirmMsg) {
            return; // Don't clear if user cancels
          }
        }
        state.wishlistItems = [];
      } catch (error) {
        // Silently handle confirmation errors on SSR
        state.wishlistItems = [];
      }
    },
  },
});

export const {
  wishlist_product,
  remove_wishlist_product,
  clear_wishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
