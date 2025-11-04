import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from './ChartCard';

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
    const topTechnician = sortedData[0];
    if (!topTechnician) return "Nenhum dado disponível";
    
    const runners = sortedData.slice(1, 3).map(t => t.name).join(' e ');
    return `${topTechnician.name} é o técnico mais produtivo com ${topTechnician.tickets} chamados atendidos. ${runners} também se destacam com alta produtividade.`;
  }, [sortedData]);

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
