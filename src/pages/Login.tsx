import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login, getDemoUsers } from '@/lib/auth';
import { User, Lock, Info } from 'lucide-react';
import logo from '@/assets/techhelp-logo.png';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular pequeno delay para UX mais realista
    setTimeout(() => {
      const user = login(username, password);
      
      if (user) {
        onLogin();
      } else {
        setError('Usuário ou senha incorretos');
        setIsLoading(false);
      }
    }, 500);
  };

  const demoUsers = getDemoUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 border-border/50 shadow-2xl">
        {/* Logo e Título */}
        <div className="text-center space-y-2">
          <img src={logo} alt="TechHelp Solutions" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Tech Help Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão de Chamados
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Botão de Ajuda */}
        <div className="text-center">
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="text-muted-foreground"
          >
            <Info className="w-4 h-4 mr-1" />
            {showHelp ? 'Ocultar' : 'Ver'} usuários de demonstração
          </Button>
        </div>

        {/* Lista de Usuários Demo */}
        {showHelp && (
          <Card className="p-4 bg-muted/30 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Usuários disponíveis:
            </p>
            {demoUsers.map((user, index) => (
              <div
                key={index}
                className="text-xs p-2 bg-background rounded border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex gap-2 mt-1 text-muted-foreground">
                  <span>👤 {user.username}</span>
                  <span>•</span>
                  <span>🔑 {user.password}</span>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2 italic">
              💡 Sistema de demonstração para portfólio
            </p>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            TechHelp Solutions © 2025
          </p>
        </div>
      </Card>
    </div>
  );
};
