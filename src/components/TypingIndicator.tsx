
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator = ({ className }: TypingIndicatorProps) => {
  return (
    <div className={cn("flex space-x-1 items-center", className)}>
      <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]"></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_0.2s_infinite]"></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_0.4s_infinite]"></div>
    </div>
  );
};

export default TypingIndicator;
