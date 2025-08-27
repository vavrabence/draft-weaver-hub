
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  draftId?: string;
  mediaPath?: string;
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...uploadFiles]);
    return uploadFiles;
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (fileItem: UploadFile): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f
    ));

    const fileExt = fileItem.file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id && f.progress < 90 
            ? { ...f, progress: f.progress + 10 } 
            : f
        ));
      }, 200);

      const { data, error } = await supabase.storage
        .from('raw_media')
        .upload(fileName, fileItem.file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Update to completed
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'completed' as const, 
          progress: 100,
          mediaPath: data.path 
        } : f
      ));

      return data.path;
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'error' as const } : f
      ));
      throw error;
    }
  };

  const getFileUrl = async (path: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('raw_media')
      .createSignedUrl(path, 3600);
    
    return data?.signedUrl || '/placeholder.svg';
  };

  return {
    files,
    addFiles,
    removeFile,
    uploadFile,
    getFileUrl,
    setFiles
  };
};
