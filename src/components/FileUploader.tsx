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
      uploadFilesToBackend(validFiles);
    }
  }, [onFilesUploaded]);

  const uploadFilesToBackend = async (uploadFiles: File[]) => {
    console.log('=== UPLOAD PROCESS STARTED ===');
    const formData = new FormData();
    uploadFiles.forEach(file => {
      console.log(`Adding file to FormData: ${file.name} (${file.type}, ${file.size} bytes)`);
      formData.append('files', file);
    });
    try {
      // Use environment variable for API URL if available, otherwise use relative path
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const uploadUrl = apiUrl ? `${apiUrl}/upload` : '/api/upload';

      console.log('API URL:', apiUrl);
      console.log('Upload URL:', uploadUrl);
      console.log('Uploading files:', uploadFiles.map(f => f.name));

      // Check if backend URL is configured
      if (!apiUrl) {
        console.warn('Backend URL is not set. Simulating upload success.');
        // Simulate successful upload for demo purposes
        toast({
          title: 'Demo Mode',
          description: `${uploadFiles.length} file(s) would be uploaded to Weaviate in production.`,
        });
        return;
      }

      // Add CORS headers
      console.log('Sending fetch request to:', uploadUrl);
      console.log('Request mode:', 'cors');
      console.log('Request method:', 'POST');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
        mode: 'cors',
      });

      console.log('Response received!');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);

      // Try to parse the response body
      let responseText = '';
      let responseData = null;

      try {
        console.log('Attempting to read response text...');
        responseText = await response.text();
        console.log('Response text received, length:', responseText.length);
        console.log('Response text:', responseText);

        if (responseText) {
          try {
            console.log('Attempting to parse response as JSON...');
            responseData = JSON.parse(responseText);
            console.log('Successfully parsed JSON response:');
            console.log('Response data:', responseData);
          } catch (parseError) {
            console.warn('Failed to parse response as JSON:', parseError);
          }
        }
      } catch (textError) {
        console.warn('Failed to read response text:', textError);
      }

      if (response.ok) {
        console.log('Upload successful! Response was OK (status in 200-299 range)');
        toast({
          title: 'Upload successful',
          description: `${uploadFiles.length} file(s) uploaded to Weaviate.`,
        });
      } else {
        let errorMessage = 'An error occurred uploading files.';

        if (responseData && (responseData.detail || responseData.error)) {
          errorMessage = responseData.detail || responseData.error;
        } else if (responseText) {
          // If we have response text but couldn't parse it as JSON
          errorMessage = `Server error: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`;
        } else {
          // If we couldn't get response text, use status text
          errorMessage = `${response.status} ${response.statusText || 'Unknown Error'}`;
        }

        console.error('Upload failed with status:', response.status);
        console.error('Error message:', errorMessage);

        toast({
          title: 'Upload failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('=== UPLOAD PROCESS FAILED WITH ERROR ===');
      console.error('Upload error:', err);
      console.error('Error type:', err instanceof Error ? err.constructor.name : typeof err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      toast({
        title: 'Network error',
        description: 'Could not connect to backend. See console for details.',
        variant: 'destructive',
      });
    }
    console.log('=== UPLOAD PROCESS COMPLETED ===');
  };

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
