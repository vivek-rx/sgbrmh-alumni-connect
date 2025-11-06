import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

type Props = {
  userId: string; // alumni id or auth user id
  initialAvatarPath?: string | null;
  onSaved?: (row: any) => void;
};

export default function AvatarUploader({ userId, initialAvatarPath, onSaved }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(initialAvatarPath ?? null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Optional: validate file
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (f.size > 4 * 1024 * 1024) { // 4MB limit example
      setError('File is too large (max 4MB).');
      return;
    }
    setFile(f);
  }

  // Upload to Supabase Storage and save path to alumni row
  async function handleUploadAndSave() {
    if (!file) {
      setError('No file selected.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      // Create a unique path (use userId + timestamp)
      const ext = file.name.split('.').pop();
      const filename = `${userId}-${Date.now()}.${ext}`;
      const path = `avatars/${filename}`;

      // Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // You can store the path in DB instead of public URL
      // Now save path to alumni table (adjust table/column names)
      const { data, error: dbError } = await supabase
        .from('alumni')
        .update({ profile_photo_url: path })
        .eq('id', userId) // using id instead of user_id
        .select()
        .single();

      if (dbError) throw dbError;

      setAvatarPath(path);
      if (onSaved) onSaved(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setUploading(false);
      setFile(null);
    }
  }

  // Helper to get URL for rendering (public)
  function getPublicUrl(path: string | null) {
    if (!path) return null;
    // If it's already a full URL, return it as-is
    if (path.startsWith('http')) return path;
    // Otherwise generate the public URL from the storage path
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data?.publicUrl ?? null;
  }

  // If using private bucket, use createSignedUrl(path, expiresInSeconds)
  async function getSignedUrl(path: string | null) {
    if (!path) return null;
    const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path!, 60 * 60); // 1 hour
    if (error) return null;
    return data.signedUrl;
  }

  // Render
  const displayedUrl = previewUrl || (avatarPath ? getPublicUrl(avatarPath) : null);

  return (
    <div className="space-y-2">
      <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden">
        {displayedUrl ? (
          // if private, you'd call getSignedUrl and use that.
          <img src={displayedUrl} alt="avatar preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
        )}
      </div>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex items-center space-x-2">
        <button
          onClick={handleUploadAndSave}
          disabled={uploading || !file}
          className="btn-primary"
        >
          {uploading ? 'Uploading...' : 'Upload & Save'}
        </button>
      </div>
    </div>
  );
}
