
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '@/hooks/useDrafts';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import FileUploadZone from '@/components/FileUploadZone';
import FileUploadQueue from '@/components/FileUploadQueue';

const Upload = () => {
  const navigate = useNavigate();
  const { createDraft } = useDrafts();
  const { files, addFiles, removeFile, uploadFile, setFiles } = useFileUpload();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    addFiles(newFiles);
  };

  const startUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const fileItem of pendingFiles) {
      try {
        const mediaPath = await uploadFile(fileItem);
        
        // Create draft in database
        const draft = await createDraft({
          media_path: mediaPath,
          media_type: fileItem.file.type.startsWith('image/') ? 'image' : 'video',
          title: fileItem.file.name.split('.')[0],
          status: 'draft'
        });

        // Update file with draft ID
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, draftId: draft.id } : f
        ));

      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Failed to upload ${fileItem.file.name}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Content</h1>
          <p className="text-muted-foreground">
            Drag and drop your images and videos to create new drafts
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FileUploadZone 
            onFilesSelected={handleFilesSelected}
            isDragOver={isDragOver}
            onDragOver={setIsDragOver}
          />

          <FileUploadQueue
            files={files}
            onRemoveFile={removeFile}
            onUploadAll={startUpload}
            onViewDrafts={() => navigate('/drafts')}
          />
        </div>
      </div>
    </div>
  );
};

export default Upload;
