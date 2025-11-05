import { ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, BarChart3, FileText, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  onOpenSettings: () => void;
  onLogout: () => void;
}

const menuItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Análises", active: false },
  { icon: FileText, label: "Relatórios", active: false },
];

export const Sidebar = ({ onOpenSettings, onLogout }: SidebarProps) => {
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-xl font-bold">Tech Help</h2>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>

      <Separator />

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "default" : "ghost"}
            className="w-full justify-start"
            disabled={!item.active}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
            {!item.active && (
              <span className="ml-auto text-xs text-muted-foreground">(Em breve)</span>
            )}
          </Button>
        ))}
      </nav>

      <Separator />

      {/* Footer Actions */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4 mr-3" />
          Configurações
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Hamburger Menu com Sheet */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar Fixa */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card">
        <SidebarContent />
      </aside>
    </>
  );
};
