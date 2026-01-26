import axios from '@/config/axios';
import { parseApiError } from './apiError';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUND_SUCCESS'
  | 'REFUND_FAILED';
export type Currency = 'USD' | 'VND';

export interface CartItemRequest {
  course_id?: number;
  course_group_id?: number;
}

export interface CreateOrderRequest {
  total_money: number;
  cart_item_list: CartItemRequest[];
}

export interface PaymentResponse {
  payment_url: string;
  provider: string;
}

export interface CreateOrderResponse {
  username: string;
  email: string;
  order_number: string;
  currency: Currency;
  total_money: number;
  payment_status: PaymentStatus;
  order_date: string;
  payment_response: PaymentResponse;
}

export interface OrderStatusResponse {
  id: number;
  orderNumber: string;
  currency: Currency;
  paymentStatus: PaymentStatus;
  orderDate: string;
  totalMoney: number;
  created_at: string;
  updated_at: string;
}

export interface OrderListItem {
  username: string;
  email: string;
  order_number: string;
  currency: Currency;
  total_money: number;
  payment_status: PaymentStatus;
  order_date: string;
}

export interface PagedOrderResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: OrderListItem[];
}

export interface OrderListParams {
  page?: number;
  size?: number;
}

export interface OrderItem {
  course_type: 'STANDALONE' | 'GROUP';
  course_id: number;
  course_title: string;
  course_price: number;
  thumbnail: string;
}

export interface OrderDetailResponse {
  order_number: string;
  currency: Currency;
  payment_status: PaymentStatus;
  order_date: string;
  total_money: number;
  order_items: OrderItem[];
}

export interface CourseEnrolledResponse {
  id: number;
  title: string;
  image: string;
  price: number;
}

export interface CheckPriceRequest {
  total_money?: number;
  cart_item_list: CartItemRequest[];
}

export interface CheckPriceResponse {
  total_money?: number;
  course_enrolled_responses: CourseEnrolledResponse[];
}

/**
 * Create a new order
 * POST /orders
 */
export const createOrder = async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    const response = await axios.post('/orders', data);
    return response.data as CreateOrderResponse;
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get order status by order number
 * GET /orders/{orderNumber}/status
 */
export const getOrderStatus = async (orderNumber: string): Promise<OrderStatusResponse> => {
  try {
    const response = await axios.get(`/orders/${orderNumber}/status`);
    return response.data as OrderStatusResponse;
  } catch (error: unknown) {
    console.error('Error fetching order status:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get user's order list
 * GET /orders/user?page=&size=
 */
export const getUserOrders = async (params?: OrderListParams): Promise<PagedOrderResponse> => {
  try {
    const query = new URLSearchParams();

    if (params?.page !== undefined) {
      query.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      query.append('size', params.size.toString());
    }

    const url = query.toString() ? `/orders/user?${query.toString()}` : '/orders/user';
    const response = await axios.get(url);
    return response.data as PagedOrderResponse;
  } catch (error: unknown) {
    console.error('Error fetching user orders:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get order detail by order number
 * GET /orders/{orderNumber}
 */
export const getOrderDetail = async (orderNumber: string): Promise<OrderDetailResponse> => {
  try {
    const response = await axios.get(`/orders/${orderNumber}`);
    return response.data as OrderDetailResponse;
  } catch (error: unknown) {
    console.error('Error fetching order detail:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Check price and get enrolled courses information
 * POST /orders/check-price
 */
export const checkPrice = async (data: CheckPriceRequest): Promise<CheckPriceResponse> => {
  try {
    const response = await axios.post('/orders/check-price', data);
    return response.data as CheckPriceResponse;
  } catch (error: unknown) {
    console.error('Error checking price:', error);
    return Promise.reject(parseApiError(error));
  }
};
