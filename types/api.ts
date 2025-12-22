/**
 * API request and response types
 */

import { OrderStatus } from './database';

/**
 * Authentication
 */
export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

/**
 * Profile
 */
export interface UpdateProfileRequest {
  full_name?: string;
  preferred_language?: string;
}

/**
 * Restaurant
 */
export interface CreateRestaurantRequest {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateRestaurantRequest {
  name?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

/**
 * Menu
 */
export interface CreateCategoryRequest {
  restaurant_id: string;
  name: string;
}

export interface CreateMenuItemRequest {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
}

/**
 * Cart
 */
export interface AddToCartRequest {
  menu_item_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cart_item_id: string;
  quantity: number;
}

/**
 * Order
 */
export interface CreateOrderRequest {
  restaurant_id: string;
  items: {
    menu_item_id: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  scheduled_for?: string;
  use_reward?: boolean;
}

export interface UpdateOrderStatusRequest {
  order_id: string;
  status: OrderStatus;
}

/**
 * Review
 */
export interface CreateReviewRequest {
  restaurant_id: string;
  rating: number;
  comment?: string;
}

/**
 * Generic API Response
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
}

/**
 * Pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
