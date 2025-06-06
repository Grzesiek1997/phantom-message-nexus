
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { initializeCloudflare } from "@/lib/config/cloudflare";
import { initializeLanguageDetection } from "@/lib/utils/language-detector";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      console.log('🚀 SecureChat Quantum - Initializing...');
      
      // Initialize language detection
      const language = initializeLanguageDetection();
      console.log('🌍 User Language:', language);
      
      // Initialize Cloudflare API
      const cloudflareReady = await initializeCloudflare();
      console.log('☁️ Cloudflare API Ready:', cloudflareReady);
      
      console.log('✅ SecureChat Quantum - Ready!');
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
