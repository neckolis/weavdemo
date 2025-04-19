
import { useState, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "border-t bg-background/80 backdrop-blur-sm p-4 transition-all duration-300",
        disabled && "opacity-80"
      )}
    >
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[56px] max-h-[200px] resize-none"
          disabled={disabled}
        />
        <Button 
          type="submit" 
          className="h-[56px] px-4"
          disabled={!input.trim() || disabled}
        >
          Send
        </Button>
      </div>
      <div className="text-xs text-center mt-3 text-muted-foreground">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </form>
  );
};

export default ChatInput;
