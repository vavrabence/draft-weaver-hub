import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload as UploadIcon, FileImage, FileVideo, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '@/hooks/useDrafts';
import { toast } from 'sonner';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  draftId?: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const { createDraft } = useDrafts();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startUpload = async () => {
    for (const fileItem of files) {
      if (fileItem.status !== 'pending') continue;
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f
      ));

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 90; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        }

        // Create draft in database (without actual file upload for now)
        const draft = await createDraft({
          media_path: `temp/${fileItem.file.name}`, // Temporary path
          media_type: fileItem.file.type.startsWith('image/') ? 'image' : 'video',
          title: fileItem.file.name.split('.')[0],
          status: 'draft'
        });

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'completed' as const, 
            progress: 100,
            draftId: draft.id 
          } : f
        ));

      } catch (error) {
        console.error('Upload failed:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' as const } : f
        ));
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
          <Card>
            <CardHeader>
              <CardTitle>Select Files</CardTitle>
              <CardDescription>
                Upload images and videos to create draft posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Drag & drop files here
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to select files
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Queue</CardTitle>
              <CardDescription>
                {files.length} files ready for upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No files selected yet
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {file.file.type.startsWith('image/') ? (
                          <FileImage className="h-8 w-8 text-blue-500" />
                        ) : (
                          <FileVideo className="h-8 w-8 text-purple-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file.size)}
                        </p>
                        
                        {file.status === 'uploading' && (
                          <Progress value={file.progress} className="mt-2 h-2" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            file.status === 'completed' ? 'default' :
                            file.status === 'uploading' ? 'secondary' :
                            file.status === 'error' ? 'destructive' : 'outline'
                          }
                        >
                          {file.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                          {file.status}
                        </Badge>
                        
                        {file.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={startUpload}
                      disabled={files.length === 0 || files.every(f => f.status !== 'pending')}
                      className="flex-1"
                    >
                      Upload All Files
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/drafts')}
                      disabled={!files.some(f => f.status === 'completed')}
                    >
                      View Drafts
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
