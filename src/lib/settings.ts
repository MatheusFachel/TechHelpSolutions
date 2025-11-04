/**
 * Sistema de configuração de metas para o dashboard
 * Utiliza localStorage para persistência
 */

export interface DashboardSettings {
  metaSatisfacao: number; // Meta de satisfação (1-5)
  metaTMA: number; // Meta de Tempo Médio de Atendimento em minutos
  metaSLA: number; // Meta de SLA em horas
}

const DEFAULT_SETTINGS: DashboardSettings = {
  metaSatisfacao: 4.0,
  metaTMA: 240, // 4 horas
  metaSLA: 24, // 24 horas
};

const STORAGE_KEY = 'tech-help-dashboard-settings';

/**
 * Carrega as configurações do localStorage
 */
export const loadSettings = (): DashboardSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored) as DashboardSettings;
    
    // Validação básica
    return {
      metaSatisfacao: validateRange(parsed.metaSatisfacao, 1, 5, DEFAULT_SETTINGS.metaSatisfacao),
      metaTMA: validateRange(parsed.metaTMA, 1, 1440, DEFAULT_SETTINGS.metaTMA),
      metaSLA: validateRange(parsed.metaSLA, 1, 168, DEFAULT_SETTINGS.metaSLA),
    };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Salva as configurações no localStorage
 */
export const saveSettings = (settings: DashboardSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw new Error('Não foi possível salvar as configurações');
  }
};

/**
 * Reseta as configurações para os valores padrão
 */
export const resetSettings = (): DashboardSettings => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Valida se um valor está dentro de um range permitido
 */
const validateRange = (value: number, min: number, max: number, defaultValue: number): number => {
  if (typeof value !== 'number' || isNaN(value)) return defaultValue;
  if (value < min || value > max) return defaultValue;
  return value;
};

/**
 * Retorna as configurações padrão (útil para reset parcial)
 */
export const getDefaultSettings = (): DashboardSettings => {
  return { ...DEFAULT_SETTINGS };
};
