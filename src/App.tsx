import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { FileProvider } from "./contexts/FileContext";
import { LogoProvider } from "./contexts/LogoContext";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  // Check for logo URL in query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const logoParam = params.get("logo");
    if (logoParam) {
      setLogoUrl(decodeURIComponent(logoParam));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LogoProvider>
        <FileProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage logoUrl={logoUrl} />} />
                <Route path="/chat" element={<ChatPage logoUrl={logoUrl} />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FileProvider>
      </LogoProvider>
    </QueryClientProvider>
  );
};

export default App;
