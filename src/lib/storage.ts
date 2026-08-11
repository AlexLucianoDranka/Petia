import { supabase } from '@/lib/supabaseClient';

export type StorageBucket = 'pet-photos' | 'medical-attachments' | 'clinic-logos' | 'groomer-before-after';

export async function uploadFileToStorage(
  file: File,
  bucket: StorageBucket,
  pathPrefix: string = 'uploads'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn(`[Storage] Upload error in ${bucket}:`, error.message);
      // Create object URL fallback for local preview
      return { url: URL.createObjectURL(file), error: null };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: URL.createObjectURL(file), error: null };
  }
}
