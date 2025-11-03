import { ChamadoDB } from '@/lib/supabase';

export interface Chamado {
  id: string;
  dataAbertura: string;
  dataFechamento: string | null;
  status: string;
  prioridade: string;
  motivo: string;
  solucao: string | null;
  solicitante: string;
  tecnico: string;
  departamento: string;
  tma: number;
  frt: number;
  satisfacao: string;
}

// Converte dados do Supabase (nomes do CSV) para formato do frontend (camelCase)
export const convertFromDB = (dbChamado: ChamadoDB): Chamado => {
  return {
    id: dbChamado['ID do Chamado'],
    dataAbertura: dbChamado['Data de Abertura'],
    dataFechamento: dbChamado['Data de Fechamento'],
    status: dbChamado['Status'],
    prioridade: dbChamado['Prioridade'],
    motivo: dbChamado['Motivo'],
    solucao: dbChamado['Solução'],
    solicitante: dbChamado['Solicitante'],
    tecnico: dbChamado['Agente Responsável'],
    departamento: dbChamado['Departamento'],
    tma: dbChamado['TMA (minutos)'],
    frt: dbChamado['FRT (minutos)'],
    satisfacao: dbChamado['Satisfação do Cliente'],
  };
};

export const parseCSV = (csvText: string): Chamado[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',');
    return {
      id: values[0],
      dataAbertura: values[1],
      dataFechamento: values[2] || null,
      status: values[3],
      prioridade: values[4],
      motivo: values[5],
      solucao: values[6] || null,
      solicitante: values[7],
      tecnico: values[8],
      departamento: values[9],
      tma: parseInt(values[10]) || 0,
      frt: parseInt(values[11]) || 0,
      satisfacao: values[12],
    };
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Aberto': 'destructive',
    'Pendente': 'warning',
    'Em Andamento': 'info',
    'Resolvido': 'success',
    'Fechado': 'secondary',
  };
  return colors[status] || 'secondary';
};

export const getSatisfacaoNumero = (satisfacao: string): number => {
  const map: Record<string, number> = {
    'Excelente': 5,
    'Bom': 4,
    'Médio': 3,
    'Regular': 2,
    'Ruim': 1,
  };
  return map[satisfacao] || 0;
};
