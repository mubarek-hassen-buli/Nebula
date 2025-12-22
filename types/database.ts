/**
 * Database types matching the Supabase schema
 * These types represent the structure of tables in the database
 */

export type UserRole = 'customer' | 'admin';

export type OrderStatus = 'pending' | 'scheduled' | 'preparing' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  reward_points: number;
  preferred_language: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  menu_item_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  total_amount: number;
  status: OrderStatus;
  scheduled_for: string | null;
  reward_used: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  order_id: string;
  points_earned: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/**
 * Database tables type map
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'reward_points'> & { 
          id: string;
          reward_points?: number;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      restaurants: {
        Row: Restaurant;
        Insert: Omit<Restaurant, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Restaurant, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'> & { id?: string };
        Update: Partial<Omit<Category, 'id'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id'> & { id?: string };
        Update: Partial<Omit<MenuItem, 'id'>>;
      };
      carts: {
        Row: Cart;
        Insert: Omit<Cart, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Cart, 'id' | 'created_at'>>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id'> & { id?: string };
        Update: Partial<Omit<CartItem, 'id'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'> & { id?: string };
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
      reward_transactions: {
        Row: RewardTransaction;
        Insert: Omit<RewardTransaction, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<RewardTransaction, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
    };
  };
}
