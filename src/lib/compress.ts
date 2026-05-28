import { isSupabaseConfigured } from './supabaseClient';
import { uploadToSupabase } from './supabaseUpload';

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/** Compress an image file using canvas and return a base64 data URL or Supabase URL */
export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = opts;

  // Convert HEIC if needed (basic check)
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic');

  let processFile = file;

  if (isHeic) {
    // Try to use heic2any if available (variable prevents Vite static analysis)
    try {
      const pkg = 'heic2any';
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const heic2any = ((await new Function('p', 'return import(p)')(pkg)) as { default: unknown }).default as (opts: unknown) => Promise<Blob>;
      const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality });
      processFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg',
      });
    } catch {
      // heic2any not available — process as-is
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(processFile);
    const img = new Image();
    img.onload = async () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      if (isSupabaseConfigured()) {
        canvas.toBlob(
          async (blob) => {
            if (!blob) return reject(new Error('Canvas toBlob failed'));
            const compressedFile = new File([blob], processFile.name, {
              type: 'image/jpeg',
            });
            const publicUrl = await uploadToSupabase(compressedFile, 'images');
            if (publicUrl) resolve(publicUrl);
            else resolve(canvas.toDataURL('image/jpeg', quality));
          },
          'image/jpeg',
          quality,
        );
      } else {
        resolve(canvas.toDataURL('image/jpeg', quality));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Get a thumbnail frame from a video file (seek to 1.5s) */
export function getVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 1.5;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    video.onerror = reject;
    video.load();
  });
}
