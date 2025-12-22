import { z } from 'zod';

/**
 * Create category schema
 */
export const createCategorySchema = z.object({
  restaurant_id: z.string().uuid('Invalid restaurant ID'),
  name: z.string().min(2, 'Category name must be at least 2 characters'),
});

/**
 * Create menu item schema
 */
export const createMenuItemSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  image_url: z.string().url('Invalid image URL').optional(),
});

/**
 * Update menu item schema
 */
export const updateMenuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  is_available: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
