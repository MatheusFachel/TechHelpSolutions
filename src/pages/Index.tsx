import { useEffect, useState, useMemo, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { TechnicianChart } from "@/components/dashboard/TechnicianChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TimelineChart } from "@/components/dashboard/TimelineChart";
import { TicketsTable } from "@/components/dashboard/TicketsTable";
import { Chamado, convertFromDB, getSatisfacaoNumero } from "@/utils/dataParser";
import { supabase, ChamadoDB } from "@/lib/supabase";
import { TicketCheck, Clock, AlertCircle, Star, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timelinePeriod, setTimelinePeriod] = useState<'7' | '30' | '90' | 'all'>('7');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());
  const [chartsPeriod, setChartsPeriod] = useState<'7' | '30' | '90' | 'all'>('all');

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

  // Função para filtrar chamados baseado no período selecionado para os gráficos (MEMOIZADO)
  const chamadosFiltrados = useMemo(() => {
    if (chartsPeriod === 'all') {
      return chamados;
    }

    const days = chartsPeriod === '7' ? 7 : chartsPeriod === '30' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.getTime();

    return chamados.filter(c => {
      const dataAbertura = new Date(c.dataAbertura);
      return dataAbertura.getTime() >= cutoffTime;
    });
  }, [chamados, chartsPeriod]);

  // Cálculos dos KPIs (MEMOIZADOS)
  const totalChamados = chamados.length;
  
  const chamadosAbertos = useMemo(() => 
    chamados.filter(c => c.status === "Aberto" || c.status === "Pendente" || c.status === "Em Andamento").length,
    [chamados]
  );
  
  const tmaMedia = useMemo(() => 
    Math.round(chamados.reduce((sum, c) => sum + c.tma, 0) / totalChamados),
    [chamados, totalChamados]
  );
  
  const satisfacaoMedia = useMemo(() => 
    (chamados.reduce((sum, c) => sum + getSatisfacaoNumero(c.satisfacao), 0) / totalChamados).toFixed(1),
    [chamados, totalChamados]
  );

  // Dados para gráficos (MEMOIZADOS - usando chamados filtrados)
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

  // Função OTIMIZADA para gerar dados do timeline baseado no período selecionado
  const generateTimelineData = useCallback(() => {
    let days: number;
    
    switch (timelinePeriod) {
      case '7':
        days = 7;
        break;
      case '30':
        days = 30;
        break;
      case '90':
        days = 90;
        break;
      case 'all':
        // Para "all", vamos agrupar por mês
        return generateMonthlyData();
      default:
        days = 7;
    }

    // Pré-processar datas dos chamados para evitar criar Date() repetidamente
    const chamadosComDatas = chamados.map(c => ({
      abertura: new Date(c.dataAbertura),
      fechamento: c.dataFechamento ? new Date(c.dataFechamento) : null
    }));

    const periodDates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      date.setHours(0, 0, 0, 0); // Normalizar para meia-noite
      return date;
    });

    return periodDates.map(targetDate => {
      const targetTime = targetDate.getTime();
      const nextDayTime = targetTime + 86400000; // +1 dia em ms
      
      const dateStr = targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      // Contar usando comparação de timestamp (muito mais rápido que string)
      const abertosNoDia = chamadosComDatas.filter(c => {
        const aberturaTime = c.abertura.setHours(0, 0, 0, 0);
        return aberturaTime >= targetTime && aberturaTime < nextDayTime;
      }).length;
      
      const resolvidosNoDia = chamadosComDatas.filter(c => {
        if (!c.fechamento) return false;
        const fechamentoTime = c.fechamento.setHours(0, 0, 0, 0);
        return fechamentoTime >= targetTime && fechamentoTime < nextDayTime;
      }).length;
      
      return {
        date: dateStr,
        abertos: abertosNoDia,
        resolvidos: resolvidosNoDia,
      };
    });
  }, [chamados, timelinePeriod]);

  // Função OTIMIZADA para gerar dados agrupados por mês (para período "all")
  const generateMonthlyData = useCallback(() => {
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
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return Object.entries(monthlyData)
      .sort((a, b) => {
        const [monthA, yearA] = a[0].split('/').map(Number);
        const [monthB, yearB] = b[0].split('/').map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      })
      .map(([monthYear, data]) => {
        const [month, year] = monthYear.split('/');
        return {
          date: `${monthNames[parseInt(month) - 1]}/${year}`,
          abertos: data.abertos,
          resolvidos: data.resolvidos,
        };
      });
  }, [chamados, selectedYear]);

  // Extrair anos disponíveis nos dados (MEMOIZADO)
  const availableYears = useMemo(() => 
    Array.from(
      new Set(
        chamados.map(c => new Date(c.dataAbertura).getFullYear())
      )
    ).sort((a, b) => b - a), // Ordenar do mais recente para o mais antigo
    [chamados]
  );

  // Timeline data (MEMOIZADO)
  const timelineData = useMemo(() => generateTimelineData(), [generateTimelineData]);

  // Top technician (MEMOIZADO)
  const topTechnician = useMemo(() => 
    chamadosPorTecnico.sort((a, b) => b.tickets - a.tickets)[0],
    [chamadosPorTecnico]
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onRefresh={loadData} isRefreshing={isRefreshing} />
      
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
            subtitle={`Meta: < 240 min ${tmaMedia > 240 ? '⚠️' : '✓'}`}
            icon={Clock}
            colorScheme={tmaMedia > 240 ? "warning" : "success"}
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
            subtitle="Meta: 4.0/5"
            icon={Star}
            colorScheme={parseFloat(satisfacaoMedia) >= 4 ? "success" : "warning"}
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
            <span className="text-xs text-muted-foreground ml-auto">
              {chartsPeriod === 'all' 
                ? `Mostrando ${chamadosFiltrados.length} chamados (todos)` 
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Técnico em Destaque</h3>
                <p className="text-2xl font-bold text-primary">{topTechnician?.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {topTechnician?.tickets} chamados atendidos
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-warning/10 to-warning/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Atenção Necessária</h3>
                <p className="text-2xl font-bold text-warning">{chamadosAbertos}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  chamados aguardando atendimento
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-success/10 to-success/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Meta de Satisfação</h3>
                <p className="text-2xl font-bold">
                  <span className="text-foreground">{satisfacaoMedia}</span>
                  <span className="text-muted-foreground text-lg"> / 4.0</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {parseFloat(satisfacaoMedia) >= 4 ? "Meta atingida! 🎉" : "Continue melhorando"}
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
