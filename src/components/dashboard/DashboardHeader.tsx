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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo e Título */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <img 
              src={isDark ? logoBranca : logoPreta} 
              alt="TechHelp Solutions" 
              className="h-8 md:h-10 w-auto flex-shrink-0 transition-opacity duration-300" 
            />
            <div className="min-w-0">
              <h1 className="text-base md:text-2xl font-bold text-foreground truncate">
                Dashboard de Suporte Técnico
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
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

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Nome do usuário - apenas desktop */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm">
                <span className="text-muted-foreground">Olá,</span>
                <span className="font-medium">{currentUser.name}</span>
              </div>
            )}

            {/* Configurações - sempre visível */}
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              className="rounded-full h-9 w-9"
              title="Configurações"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Dark mode - sempre visível */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="rounded-full h-9 w-9"
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Atualizar - com texto apenas em md+ */}
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="rounded-full md:rounded-md h-9 md:w-auto md:px-3 w-9 md:gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Atualizar</span>
            </Button>

            {/* Sair - apenas ícone em mobile */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="rounded-full md:rounded-md h-9 md:w-auto md:px-3 w-9 md:gap-2 text-destructive hover:text-destructive"
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
