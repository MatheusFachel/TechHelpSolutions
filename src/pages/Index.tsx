import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { TechnicianChart } from "@/components/dashboard/TechnicianChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TimelineChart } from "@/components/dashboard/TimelineChart";
import { TicketsTable } from "@/components/dashboard/TicketsTable";
import { Chamado, parseCSV, getSatisfacaoNumero } from "@/utils/dataParser";
import { TicketCheck, Clock, AlertCircle, Star, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/data/chamados.csv');
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      setChamados(parsedData);
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar os dados");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Cálculos dos KPIs
  const totalChamados = chamados.length;
  const chamadosAbertos = chamados.filter(c => c.status === "Aberto" || c.status === "Pendente" || c.status === "Em Andamento").length;
  const tmaMedia = Math.round(chamados.reduce((sum, c) => sum + c.tma, 0) / totalChamados);
  const satisfacaoMedia = (chamados.reduce((sum, c) => sum + getSatisfacaoNumero(c.satisfacao), 0) / totalChamados).toFixed(1);

  // Dados para gráficos
  const chamadosPorTecnico = Object.entries(
    chamados.reduce((acc, c) => {
      acc[c.tecnico] = (acc[c.tecnico] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, tickets]) => ({ name, tickets }));

  const chamadosPorCategoria = Object.entries(
    chamados.reduce((acc, c) => {
      acc[c.motivo] = (acc[c.motivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Dados temporais (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });

  const timelineData = last7Days.map(date => ({
    date,
    abertos: Math.floor(Math.random() * 30) + 40,
    resolvidos: Math.floor(Math.random() * 25) + 35,
  }));

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

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TechnicianChart data={chamadosPorTecnico} />
          <CategoryChart data={chamadosPorCategoria} />
        </div>

        {/* Timeline */}
        <TimelineChart data={timelineData} />

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
