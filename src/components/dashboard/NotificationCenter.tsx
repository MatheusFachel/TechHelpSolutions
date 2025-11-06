import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  chamadoId: string;
  motivo: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  onViewTicket?: (chamadoId: string) => void;
}

// Email do usuário (em produção, viria do sistema de autenticação)
const CURRENT_USER = "admin@techelp.com";

export const NotificationCenter = ({ onViewTicket }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar notificações do Supabase
  useEffect(() => {
    loadNotifications();

    // Subscription para novas notificações em tempo real
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${CURRENT_USER}`
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', CURRENT_USER)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const formatted = data.map(n => ({
          id: n.id,
          chamadoId: n.chamado_id,
          motivo: n.motivo,
          timestamp: new Date(n.created_at),
          read: n.read
        }));
        setNotifications(formatted);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Função pública para adicionar notificação (será chamada pelo Index.tsx)
  const addNotification = async (chamadoId: string, motivo: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          chamado_id: chamadoId,
          motivo: motivo,
          user_id: CURRENT_USER,
          read: false
        });

      if (error) throw error;

      // A subscription já vai recarregar automaticamente
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error);
    }
  };

  // Expor função globalmente para ser usada pelo componente pai
  useEffect(() => {
    (window as any).addTechHelpNotification = addNotification;
    return () => {
      delete (window as any).addTechHelpNotification;
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      // A subscription já vai recarregar automaticamente
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', CURRENT_USER)
        .eq('read', false);

      if (error) throw error;

      // A subscription já vai recarregar automaticamente
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const clearAll = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', CURRENT_USER);

      if (error) throw error;

      // A subscription já vai recarregar automaticamente
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  };

  const handleViewTicket = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    if (onViewTicket) {
      onViewTicket(notification.chamadoId);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full h-9 w-9"
          title="Notificações"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 text-xs"
                  >
                    Marcar todas lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Lista de Notificações */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleViewTicket(notification)}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                          🎫 {notification.chamadoId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.motivo}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
