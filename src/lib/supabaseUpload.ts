import { getSupabase, BUCKET } from './supabaseClient';

export async function uploadToSupabase(
  file: File,
  folder: 'images' | 'videos',
): Promise<string | null> {
  const sb = await getSupabase();
  if (!sb) return null;

  const ext = file.name.split('.').pop() ?? 'bin';
  const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage.from(BUCKET).upload(name, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Supabase upload error:', error);
    return null;
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(name);
  return data.publicUrl;
}
