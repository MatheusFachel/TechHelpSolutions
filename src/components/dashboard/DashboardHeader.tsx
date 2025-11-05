import { RefreshCw, Moon, Sun, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import logoPreta from "@/assets/techhelp-logo.png";
import logoBranca from "@/assets/techhelp-logo-branca.png";
import { logout, getCurrentUser } from "@/lib/auth";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const DashboardHeader = ({ onRefresh, isRefreshing, onOpenSettings, onLogout }: DashboardHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDark, setIsDark] = useState(false);
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={isDark ? logoBranca : logoPreta} 
              alt="TechHelp Solutions" 
              className="h-10 w-auto transition-opacity duration-300" 
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dashboard de Suporte Técnico
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' • '}
                {currentTime.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Exibir nome do usuário */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm">
                <span className="text-muted-foreground">Olá,</span>
                <span className="font-medium">{currentUser.name}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              className="rounded-full"
              title="Configurações"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="rounded-full"
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
              title="Sair do sistema"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
