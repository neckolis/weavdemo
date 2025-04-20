
import { useLogo } from '@/contexts/LogoContext';

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
  const { logo } = useLogo();
  const defaultLogo = "/weaviate-logo.svg";

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
