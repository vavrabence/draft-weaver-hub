
import { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isDragOver: boolean;
  onDragOver: (isDragOver: boolean) => void;
}

const FileUploadZone = ({ onFilesSelected, isDragOver, onDragOver }: FileUploadZoneProps) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    onFilesSelected(validFiles);
  }, [onFilesSelected, onDragOver]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFilesSelected(selectedFiles);
  };

  return (
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
            onDragOver(true);
          }}
          onDragLeave={() => onDragOver(false)}
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
  );
};

export default FileUploadZone;
