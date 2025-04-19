
import { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import ChatMessage from './ChatMessage';
import { Loader } from 'lucide-react';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatWindow = ({ messages, isLoading = false }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-center">
            Your conversation will appear here. Start by asking a question.
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </>
      )}
      
      {isLoading && (
        <div className="flex w-full mb-4 justify-start animate-fade-in">
          <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-chat-assistant border border-border/50 shadow-sm">
            <div className="flex items-center space-x-2">
              <TypingIndicator />
              <p className="text-sm text-muted-foreground">AI is thinking...</p>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
