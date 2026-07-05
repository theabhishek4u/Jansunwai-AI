import { supabase } from '../lib/supabaseClient';

const compressImage = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas compression failed'));
        }
      }, 'image/jpeg', quality);
    };
    img.onerror = (err) => reject(err);
  });
};

export const storageService = {
  uploadFile: async (
    bucket: 'citizen-images' | 'suggestion-images' | 'suggestion-videos' | 'documents' | 'profile-images',
    path: string,
    file: File
  ): Promise<string> => {
    let uploadData: Blob | File = file;

    if (file.type.startsWith('image/')) {
      try {
        uploadData = await compressImage(file);
      } catch (err) {
        console.warn('Image compression failed, uploading original:', err);
      }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, uploadData, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  },

  getSignedUrl: async (bucket: string, path: string, expiresIn = 3600): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }
};
