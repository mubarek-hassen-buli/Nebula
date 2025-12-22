import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

/**
 * OTP validation schema
 */
export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

/**
 * Send OTP request schema
 */
export const sendOTPSchema = z.object({
  email: emailSchema,
});

/**
 * Verify OTP request schema
 */
export const verifyOTPSchema = z.object({
  email: emailSchema,
  token: otpSchema,
});

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  preferred_language: z.string().optional(),
});

export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
