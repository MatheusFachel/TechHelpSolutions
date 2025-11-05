import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Chamado, getStatusColor, getSatisfacaoNumero } from "@/utils/dataParser";

interface TicketCardProps {
  ticket: Chamado;
  index: number;
}

export const TicketCard = ({ ticket, index }: TicketCardProps) => {
  const renderStars = (satisfacao: string) => {
    const rating = getSatisfacaoNumero(satisfacao);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? "fill-warning text-warning" : "text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card 
      className="p-4 border-border/50 hover:bg-muted/30 transition-colors"
      style={{
        animation: `slideInUp 0.3s ease-out ${index * 0.05}s both`
      }}
    >
      <div className="space-y-3">
        {/* Header: ID e Status */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold">{ticket.id}</span>
          <Badge className={getStatusColor(ticket.status)}>
            {ticket.status}
          </Badge>
        </div>

        {/* Técnico e Departamento */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Técnico:</span>
            <span className="font-medium">{ticket.tecnico}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Depto:</span>
            <span>{ticket.departamento}</span>
          </div>
        </div>

        {/* Categoria/Motivo */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Motivo</span>
          <p className="text-sm line-clamp-2">{ticket.motivo}</p>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Abertura:</span>
            <p className="font-medium">{ticket.dataAbertura}</p>
          </div>
          {ticket.dataFechamento && (
            <div>
              <span className="text-muted-foreground">Fechamento:</span>
              <p className="font-medium">{ticket.dataFechamento}</p>
            </div>
          )}
        </div>

        {/* Métricas e Satisfação */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">TMA:</span>
              <span className="ml-1 font-medium">{ticket.tma}min</span>
            </div>
            <div>
              <span className="text-muted-foreground">FRT:</span>
              <span className="ml-1 font-medium">{ticket.frt}min</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {renderStars(ticket.satisfacao)}
          </div>
        </div>
      </div>
    </Card>
  );
};
