
import { ReactNode } from 'react';
import NavigationHeader from './NavigationHeader';
import BrandFooter from './BrandFooter';

interface PageLayoutProps {
  children: ReactNode;
  logoUrl?: string;
  hideFooter?: boolean;
  className?: string;
}

const PageLayout = ({ 
  children, 
  logoUrl,
  hideFooter = false,
  className = ""
}: PageLayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <NavigationHeader logoUrl={logoUrl} />
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      {!hideFooter && (
        <BrandFooter />
      )}
    </div>
  );
};

export default PageLayout;
