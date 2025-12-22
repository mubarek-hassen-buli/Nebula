import { z } from 'zod';

/**
 * Create restaurant schema
 */
export const createRestaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  description: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional(),
});

/**
 * Update restaurant schema
 */
export const updateRestaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters').optional(),
  description: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  is_active: z.boolean().optional(),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
