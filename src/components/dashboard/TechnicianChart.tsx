import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from './ChartCard';
import { AlertCircle, Info } from 'lucide-react';

interface TechnicianData {
  name: string;
  tickets: number;
}

interface TechnicianChartProps {
  data: TechnicianData[];
}

export const TechnicianChart = memo(({ data }: TechnicianChartProps) => {
  const sortedData = useMemo(() => 
    [...data].sort((a, b) => b.tickets - a.tickets).slice(0, 10),
    [data]
  );
  
  const insight = useMemo(() => {
    if (sortedData.length === 0) return "Nenhum chamado registrado no período selecionado.";
    
    const topTechnician = sortedData[0];
    const total = sortedData.reduce((sum, t) => sum + t.tickets, 0);
    
    // Detectar poucos dados (menos de 3 chamados no total)
    if (total < 3) {
      return `Apenas ${total} chamado(s) atendido(s) no período. Dados insuficientes para análise de produtividade. Considere expandir o período.`;
    }
    
    // Verificar se todos têm o mesmo valor (gráfico uniforme)
    const allEqual = sortedData.every(t => t.tickets === topTechnician.tickets);
    
    if (allEqual && sortedData.length > 1) {
      return `Todos os ${sortedData.length} técnicos atenderam ${topTechnician.tickets} chamado(s) cada no período. Distribuição equilibrada da carga de trabalho.`;
    }
    
    const runners = sortedData.slice(1, 3).map(t => t.name).join(' e ');
    const runnersText = runners ? ` ${runners} também se destacam com alta produtividade.` : '';
    
    return `${topTechnician.name} é o técnico mais produtivo com ${topTechnician.tickets} chamados atendidos.${runnersText}`;
  }, [sortedData]);

  // Estado vazio
  if (sortedData.length === 0) {
    return (
      <ChartCard title="Chamados por Técnico" insight={insight}>
        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
          <p className="text-xs mt-2">Tente selecionar um período maior</p>
        </div>
      </ChartCard>
    );
  }

  // Estado de poucos dados (menos de 3 chamados no total)
  const total = sortedData.reduce((sum, t) => sum + t.tickets, 0);
  if (total < 3) {
    return (
      <ChartCard title="Chamados por Técnico" insight={insight}>
        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
          <Info className="w-12 h-12 mb-4 opacity-50 text-warning" />
          <p className="text-sm font-medium">Dados insuficientes para análise</p>
          <p className="text-xs mt-2">Apenas {total} chamado(s) no período</p>
          <div className="mt-4 px-6 py-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-center">
              {sortedData.map(t => `${t.name} (${t.tickets})`).join(', ')}
            </p>
          </div>
          <p className="text-xs mt-3 text-center">Selecione um período maior para visualização gráfica</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Chamados por Técnico" insight={insight}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={150}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Bar 
            dataKey="tickets" 
            fill="hsl(var(--primary))"
            radius={[0, 8, 8, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
});
