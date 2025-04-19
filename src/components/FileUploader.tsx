
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void;
}

const FileUploader = ({ onFilesUploaded }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check file types
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, DOC, DOCX or TXT files.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      onFilesUploaded(validFiles);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 text-center ${
          isDragActive 
            ? 'border-primary bg-primary/5 animate-pulse-slow' 
            : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop files here ..." : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground">
              Upload PDF, DOC, DOCX or TXT files (max 10MB)
            </p>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            type="button"
            className="mt-2"
          >
            Browse files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-5 space-y-3 animate-fade-in">
          <p className="text-sm font-medium">Uploaded files:</p>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="flex items-center justify-between p-3 animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="truncate max-w-[250px]">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
