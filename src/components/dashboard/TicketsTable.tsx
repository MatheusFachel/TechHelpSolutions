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
import * as XLSX from 'xlsx';

interface TicketsTableProps {
  data: Chamado[];
}

export const TicketsTable = ({ data }: TicketsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Função para exportar dados filtrados como Excel (usando biblioteca xlsx)
  const exportToExcel = () => {
    // Preparar dados no formato de array de objetos
    const excelData = filteredData.map(ticket => ({
      'ID do Chamado': ticket.id,
      'Data de Abertura': ticket.dataAbertura,
      'Data de Fechamento': ticket.dataFechamento || '',
      'Status': ticket.status,
      'Prioridade': ticket.prioridade,
      'Motivo': ticket.motivo,
      'Solução': ticket.solucao || '',
      'Solicitante': ticket.solicitante,
      'Técnico': ticket.tecnico,
      'Departamento': ticket.departamento,
      'TMA (minutos)': ticket.tma,
      'FRT (minutos)': ticket.frt,
      'Satisfação do Cliente': ticket.satisfacao
    }));

    // Criar workbook e worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chamados');

    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 18 }, // ID do Chamado
      { wch: 20 }, // Data de Abertura
      { wch: 20 }, // Data de Fechamento
      { wch: 15 }, // Status
      { wch: 12 }, // Prioridade
      { wch: 35 }, // Motivo
      { wch: 50 }, // Solução
      { wch: 25 }, // Solicitante
      { wch: 25 }, // Técnico
      { wch: 20 }, // Departamento
      { wch: 15 }, // TMA
      { wch: 15 }, // FRT
      { wch: 22 }  // Satisfação
    ];
    worksheet['!cols'] = columnWidths;

    // Gerar arquivo Excel (.xlsx)
    XLSX.writeFile(workbook, `chamados_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Registros por página:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1); // Reset para primeira página ao mudar quantidade
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-3 text-sm">
              Página {currentPage} de {totalPages || 1}
            </span>
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
