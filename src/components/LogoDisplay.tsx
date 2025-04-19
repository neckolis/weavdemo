
import { useState, useEffect } from 'react';

interface LogoDisplayProps {
  logoUrl?: string;
  altText?: string;
  className?: string;
  height?: number;
}

const LogoDisplay = ({ 
  logoUrl, 
  altText = "Company Logo", 
  className = "",
  height = 40
}: LogoDisplayProps) => {
  const [logo, setLogo] = useState<string | null>(null);
  const defaultLogo = "/weaviate-logo.svg";

  // Get logo from URL param or props
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLogo = urlParams.get("logo");
    
    // Use logo from URL param if available, otherwise use prop or default
    if (urlLogo) {
      setLogo(decodeURIComponent(urlLogo));
    } else if (logoUrl) {
      setLogo(logoUrl);
    } else {
      setLogo(defaultLogo);
    }
  }, [logoUrl]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {logo && (
        <img 
          src={logo} 
          alt={altText} 
          height={height}
          className="max-h-[40px] w-auto object-contain animate-fade-in"
          onError={(e) => {
            // Fall back to default if the logo fails to load
            const target = e.target as HTMLImageElement;
            target.src = defaultLogo;
          }}
        />
      )}
    </div>
  );
};

export default LogoDisplay;
