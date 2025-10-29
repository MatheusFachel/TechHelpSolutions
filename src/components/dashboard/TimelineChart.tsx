import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { ChartCard } from './ChartCard';

interface TimelineData {
  date: string;
  abertos: number;
  resolvidos: number;
}

interface TimelineChartProps {
  data: TimelineData[];
}

export const TimelineChart = ({ data }: TimelineChartProps) => {
  const lastWeekOpen = data[data.length - 1]?.abertos || 0;
  const firstWeekOpen = data[0]?.abertos || 1;
  const growthNum = (((lastWeekOpen - firstWeekOpen) / firstWeekOpen) * 100);
  const growth = growthNum.toFixed(0);
  
  const insight = growthNum > 0 
    ? `Tendência de crescimento de ${growth}% em chamados abertos na última semana. Recomenda-se aumentar a equipe ou redistribuir demandas.`
    : `Tendência de redução de ${Math.abs(Number(growth))}% em chamados abertos. Continue monitorando o desempenho da equipe.`;

  return (
    <ChartCard title="Evolução Temporal - Últimos 7 Dias" insight={insight}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAbertos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorResolvidos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="abertos"
            stroke="hsl(var(--destructive))"
            fillOpacity={1}
            fill="url(#colorAbertos)"
            strokeWidth={2}
            name="Chamados Abertos"
          />
          <Area
            type="monotone"
            dataKey="resolvidos"
            stroke="hsl(var(--success))"
            fillOpacity={1}
            fill="url(#colorResolvidos)"
            strokeWidth={2}
            name="Chamados Resolvidos"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
