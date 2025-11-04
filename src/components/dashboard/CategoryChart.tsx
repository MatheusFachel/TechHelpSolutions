import { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartCard } from './ChartCard';

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(217, 84%, 40%)',
];

export const CategoryChart = memo(({ data }: CategoryChartProps) => {
  const sortedData = useMemo(() => 
    [...data].sort((a, b) => b.value - a.value),
    [data]
  );
  
  const insight = useMemo(() => {
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);
    const topCategory = sortedData[0];
    if (!topCategory) return "Nenhum dado disponível";
    
    const percentage = ((topCategory.value / total) * 100).toFixed(1);
    return `${topCategory.name} é a categoria mais recorrente com ${topCategory.value} incidentes (${percentage}%). Atenção necessária para reduzir reincidências.`;
  }, [sortedData]);

  return (
    <ChartCard title="Chamados por Categoria" insight={insight}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
});
