
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileImage, FileVideo, X, Check } from 'lucide-react';
import { UploadFile } from '@/hooks/useFileUpload';

interface FileUploadQueueProps {
  files: UploadFile[];
  onRemoveFile: (id: string) => void;
  onUploadAll: () => void;
  onViewDrafts: () => void;
}

const FileUploadQueue = ({ files, onRemoveFile, onUploadAll, onViewDrafts }: FileUploadQueueProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
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
                      onClick={() => onRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={onUploadAll}
                disabled={files.length === 0 || files.every(f => f.status !== 'pending')}
                className="flex-1"
              >
                Upload All Files
              </Button>
              <Button 
                variant="outline" 
                onClick={onViewDrafts}
                disabled={!files.some(f => f.status === 'completed')}
              >
                View Drafts
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadQueue;
