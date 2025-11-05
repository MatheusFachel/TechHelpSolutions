import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Star, Download, X, Calendar } from "lucide-react";
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
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from 'xlsx';

interface TicketsTableProps {
  data: Chamado[];
}

export const TicketsTable = ({ data }: TicketsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [tecnicoFilter, setTecnicoFilter] = useState<string[]>([]);
  const [departamentoFilter, setDepartamentoFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Extrair técnicos únicos
  const tecnicos = useMemo(() => {
    const unique = [...new Set(data.map(d => d.tecnico))].sort();
    return unique;
  }, [data]);

  // Extrair departamentos únicos
  const departamentos = useMemo(() => {
    const unique = [...new Set(data.map(d => d.departamento))].sort();
    return unique;
  }, [data]);

  // Status disponíveis
  const statusOptions = ["Aberto", "Pendente", "Em Andamento", "Resolvido", "Fechado"];

  const filteredData = data.filter((ticket) => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.tecnico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(ticket.status);
    const matchesTecnico = tecnicoFilter.length === 0 || tecnicoFilter.includes(ticket.tecnico);
    const matchesDepartamento = departamentoFilter.length === 0 || departamentoFilter.includes(ticket.departamento);
    
    // Parse data no formato DD/MM/YYYY
    const parseDate = (dateStr: string) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const ticketDate = parseDate(ticket.dataAbertura);
      if (ticketDate) {
        if (dateFrom && ticketDate < dateFrom) matchesDateRange = false;
        if (dateTo && ticketDate > dateTo) matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesTecnico && matchesDepartamento && matchesDateRange;
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

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setTecnicoFilter([]);
    setDepartamentoFilter([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== "" || statusFilter.length > 0 || 
    tecnicoFilter.length > 0 || departamentoFilter.length > 0 || 
    dateFrom !== undefined || dateTo !== undefined;

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="space-y-4">
        {/* Linha de busca e exportar */}
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

        {/* Linha de filtros avançados */}
        <div className="flex flex-wrap gap-2">
          {/* Filtro de Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Status {statusFilter.length > 0 && `(${statusFilter.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, status]
                        : prev.filter(s => s !== status)
                    );
                    setCurrentPage(1);
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro de Técnico */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Técnico {tecnicoFilter.length > 0 && `(${tecnicoFilter.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
              <DropdownMenuLabel>Filtrar por Técnico</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tecnicos.map((tecnico) => (
                <DropdownMenuCheckboxItem
                  key={tecnico}
                  checked={tecnicoFilter.includes(tecnico)}
                  onCheckedChange={(checked) => {
                    setTecnicoFilter(prev => 
                      checked 
                        ? [...prev, tecnico]
                        : prev.filter(t => t !== tecnico)
                    );
                    setCurrentPage(1);
                  }}
                >
                  {tecnico}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro de Departamento */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Departamento {departamentoFilter.length > 0 && `(${departamentoFilter.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
              <DropdownMenuLabel>Filtrar por Departamento</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {departamentos.map((depto) => (
                <DropdownMenuCheckboxItem
                  key={depto}
                  checked={departamentoFilter.includes(depto)}
                  onCheckedChange={(checked) => {
                    setDepartamentoFilter(prev => 
                      checked 
                        ? [...prev, depto]
                        : prev.filter(d => d !== depto)
                    );
                    setCurrentPage(1);
                  }}
                >
                  {depto}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro de Data */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                {dateFrom || dateTo ? (
                  dateFrom && dateTo 
                    ? `${format(dateFrom, "dd/MM", { locale: ptBR })} - ${format(dateTo, "dd/MM", { locale: ptBR })}`
                    : dateFrom 
                      ? `A partir de ${format(dateFrom, "dd/MM/yyyy", { locale: ptBR })}`
                      : `Até ${format(dateTo!, "dd/MM/yyyy", { locale: ptBR })}`
                ) : "Período"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={ptBR}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={ptBR}
                    disabled={(date) => dateFrom ? date < dateFrom : false}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar filtros
            </Button>
          )}
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
