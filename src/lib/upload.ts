"use client";

import { getSupabase } from "./supabaseClient";

const BUCKET = "uploads";

/** Upload a file to the public `uploads` bucket and return its public URL. */
export async function uploadFile(file: File): Promise<string> {
  const sb = getSupabase();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
