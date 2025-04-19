
import { Heart } from 'lucide-react';

interface BrandFooterProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

const BrandFooter = ({ className = "", variant = 'default' }: BrandFooterProps) => {
  return (
    <footer className={`w-full text-center py-4 ${className}`}>
      {variant === 'default' ? (
        <div className="flex flex-col items-center space-y-2">
          <a 
            href="https://weaviate.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-medium">Powered by Weaviate</span>
          </a>
          
          <div className="text-xs text-muted-foreground">
            Built with <Heart className="inline-block h-3 w-3 mx-1 text-red-500" /> 
            using Weaviate Serverless and DeepSeek
          </div>
        </div>
      ) : (
        <a 
          href="https://weaviate.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Powered by Weaviate
        </a>
      )}
    </footer>
  );
};

export default BrandFooter;
