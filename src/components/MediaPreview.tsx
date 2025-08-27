
import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface MediaPreviewProps {
  mediaPath: string;
  mediaType: 'image' | 'video';
  alt?: string;
  className?: string;
}

const MediaPreview = ({ mediaPath, mediaType, alt, className = "w-full h-full object-cover" }: MediaPreviewProps) => {
  const [mediaUrl, setMediaUrl] = useState<string>('/placeholder.svg');
  const { getFileUrl } = useFileUpload();

  useEffect(() => {
    const loadMediaUrl = async () => {
      try {
        // Skip URL generation for placeholder/temp paths
        if (mediaPath.startsWith('temp/') || mediaPath === '/placeholder.svg') {
          setMediaUrl('/placeholder.svg');
          return;
        }
        
        const url = await getFileUrl(mediaPath);
        setMediaUrl(url);
      } catch (error) {
        console.error('Error loading media URL:', error);
        setMediaUrl('/placeholder.svg');
      }
    };

    loadMediaUrl();
  }, [mediaPath, getFileUrl]);

  if (mediaType === 'video') {
    return (
      <div className={`relative ${className}`}>
        <video 
          src={mediaUrl}
          className="w-full h-full object-cover"
          poster="/placeholder.svg"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <Play className="h-16 w-16 text-white" />
        </div>
      </div>
    );
  }

  return (
    <img 
      src={mediaUrl}
      alt={alt || 'Media preview'}
      className={className}
      onError={() => setMediaUrl('/placeholder.svg')}
    />
  );
};

export default MediaPreview;
