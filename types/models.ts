/**
 * Domain models for the application
 * These extend database types with computed properties and relationships
 */

import { Category, MenuItem, Order, Profile, Restaurant, Review } from './database';

/**
 * User model with authentication info
 */
export interface User {
  id: string;
  email: string;
  profile: Profile | null;
}

/**
 * Restaurant with menu categories
 */
export interface RestaurantWithMenu extends Restaurant {
  categories?: CategoryWithItems[];
  averageRating?: number;
  reviewCount?: number;
}

/**
 * Category with menu items
 */
export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

/**
 * Menu item with category info
 */
export interface MenuItemWithCategory extends MenuItem {
  category?: Category;
}

/**
 * Cart item with menu item details
 */
export interface CartItemWithDetails {
  id: string;
  menu_item: MenuItem;
  quantity: number;
  subtotal: number;
}

/**
 * Order with items and restaurant details
 */
export interface OrderWithDetails extends Order {
  restaurant: Restaurant;
  items: OrderItemWithDetails[];
}

/**
 * Order item with menu item details
 */
export interface OrderItemWithDetails {
  id: string;
  menu_item: MenuItem;
  quantity: number;
  price: number;
  subtotal: number;
}

/**
 * Review with user profile
 */
export interface ReviewWithUser extends Review {
  user: Pick<Profile, 'full_name'>;
}

/**
 * Reward transaction with order details
 */
export interface RewardTransactionWithOrder {
  id: string;
  order_id: string;
  points_earned: number;
  created_at: string;
  order?: Pick<Order, 'total_amount' | 'restaurant_id'>;
}
