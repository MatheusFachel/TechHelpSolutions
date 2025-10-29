import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  insight?: string;
}

export const ChartCard = ({ title, children, insight }: ChartCardProps) => {
  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="mb-4">{children}</div>
      {insight && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-sm text-muted-foreground leading-relaxed">
            💡 {insight}
          </p>
        </div>
      )}
    </Card>
  );
};
