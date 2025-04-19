
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import PageLayout from '@/components/PageLayout';
import { useFiles } from '@/contexts/FileContext';
import { Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { generateChatResponse, ChatMessage } from '@/services/deepseekService';

interface ChatPageProps {
  logoUrl?: string;
}

const ChatPage = ({ logoUrl }: ChatPageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { uploadedFiles } = useFiles();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if no files are uploaded
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No documents found",
        description: "Please upload documents before chatting.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [uploadedFiles, navigate, toast]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Convert messages to the format expected by DeepSeek
      const chatMessages: ChatMessage[] = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Add the current user message
      chatMessages.push({
        role: 'user',
        content
      });

      // Generate AI response using DeepSeek
      const aiResponseContent = await generateChatResponse(chatMessages, content);

      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // DeepSeek AI is now handling the responses

  return (
    <PageLayout logoUrl={logoUrl} hideFooter>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="container mx-auto p-4">
          <div className="text-sm text-muted-foreground">
            {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} uploaded
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </PageLayout>
  );
};

export default ChatPage;
