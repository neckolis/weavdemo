import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { X, Upload, Image } from 'lucide-react';

interface LogoUploaderProps {
  onLogoChange: (logoUrl: string | null) => void;
  currentLogo?: string | null;
}

const LogoUploader = ({ onLogoChange, currentLogo }: LogoUploaderProps) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogo || null);
  const [externalUrl, setExternalUrl] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check file types
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image type. Please upload JPG, PNG, SVG or GIF files.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length) {
      const file = validFiles[0]; // Only use the first file
      setLogoFile(file);
      
      // Create a local URL for the file
      const objectUrl = URL.createObjectURL(file);
      setLogoUrl(objectUrl);
      onLogoChange(objectUrl);
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded and will be displayed in the header.",
      });
    }
  }, [onLogoChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
      'image/gif': ['.gif']
    },
    maxFiles: 1
  });

  const removeLogo = () => {
    setLogoFile(null);
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl);
    }
    setLogoUrl(null);
    onLogoChange(null);
    
    toast({
      title: "Logo removed",
      description: "The default logo will be displayed.",
    });
  };

  const handleExternalUrlSubmit = () => {
    if (externalUrl.trim()) {
      setLogoUrl(externalUrl);
      onLogoChange(externalUrl);
      setExternalUrl('');
      
      toast({
        title: "Logo URL set",
        description: "Your logo URL has been set and will be displayed in the header.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Logo</h3>
        <p className="text-sm text-muted-foreground">
          Upload a logo to customize the application header. Supported formats: JPG, PNG, SVG, GIF.
        </p>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 text-center ${
          isDragActive
            ? 'border-primary bg-primary/5 animate-pulse-slow'
            : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-2">
          <Image className="h-8 w-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop your logo here</p>
            <p className="text-xs text-muted-foreground">
              Or click to browse files
            </p>
          </div>
        </div>
      </div>
      
      {logoUrl && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={logoUrl} 
                alt="Uploaded logo" 
                className="h-12 w-auto object-contain"
                onError={() => {
                  toast({
                    title: "Error loading logo",
                    description: "The logo URL could not be loaded. Please try a different URL.",
                    variant: "destructive",
                  });
                }}
              />
              <div>
                <p className="text-sm font-medium">Current Logo</p>
                {logoFile && (
                  <p className="text-xs text-muted-foreground">
                    {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={removeLogo}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove logo</span>
            </Button>
          </div>
        </Card>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Or use an external URL</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="logo-url" className="sr-only">Logo URL</Label>
            <Input
              id="logo-url"
              placeholder="https://example.com/logo.png"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleExternalUrlSubmit} disabled={!externalUrl.trim()}>
            Set URL
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a direct URL to an image. Make sure the URL is publicly accessible.
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Share with custom logo</h3>
        <p className="text-sm text-muted-foreground">
          You can also share this application with your logo by adding the logo URL as a query parameter:
        </p>
        {logoUrl && (
          <code className="block p-2 bg-muted rounded text-xs overflow-x-auto">
            {`${window.location.origin}/?logo=${encodeURIComponent(logoUrl)}`}
          </code>
        )}
      </div>
    </div>
  );
};

export default LogoUploader;
