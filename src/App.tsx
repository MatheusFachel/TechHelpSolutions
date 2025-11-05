import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { LoginPage } from "./pages/Login";
import NotFound from "./pages/NotFound";
import { isAuthenticated } from "./lib/auth";

const queryClient = new QueryClient();

const App = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // Verificar autenticação ao montar
  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota de Login */}
            <Route 
              path="/login" 
              element={
                authenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
              } 
            />

            {/* Rota Principal - Protegida */}
            <Route 
              path="/" 
              element={
                authenticated ? <Index onLogout={() => setAuthenticated(false)} /> : <Navigate to="/login" replace />
              } 
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
