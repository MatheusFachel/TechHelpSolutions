import { useEffect, useState } from "react";
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

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();

    // Configurar real-time subscription
    const channel = supabase
      .channel('chamados-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chamados' },
        (payload) => {
          console.log('Mudança detectada:', payload);
          loadData(); // Recarrega dados quando houver alteração
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  // Função para filtrar chamados baseado no período selecionado para os gráficos
  const filterChamadosByPeriod = (period: '7' | '30' | '90' | 'all') => {
    if (period === 'all') {
      return chamados;
    }

    const days = period === '7' ? 7 : period === '30' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return chamados.filter(c => {
      const dataAbertura = new Date(c.dataAbertura);
      return dataAbertura >= cutoffDate;
    });
  };

  // Chamados filtrados para os gráficos de Técnico e Categoria
  const chamadosFiltrados = filterChamadosByPeriod(chartsPeriod);

  // Cálculos dos KPIs
  const totalChamados = chamados.length;
  const chamadosAbertos = chamados.filter(c => c.status === "Aberto" || c.status === "Pendente" || c.status === "Em Andamento").length;
  const tmaMedia = Math.round(chamados.reduce((sum, c) => sum + c.tma, 0) / totalChamados);
  const satisfacaoMedia = (chamados.reduce((sum, c) => sum + getSatisfacaoNumero(c.satisfacao), 0) / totalChamados).toFixed(1);

  // Dados para gráficos (usando chamados filtrados)
  const chamadosPorTecnico = Object.entries(
    chamadosFiltrados.reduce((acc, c) => {
      acc[c.tecnico] = (acc[c.tecnico] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, tickets]) => ({ name, tickets }));

  const chamadosPorCategoria = Object.entries(
    chamadosFiltrados.reduce((acc, c) => {
      acc[c.motivo] = (acc[c.motivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

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

  // Extrair anos disponíveis nos dados
  const availableYears = Array.from(
    new Set(
      chamados.map(c => new Date(c.dataAbertura).getFullYear())
    )
  ).sort((a, b) => b - a); // Ordenar do mais recente para o mais antigo

  const timelineData = generateTimelineData();

  const topTechnician = chamadosPorTecnico.sort((a, b) => b.tickets - a.tickets)[0];

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
