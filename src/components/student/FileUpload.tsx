import React, { useCallback, useState } from 'react';
import { Upload, File, X, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getPDFPageCount } from '@/lib/pdfUtils';

interface FileUploadProps {
  onFileSelect: (file: File, pageCount: number) => void;
  selectedFile: File | null;
  selectedFilePageCount?: number;
  onClear: () => void;
  isUploading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  selectedFile, 
  selectedFilePageCount,
  onClear, 
  isUploading = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  }, []);

  const validateAndSelectFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      toast({
        title: "File Too Large",
        description: "Maximum file size is 500MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const pageCount = await getPDFPageCount(file);
      onFileSelect(file, pageCount);
      toast({
        title: "File Selected",
        description: `PDF loaded with ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Processing Error",
        description: "Could not process PDF file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (selectedFile) {
    return (
      <Card className="border-2 border-success/30 bg-success/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="bg-success/10 p-3 rounded-lg">
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-success animate-spin" />
              ) : (
                <FileText className="h-8 w-8 text-success" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatFileSize(selectedFile.size)}</span>
                {selectedFilePageCount && (
                  <span>• {selectedFilePageCount} {selectedFilePageCount === 1 ? 'page' : 'pages'}</span>
                )}
              </div>
              {isUploading && (
                <p className="text-sm text-primary mt-1">Uploading...</p>
              )}
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
      } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <CardContent className="p-8">
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            {isProcessing ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <p className="font-medium text-foreground mb-1">
            {isProcessing ? 'Processing PDF...' : isDragging ? 'Drop your PDF here' : 'Upload PDF Document'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {isProcessing ? 'Counting pages...' : 'Drag & drop or click to browse'}
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload-input"
            disabled={isProcessing}
          />
          <label htmlFor="file-upload-input" className={isProcessing ? 'pointer-events-none' : 'cursor-pointer'}>
            <Button type="button" variant="outline" size="sm" asChild disabled={isProcessing}>
              <span>
                <File className="h-4 w-4 mr-2" />
                Select File
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-3">
            PDF only, max 500MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
