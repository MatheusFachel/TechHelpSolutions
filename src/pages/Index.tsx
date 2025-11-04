import { useEffect, useState, useMemo, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { KPICard } from "@/components/dashboard/KPICard";
import { TechnicianChart } from "@/components/dashboard/TechnicianChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TimelineChart } from "@/components/dashboard/TimelineChart";
import { TicketsTable } from "@/components/dashboard/TicketsTable";
import { Chamado, convertFromDB, getSatisfacaoNumero } from "@/utils/dataParser";
import { supabase, ChamadoDB } from "@/lib/supabase";
import { TicketCheck, Clock, AlertCircle, Star, TrendingUp, Award, CheckCircle2, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DashboardSettings, loadSettings } from "@/lib/settings";

const Index = () => {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timelinePeriod, setTimelinePeriod] = useState<'7' | '30' | '90' | 'all'>('7');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());
  const [chartsPeriod, setChartsPeriod] = useState<'7' | '30' | '90' | 'all'>('all');
  const [chartsYear, setChartsYear] = useState<number | 'all'>('all'); // Ano para filtrar os gráficos no modo "Todos"
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<DashboardSettings>(loadSettings());

  // ============================================================================
  // FUNÇÕES E CÁLCULOS MEMOIZADOS (ANTES DO EARLY RETURN!)
  // Regra do React: Hooks devem ser chamados na mesma ordem em TODOS os renders
  // ============================================================================

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Buscar dados do Supabase
      const { data, error } = await supabase
        .from('chamados')
        .select('*')
        .order('"Data de Abertura"', { ascending: false });

      if (error) {
        throw error;
      }

      // Converter dados do formato DB para formato do frontend
      const chamadosConvertidos = (data as ChamadoDB[]).map(convertFromDB);
      setChamados(chamadosConvertidos);
      
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar os dados do Supabase");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Debounce para evitar múltiplos reloads em sequência
    let debounceTimer: NodeJS.Timeout;

    // Configurar real-time subscription
    const channel = supabase
      .channel('chamados-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chamados' },
        (payload) => {
          console.log('Mudança detectada:', payload);
          
          // Debounce: aguardar 500ms antes de recarregar
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            loadData();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Filtrar chamados baseado no período selecionado (MEMOIZADO)
  const chamadosFiltrados = useMemo(() => {
    let filtered = chamados;

    // Filtro por período
    if (chartsPeriod !== 'all') {
      const days = chartsPeriod === '7' ? 7 : chartsPeriod === '30' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffTime = cutoffDate.getTime();

      filtered = filtered.filter(c => new Date(c.dataAbertura).getTime() >= cutoffTime);
    }

    // Filtro por ano (apenas quando chartsPeriod='all' e chartsYear não é 'all')
    if (chartsPeriod === 'all' && chartsYear !== 'all') {
      filtered = filtered.filter(c => new Date(c.dataAbertura).getFullYear() === chartsYear);
    }

    return filtered;
  }, [chamados, chartsPeriod, chartsYear]);

  // Cálculos dos KPIs (MEMOIZADOS)
  const totalChamados = chamados.length;
  const chamadosAbertos = useMemo(() => 
    chamados.filter(c => c.status === "Aberto" || c.status === "Pendente" || c.status === "Em Andamento").length,
    [chamados]
  );
  const tmaMedia = useMemo(() => 
    totalChamados > 0 ? Math.round(chamados.reduce((sum, c) => sum + c.tma, 0) / totalChamados) : 0,
    [chamados, totalChamados]
  );
  const satisfacaoMedia = useMemo(() => 
    totalChamados > 0 ? (chamados.reduce((sum, c) => sum + getSatisfacaoNumero(c.satisfacao), 0) / totalChamados).toFixed(1) : '0.0',
    [chamados, totalChamados]
  );

  // Dados para gráficos (MEMOIZADOS)
  const chamadosPorTecnico = useMemo(() => 
    Object.entries(
      chamadosFiltrados.reduce((acc, c) => {
        acc[c.tecnico] = (acc[c.tecnico] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, tickets]) => ({ name, tickets })),
    [chamadosFiltrados]
  );

  const chamadosPorCategoria = useMemo(() => 
    Object.entries(
      chamadosFiltrados.reduce((acc, c) => {
        acc[c.motivo] = (acc[c.motivo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })),
    [chamadosFiltrados]
  );

  // Extrair anos disponíveis (MEMOIZADO)
  const availableYears = useMemo(() => 
    Array.from(
      new Set(
        chamados.map(c => new Date(c.dataAbertura).getFullYear())
      )
    ).sort((a, b) => b - a),
    [chamados]
  );

  // Top technician (MEMOIZADO)
  const topTechnician = useMemo(() => 
    chamadosPorTecnico.length > 0 ? chamadosPorTecnico.sort((a, b) => b.tickets - a.tickets)[0] : null,
    [chamadosPorTecnico]
  );

  // Taxa de resolução (MEMOIZADO)
  const taxaResolucao = useMemo(() => {
    if (totalChamados === 0) return { percentual: 0, resolvidos: 0 };
    const resolvidos = totalChamados - chamadosAbertos;
    const percentual = ((resolvidos / totalChamados) * 100);
    return { percentual, resolvidos };
  }, [totalChamados, chamadosAbertos]);

  // Categoria crítica (mais recorrente) (MEMOIZADO)
  const categoriaCritica = useMemo(() => {
    if (chamadosPorCategoria.length === 0) return null;
    const sorted = [...chamadosPorCategoria].sort((a, b) => b.value - a.value);
    const top = sorted[0];
    const percentual = totalChamados > 0 ? ((top.value / totalChamados) * 100) : 0;
    return { ...top, percentual };
  }, [chamadosPorCategoria, totalChamados]);

  // Pico de demanda (dia com mais chamados) (MEMOIZADO)
  const picoDemanda = useMemo(() => {
    const chamadosPorDia = chamadosFiltrados.reduce((acc, chamado) => {
      const dia = new Date(chamado.dataAbertura).toLocaleDateString('pt-BR', { weekday: 'long' });
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(chamadosPorDia);
    if (entries.length === 0) return null;

    const [dia, quantidade] = entries.reduce((max, curr) => 
      curr[1] > max[1] ? curr : max
    );

    return { dia: dia.charAt(0).toUpperCase() + dia.slice(1), quantidade };
  }, [chamadosFiltrados]);

  // ============================================================================
  // EARLY RETURN PARA LOADING (DEPOIS DE TODOS OS HOOKS!)
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Função para gerar dados do timeline baseado no período selecionado
  const generateTimelineData = () => {
    let days: number;
    let dateFormat: 'short' | 'medium' | 'long';
    
    switch (timelinePeriod) {
      case '7':
        days = 7;
        dateFormat = 'short';
        break;
      case '30':
        days = 30;
        dateFormat = 'short';
        break;
      case '90':
        days = 90;
        dateFormat = 'medium';
        break;
      case 'all':
        // Para "all", vamos agrupar por mês
        return generateMonthlyData();
      default:
        days = 7;
        dateFormat = 'short';
    }

    const periodDates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date;
    });

    return periodDates.map(targetDate => {
      const dateStr = targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      // Contar chamados abertos neste dia
      const abertosNoDia = chamados.filter(c => {
        const dataAbertura = new Date(c.dataAbertura);
        return dataAbertura.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === dateStr;
      }).length;
      
      // Contar chamados resolvidos/fechados neste dia
      const resolvidosNoDia = chamados.filter(c => {
        if (!c.dataFechamento) return false;
        const dataFechamento = new Date(c.dataFechamento);
        return dataFechamento.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === dateStr;
      }).length;
      
      return {
        date: dateStr,
        abertos: abertosNoDia,
        resolvidos: resolvidosNoDia,
      };
    });
  };

  // Função para gerar dados agrupados por mês (para período "all")
  const generateMonthlyData = () => {
    // Agrupar todos os chamados por mês/ano
    const monthlyData: Record<string, { abertos: number; resolvidos: number }> = {};

    // Filtrar chamados por ano se um ano específico foi selecionado
    const chamadosFiltrados = selectedYear === 'all' 
      ? chamados 
      : chamados.filter(c => {
          const anoAbertura = new Date(c.dataAbertura).getFullYear();
          return anoAbertura === selectedYear;
        });

    chamadosFiltrados.forEach(c => {
      // Processar data de abertura
      const dataAbertura = new Date(c.dataAbertura);
      const monthKeyAbertura = `${dataAbertura.getMonth() + 1}/${dataAbertura.getFullYear()}`;
      
      if (!monthlyData[monthKeyAbertura]) {
        monthlyData[monthKeyAbertura] = { abertos: 0, resolvidos: 0 };
      }
      monthlyData[monthKeyAbertura].abertos++;

      // Processar data de fechamento
      if (c.dataFechamento) {
        const dataFechamento = new Date(c.dataFechamento);
        const monthKeyFechamento = `${dataFechamento.getMonth() + 1}/${dataFechamento.getFullYear()}`;
        
        if (!monthlyData[monthKeyFechamento]) {
          monthlyData[monthKeyFechamento] = { abertos: 0, resolvidos: 0 };
        }
        monthlyData[monthKeyFechamento].resolvidos++;
      }
    });

    // Converter para array e ordenar por data
    return Object.entries(monthlyData)
      .sort((a, b) => {
        const [monthA, yearA] = a[0].split('/').map(Number);
        const [monthB, yearB] = b[0].split('/').map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      })
      .map(([monthYear, data]) => {
        const [month, year] = monthYear.split('/');
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return {
          date: `${monthNames[parseInt(month) - 1]}/${year}`,
          abertos: data.abertos,
          resolvidos: data.resolvidos,
        };
      });
  };

  // Timeline data (calculado mas não pode ser memoizado antes do if porque depende de função local)
  const timelineData = generateTimelineData();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onRefresh={loadData} 
        isRefreshing={isRefreshing}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSettingsChange={setSettings}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total de Chamados"
            value={totalChamados}
            icon={TicketCheck}
            colorScheme="primary"
            delay={0}
          />
          <KPICard
            title="Tempo Médio de Resolução"
            value={`${tmaMedia} min`}
            subtitle={`Meta: < ${settings.metaTMA} min ${tmaMedia > settings.metaTMA ? '⚠️' : '✓'}`}
            icon={Clock}
            colorScheme={tmaMedia > settings.metaTMA ? "warning" : "success"}
            delay={100}
          />
          <KPICard
            title="Chamados Abertos"
            value={chamadosAbertos}
            subtitle={`${((chamadosAbertos / totalChamados) * 100).toFixed(1)}% do total`}
            icon={AlertCircle}
            colorScheme="destructive"
            delay={200}
          />
          <KPICard
            title="Nível de Satisfação"
            value={`${satisfacaoMedia} / 5`}
            subtitle={`Meta: ${settings.metaSatisfacao.toFixed(1)}/5 ${parseFloat(satisfacaoMedia) >= settings.metaSatisfacao ? '✓' : '⚠️'}`}
            icon={Star}
            colorScheme={parseFloat(satisfacaoMedia) >= settings.metaSatisfacao ? "success" : "warning"}
            delay={300}
          />
        </div>

        {/* Filtro Global para Gráficos de Técnicos e Categorias */}
        <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-muted-foreground">
              Período dos Gráficos:
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={chartsPeriod === '7' ? 'default' : 'outline'}
                onClick={() => setChartsPeriod('7')}
              >
                7 dias
              </Button>
              <Button
                size="sm"
                variant={chartsPeriod === '30' ? 'default' : 'outline'}
                onClick={() => setChartsPeriod('30')}
              >
                30 dias
              </Button>
              <Button
                size="sm"
                variant={chartsPeriod === '90' ? 'default' : 'outline'}
                onClick={() => setChartsPeriod('90')}
              >
                90 dias
              </Button>
              <Button
                size="sm"
                variant={chartsPeriod === 'all' ? 'default' : 'outline'}
                onClick={() => setChartsPeriod('all')}
              >
                Todos
              </Button>
            </div>

            {/* Seletor de ano - aparece apenas quando "Todos" está ativo */}
            {chartsPeriod === 'all' && availableYears.length > 0 && (
              <>
                <div className="h-6 w-px bg-border mx-2" /> {/* Divisor vertical */}
                <Select 
                  value={chartsYear.toString()} 
                  onValueChange={(value) => setChartsYear(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <span className="text-xs text-muted-foreground ml-auto">
              {chartsPeriod === 'all' 
                ? chartsYear === 'all'
                  ? `Mostrando ${chamadosFiltrados.length} chamados (todos os anos)` 
                  : `Mostrando ${chamadosFiltrados.length} chamados de ${chartsYear}`
                : `Mostrando ${chamadosFiltrados.length} chamados dos últimos ${chartsPeriod} dias`}
            </span>
          </div>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TechnicianChart data={chamadosPorTecnico} />
          <CategoryChart data={chamadosPorCategoria} />
        </div>

        {/* Timeline */}
        <TimelineChart 
          data={timelineData} 
          period={timelinePeriod}
          onPeriodChange={setTimelinePeriod}
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

        {/* Cards de insights adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Técnico em Destaque */}
          <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 text-sm">Técnico em Destaque</h3>
                <p className="text-2xl font-bold text-primary truncate">
                  {topTechnician?.name || '-'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {topTechnician?.tickets || 0} chamados atendidos
                </p>
              </div>
            </div>
          </Card>

          {/* Taxa de Resolução */}
          <Card className="p-6 border-border/50 bg-gradient-to-br from-success/10 to-success/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 text-sm">Taxa de Resolução</h3>
                <p className="text-2xl font-bold text-success">
                  {taxaResolucao.percentual.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {taxaResolucao.resolvidos} de {totalChamados} resolvidos
                </p>
              </div>
            </div>
          </Card>

          {/* Categoria Crítica */}
          <Card className="p-6 border-border/50 bg-gradient-to-br from-warning/10 to-warning/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 text-sm">Categoria Crítica</h3>
                <p className="text-2xl font-bold text-warning truncate" title={categoriaCritica?.name}>
                  {categoriaCritica?.value || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1 truncate" title={categoriaCritica?.name}>
                  {categoriaCritica?.name || 'Nenhuma'} ({categoriaCritica?.percentual.toFixed(1) || 0}%)
                </p>
              </div>
            </div>
          </Card>

          {/* Pico de Demanda */}
          <Card className="p-6 border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 text-sm">Pico de Demanda</h3>
                <p className="text-2xl font-bold text-blue-500 truncate">
                  {picoDemanda?.dia || '-'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {picoDemanda?.quantidade || 0} chamados neste dia
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabela */}
        <TicketsTable data={chamados} />
      </main>
    </div>
  );
};

export default Index;
