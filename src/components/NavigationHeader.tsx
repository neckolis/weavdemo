
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LogoDisplay from './LogoDisplay';

interface NavigationHeaderProps {
  logoUrl?: string;
}

const NavigationHeader = ({ logoUrl }: NavigationHeaderProps) => {
  return (
    <header className="w-full p-4 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <LogoDisplay logoUrl={logoUrl} className="h-10" />
          <nav className="hidden sm:flex items-center gap-4">
            <Link 
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Upload Files
            </Link>
            <Link 
              to="/chat"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Chat
            </Link>
          </nav>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://weaviate.io/developers/weaviate/quickstart', '_blank')}
        >
          Documentation
        </Button>
      </div>
    </header>
  );
};

export default NavigationHeader;
