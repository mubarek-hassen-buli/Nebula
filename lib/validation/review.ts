import { z } from 'zod';

/**
 * Create review schema
 */
export const createReviewSchema = z.object({
  restaurant_id: z.string().uuid('Invalid restaurant ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
