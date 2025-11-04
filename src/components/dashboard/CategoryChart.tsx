import { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartCard } from './ChartCard';
import { AlertCircle, Info } from 'lucide-react';

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
    if (sortedData.length === 0) return "Nenhum chamado registrado no período selecionado.";
    
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);
    const topCategory = sortedData[0];
    
    // Detectar poucos dados (menos de 3 chamados no total)
    if (total < 3) {
      return `Apenas ${total} chamado(s) registrado(s) no período. Dados insuficientes para análise estatística. Considere expandir o período.`;
    }
    
    // Verificar se todos têm o mesmo valor (distribuição uniforme)
    const allEqual = sortedData.every(c => c.value === topCategory.value);
    
    if (allEqual && sortedData.length > 1) {
      return `Distribuição uniforme entre ${sortedData.length} categorias com ${topCategory.value} chamado(s) cada. Não há categoria predominante no período.`;
    }
    
    const percentage = ((topCategory.value / total) * 100).toFixed(1);
    return `${topCategory.name} é a categoria mais recorrente com ${topCategory.value} incidentes (${percentage}%). Atenção necessária para reduzir reincidências.`;
  }, [sortedData]);

  // Estado vazio
  if (sortedData.length === 0) {
    return (
      <ChartCard title="Chamados por Categoria" insight={insight}>
        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
          <p className="text-xs mt-2">Tente selecionar um período maior</p>
        </div>
      </ChartCard>
    );
  }

  // Estado de poucos dados (menos de 3 chamados total)
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);
  if (total < 3) {
    return (
      <ChartCard title="Chamados por Categoria" insight={insight}>
        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
          <Info className="w-12 h-12 mb-4 opacity-50 text-warning" />
          <p className="text-sm font-medium">Dados insuficientes para análise</p>
          <p className="text-xs mt-2">Apenas {total} chamado(s) no período</p>
          <div className="mt-4 px-6 py-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-center">
              {sortedData.map(d => `${d.name} (${d.value})`).join(', ')}
            </p>
          </div>
          <p className="text-xs mt-3 text-center">Selecione um período maior para visualização gráfica</p>
        </div>
      </ChartCard>
    );
  }

  // Função para renderizar label customizado (evita sobreposição)
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    // Só mostra label se a porcentagem for >= 5% (evita labels muito pequenos)
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard title="Chamados por Categoria" insight={insight}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
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
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: '12px',
              paddingTop: '10px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
});
