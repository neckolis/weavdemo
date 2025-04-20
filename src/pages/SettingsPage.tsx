import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import LogoUploader from '@/components/LogoUploader';
import { useLogo } from '@/contexts/LogoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  const { logo, setLogo } = useLogo();
  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogoUploader 
                  onLogoChange={setLogo}
                  currentLogo={logo}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About This Application</CardTitle>
                <CardDescription>
                  Information about this demo application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Weaviate Demo</h3>
                  <p className="text-sm text-muted-foreground">
                    This is a demonstration application showcasing Weaviate's vector database capabilities
                    with a simple document upload and chat interface.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Technologies Used</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Frontend: React, TypeScript, Tailwind CSS, shadcn/ui</li>
                    <li>Backend: FastAPI, Python</li>
                    <li>Vector Database: Weaviate</li>
                    <li>AI: DeepSeek</li>
                  </ul>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('https://github.com/neckolis/weavdemo', '_blank')}
                  >
                    View on GitHub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
