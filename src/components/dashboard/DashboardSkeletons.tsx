import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const KPISkeleton = () => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6 border-border/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        {/* Título e filtro de período */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        {/* Área do gráfico com legenda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico circular */}
          <div className="flex items-center justify-center">
            <Skeleton className="h-[280px] w-[280px] rounded-full" />
          </div>
          
          {/* Legendas */}
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Insight */}
        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
          <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </div>
    </Card>
  );
};

export const TableSkeleton = () => {
  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export const InsightCardSkeleton = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6 border-border/50 bg-gradient-to-br from-card to-card/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
};
