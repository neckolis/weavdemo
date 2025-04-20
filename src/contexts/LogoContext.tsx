import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LogoContextType {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  resetLogo: () => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "weaviatedemo_custom_logo";
const DEFAULT_LOGO = "/weaviate-logo.svg";

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logo, setLogoState] = useState<string | null>(null);

  // Initialize logo from URL param, localStorage, or default
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLogo = urlParams.get("logo");
    
    if (urlLogo) {
      // URL param takes precedence
      setLogoState(decodeURIComponent(urlLogo));
    } else {
      // Otherwise check localStorage
      const savedLogo = localStorage.getItem(LOCAL_STORAGE_KEY);
      setLogoState(savedLogo || DEFAULT_LOGO);
    }
  }, []);

  // Save logo to localStorage when it changes
  const setLogo = (newLogo: string | null) => {
    setLogoState(newLogo);
    
    if (newLogo && newLogo !== DEFAULT_LOGO) {
      localStorage.setItem(LOCAL_STORAGE_KEY, newLogo);
    } else if (newLogo === null) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Reset to default logo
  const resetLogo = () => {
    setLogoState(DEFAULT_LOGO);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <LogoContext.Provider
      value={{
        logo,
        setLogo,
        resetLogo
      }}
    >
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error("useLogo must be used within a LogoProvider");
  }
  return context;
}
