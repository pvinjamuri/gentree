'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadPhoto } from '@/lib/api-client';
import { useApiStore } from '@/lib/api-store';
import { useEditMode } from '@/lib/edit-mode';

interface PhotoUploadProps {
  memberId: string;
  currentPhotoUrl?: string;
  onUploaded?: (url: string) => void;
}

export function PhotoUpload({ memberId, currentPhotoUrl, onUploaded }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);
  const slug = useApiStore((s) => s.slug);
  const { isEditMode } = useEditMode();

  if (!isEditMode) {
    if (preview) {
      return (
        <img src={preview} alt="Member photo" className="w-24 h-24 rounded-full object-cover" />
      );
    }
    return null;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const result = await uploadPhoto(slug, memberId, file);
      setPreview(result.photoUrl);
      onUploaded?.(result.photoUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative inline-block">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Member photo" className="w-24 h-24 rounded-full object-cover" />
          <button
            className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow border"
            onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          ) : (
            <Camera className="h-6 w-6 text-gray-400" />
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
