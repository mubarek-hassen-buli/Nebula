import { z } from 'zod';

/**
 * Create order schema
 */
export const createOrderSchema = z.object({
  restaurant_id: z.string().uuid('Invalid restaurant ID'),
  items: z.array(
    z.object({
      menu_item_id: z.string().uuid('Invalid menu item ID'),
      quantity: z.number().int().positive('Quantity must be at least 1'),
      price: z.number().positive('Price must be greater than 0'),
    })
  ).min(1, 'Order must contain at least one item'),
  total_amount: z.number().positive('Total amount must be greater than 0'),
  scheduled_for: z.string().datetime().optional(),
  use_reward: z.boolean().optional(),
});

/**
 * Update order status schema
 */
export const updateOrderStatusSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  status: z.enum(['pending', 'scheduled', 'preparing', 'delivered', 'cancelled']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
