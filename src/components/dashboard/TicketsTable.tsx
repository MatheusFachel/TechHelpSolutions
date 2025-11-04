import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Star, Download } from "lucide-react";
import { Chamado, getStatusColor, getSatisfacaoNumero } from "@/utils/dataParser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TicketsTableProps {
  data: Chamado[];
}

export const TicketsTable = ({ data }: TicketsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter((ticket) => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.tecnico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const renderStars = (satisfacao: string) => {
    const rating = getSatisfacaoNumero(satisfacao);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-warning text-warning" : "text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  // Função para exportar dados filtrados como CSV
  const exportToCSV = () => {
    const headers = [
      'ID do Chamado',
      'Data de Abertura',
      'Data de Fechamento',
      'Status',
      'Prioridade',
      'Motivo',
      'Solução',
      'Solicitante',
      'Técnico',
      'Departamento',
      'TMA (minutos)',
      'FRT (minutos)',
      'Satisfação do Cliente'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredData.map(ticket => [
        ticket.id,
        ticket.dataAbertura,
        ticket.dataFechamento || '',
        ticket.status,
        ticket.prioridade,
        `"${ticket.motivo}"`, // Aspas para escapar vírgulas
        `"${ticket.solucao || ''}"`,
        ticket.solicitante,
        ticket.tecnico,
        ticket.departamento,
        ticket.tma,
        ticket.frt,
        ticket.satisfacao
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `chamados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para exportar dados filtrados como Excel (usando HTML table)
  const exportToExcel = () => {
    const headers = [
      'ID do Chamado',
      'Data de Abertura',
      'Data de Fechamento',
      'Status',
      'Prioridade',
      'Motivo',
      'Solução',
      'Solicitante',
      'Técnico',
      'Departamento',
      'TMA (minutos)',
      'FRT (minutos)',
      'Satisfação do Cliente'
    ];

    let tableHTML = `
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${filteredData.map(ticket => `
            <tr>
              <td>${ticket.id}</td>
              <td>${ticket.dataAbertura}</td>
              <td>${ticket.dataFechamento || ''}</td>
              <td>${ticket.status}</td>
              <td>${ticket.prioridade}</td>
              <td>${ticket.motivo}</td>
              <td>${ticket.solucao || ''}</td>
              <td>${ticket.solicitante}</td>
              <td>${ticket.tecnico}</td>
              <td>${ticket.departamento}</td>
              <td>${ticket.tma}</td>
              <td>${ticket.frt}</td>
              <td>${ticket.satisfacao}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `chamados_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por ID, técnico ou categoria..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Aberto">Aberto</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Resolvido">Resolvido</SelectItem>
              <SelectItem value="Fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                Exportar como Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Técnico
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Categoria
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                  Satisfação
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  style={{
                    animation: `slideInUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <td className="py-3 px-4 text-sm font-medium">{ticket.id}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusColor(ticket.status) as any}>
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">{ticket.tecnico}</td>
                  <td className="py-3 px-4 text-sm">{ticket.motivo}</td>
                  <td className="py-3 px-4">{renderStars(ticket.satisfacao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} chamados
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
