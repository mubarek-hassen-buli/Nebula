import * as base64 from 'base64-arraybuffer';
import { supabase } from './client';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  bucket: string,
  path: string,
  base64Data: string,
  contentType: string = 'image/jpeg'
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, base64.decode(base64Data), {
        contentType,
        upsert: true,
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get public URL for an image
 */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete image from storage
 */
export async function deleteImage(bucket: string, path: string) {
  try {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return { data: null, error: error.message };
  }
}

/**
 * List files in a bucket path
 */
export async function listFiles(bucket: string, path: string = '') {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) throw error;
    return { files: data, error: null };
  } catch (error: any) {
    console.error('Error listing files:', error);
    return { files: null, error: error.message };
  }
}
