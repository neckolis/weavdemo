
import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Small delay to trigger animation
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "flex w-full mb-4 transition-all duration-300 opacity-0 translate-y-2", 
        isVisible && "opacity-100 translate-y-0",
        isUser ? "justify-end" : "justify-start"
      )}
      style={{ transitionDelay: '50ms' }}
    >
      <div
        className={cn(
          "px-4 py-3 rounded-2xl max-w-[85%]",
          isUser 
            ? "bg-chat-user text-foreground rounded-tr-none" 
            : "bg-chat-assistant text-foreground rounded-tl-none shadow-sm border border-border/50"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
