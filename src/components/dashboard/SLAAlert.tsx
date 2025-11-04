import { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chamado } from '@/utils/dataParser';

interface SLAAlertProps {
  chamados: Chamado[];
  metaSLA: number; // em horas
}

interface TicketRisco {
  chamado: Chamado;
  horasAbertas: number;
  percentualSLA: number;
  urgencia: 'critical' | 'warning';
}

export const SLAAlert = memo(({ chamados, metaSLA }: SLAAlertProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calcular tickets em risco
  const ticketsEmRisco: TicketRisco[] = chamados
    .filter(c => c.status === 'Aberto') // Apenas tickets abertos
    .map(chamado => {
      const dataAbertura = new Date(chamado.dataAbertura);
      const agora = new Date();
      const horasAbertas = Math.floor((agora.getTime() - dataAbertura.getTime()) / (1000 * 60 * 60));
      const percentualSLA = (horasAbertas / metaSLA) * 100;

      return {
        chamado,
        horasAbertas,
        percentualSLA,
        urgencia: percentualSLA >= 90 ? 'critical' as const : 'warning' as const,
      };
    })
    .filter(t => t.percentualSLA >= 70) // Apenas tickets > 70% do SLA
    .sort((a, b) => b.percentualSLA - a.percentualSLA) // Mais críticos primeiro
    .slice(0, 5); // Top 5

  // Se não há tickets em risco, não mostrar nada
  if (ticketsEmRisco.length === 0) return null;

  const criticosCount = ticketsEmRisco.filter(t => t.urgencia === 'critical').length;

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 bg-gradient-to-r from-destructive/10 to-warning/10 border-b border-border/50 cursor-pointer hover:bg-destructive/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Tickets em Risco de SLA
                {criticosCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-bold">
                    {criticosCount} crítico{criticosCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                {ticketsEmRisco.length} ticket{ticketsEmRisco.length > 1 ? 's' : ''} próximo{ticketsEmRisco.length > 1 ? 's' : ''} de estourar o SLA de {metaSLA}h
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Lista de Tickets */}
      {isExpanded && (
        <div className="divide-y divide-border/30">
          {ticketsEmRisco.map((ticket, index) => (
            <div 
              key={ticket.chamado.id}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Indicador de urgência */}
                <div className="mt-1">
                  {ticket.urgencia === 'critical' ? (
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-warning" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Linha 1: ID e Motivo */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      #{ticket.chamado.id}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {ticket.chamado.motivo}
                    </span>
                  </div>

                  {/* Linha 2: Tempo e SLA */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      Aberto há <strong>{ticket.horasAbertas}h</strong> / 
                      <strong className="ml-1">{metaSLA}h</strong> SLA
                    </span>
                  </div>

                  {/* Linha 3: Barra de progresso */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tempo utilizado</span>
                      <span className={`font-semibold ${
                        ticket.urgencia === 'critical' ? 'text-destructive' : 'text-warning'
                      }`}>
                        {Math.min(ticket.percentualSLA, 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          ticket.urgencia === 'critical' 
                            ? 'bg-destructive' 
                            : 'bg-warning'
                        }`}
                        style={{ width: `${Math.min(ticket.percentualSLA, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Linha 4: Técnico */}
                  {ticket.chamado.tecnico && (
                    <div className="text-xs text-muted-foreground">
                      Atribuído: <span className="font-medium">{ticket.chamado.tecnico}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});

SLAAlert.displayName = 'SLAAlert';
