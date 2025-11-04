import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DashboardSettings, loadSettings, saveSettings, resetSettings } from '@/lib/settings';
import { Settings, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange: (settings: DashboardSettings) => void;
}

export const SettingsModal = ({ open, onOpenChange, onSettingsChange }: SettingsModalProps) => {
  const [settings, setSettings] = useState<DashboardSettings>(loadSettings());

  // Atualiza estado quando o modal abre
  useEffect(() => {
    if (open) {
      setSettings(loadSettings());
    }
  }, [open]);

  const handleSave = () => {
    try {
      // Validações
      if (settings.metaSatisfacao < 1 || settings.metaSatisfacao > 5) {
        toast.error('Meta de satisfação deve estar entre 1.0 e 5.0');
        return;
      }
      if (settings.metaTMA < 1 || settings.metaTMA > 1440) {
        toast.error('Meta de TMA deve estar entre 1 e 1440 minutos (24h)');
        return;
      }
      if (settings.metaSLA < 1 || settings.metaSLA > 168) {
        toast.error('Meta de SLA deve estar entre 1 e 168 horas (7 dias)');
        return;
      }

      saveSettings(settings);
      onSettingsChange(settings);
      toast.success('Configurações salvas com sucesso!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleReset = () => {
    const defaultSettings = resetSettings();
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    toast.success('Configurações resetadas para os valores padrão');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Dashboard
          </DialogTitle>
          <DialogDescription>
            Defina as metas e parâmetros para análise do desempenho. As configurações são salvas automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Meta de Satisfação */}
          <div className="space-y-2">
            <Label htmlFor="metaSatisfacao" className="text-sm font-semibold">
              Meta de Satisfação
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="metaSatisfacao"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={settings.metaSatisfacao}
                onChange={(e) => setSettings({ ...settings, metaSatisfacao: parseFloat(e.target.value) || 4.0 })}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-[80px]">/ 5.0</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nível mínimo esperado de satisfação dos usuários (1.0 - 5.0)
            </p>
          </div>

          {/* Meta de TMA */}
          <div className="space-y-2">
            <Label htmlFor="metaTMA" className="text-sm font-semibold">
              Meta de Tempo Médio de Atendimento (TMA)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="metaTMA"
                type="number"
                min="1"
                max="1440"
                step="10"
                value={settings.metaTMA}
                onChange={(e) => setSettings({ ...settings, metaTMA: parseInt(e.target.value) || 240 })}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-[80px]">minutos</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo máximo esperado para resolução de chamados (1 - 1440 min)
            </p>
          </div>

          {/* Meta de SLA */}
          <div className="space-y-2">
            <Label htmlFor="metaSLA" className="text-sm font-semibold">
              Meta de SLA (Service Level Agreement)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="metaSLA"
                type="number"
                min="1"
                max="168"
                step="1"
                value={settings.metaSLA}
                onChange={(e) => setSettings({ ...settings, metaSLA: parseInt(e.target.value) || 24 })}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground min-w-[80px]">horas</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Prazo máximo para atendimento sem violar o SLA (1 - 168 horas)
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar Padrões
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
