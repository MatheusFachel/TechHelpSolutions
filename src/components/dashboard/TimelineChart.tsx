import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { ChartCard } from './ChartCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimelineData {
  date: string;
  abertos: number;
  resolvidos: number;
}

interface TimelineChartProps {
  data: TimelineData[];
  period: '7' | '30' | '90' | 'all';
  onPeriodChange: (period: '7' | '30' | '90' | 'all') => void;
  availableYears: number[];
  selectedYear: number | 'all';
  onYearChange: (year: number | 'all') => void;
}

export const TimelineChart = ({ data, period, onPeriodChange, availableYears, selectedYear, onYearChange }: TimelineChartProps) => {
  const lastWeekOpen = data[data.length - 1]?.abertos || 0;
  const firstWeekOpen = data[0]?.abertos || 1;
  const growthNum = (((lastWeekOpen - firstWeekOpen) / firstWeekOpen) * 100);
  const growth = growthNum.toFixed(0);
  
  const periodLabels = {
    '7': 'Últimos 7 Dias',
    '30': 'Últimos 30 Dias',
    '90': 'Últimos 90 Dias',
    'all': 'Período Total'
  };

  const titleSuffix = period === 'all' && selectedYear !== 'all' 
    ? ` (${selectedYear})`
    : '';
  
  const insight = growthNum > 0 
    ? `Tendência de crescimento de ${growth}% em chamados abertos. Recomenda-se aumentar a equipe ou redistribuir demandas.`
    : `Tendência de redução de ${Math.abs(Number(growth))}% em chamados abertos. Continue monitorando o desempenho da equipe.`;

  return (
    <ChartCard 
      title={`Evolução Temporal - ${periodLabels[period]}${titleSuffix}`} 
      insight={insight}
    >
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <Button
          size="sm"
          variant={period === '7' ? 'default' : 'outline'}
          onClick={() => onPeriodChange('7')}
        >
          7 dias
        </Button>
        <Button
          size="sm"
          variant={period === '30' ? 'default' : 'outline'}
          onClick={() => onPeriodChange('30')}
        >
          30 dias
        </Button>
        <Button
          size="sm"
          variant={period === '90' ? 'default' : 'outline'}
          onClick={() => onPeriodChange('90')}
        >
          90 dias
        </Button>
        <Button
          size="sm"
          variant={period === 'all' ? 'default' : 'outline'}
          onClick={() => onPeriodChange('all')}
        >
          Tempo Total
        </Button>

        {/* Seletor de ano - aparece apenas quando Tempo Total está ativo */}
        {period === 'all' && availableYears.length > 0 && (
          <>
            <div className="h-6 w-px bg-border mx-2" /> {/* Divisor vertical */}
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => onYearChange(value === 'all' ? 'all' : parseInt(value))}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Selecione o ano" />
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
      </div>
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
