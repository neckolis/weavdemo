
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';
import FileUploader from '@/components/FileUploader';
import { useFiles } from '@/contexts/FileContext';

interface LandingPageProps {
  logoUrl?: string;
}

const LandingPage = ({ logoUrl }: LandingPageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { addFiles, uploadedFiles } = useFiles();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleFilesUploaded = (files: File[]) => {
    addFiles(files);
    
    if (files.length > 0) {
      setIsUploading(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsUploading(false);
        
        toast({
          title: "Files uploaded successfully",
          description: `${files.length} file(s) uploaded and processed.`,
        });
      }, 1500);
    }
  };
  
  const handleStartChatting = () => {
    navigate('/chat');
  };

  return (
    <PageLayout logoUrl={logoUrl}>
      <div className="flex-1 container max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Upload Your Documents
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start by uploading your documents to begin chatting with them using advanced AI
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <FileUploader onFilesUploaded={handleFilesUploaded} />
          
          {uploadedFiles.length > 0 && (
            <div className="mt-10 text-center">
              <Button 
                size="lg" 
                onClick={handleStartChatting}
                disabled={isUploading}
              >
                {isUploading ? 'Processing...' : 'Start Chatting'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default LandingPage;
