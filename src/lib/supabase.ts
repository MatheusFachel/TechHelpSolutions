import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltam variáveis de ambiente do Supabase. Verifique seu arquivo .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipo para a tabela chamados no Supabase
// Usando os nomes EXATOS das colunas do CSV
export interface ChamadoDB {
  'ID do Chamado': string;
  'Data de Abertura': string;
  'Data de Fechamento': string | null;
  'Status': string;
  'Prioridade': string;
  'Motivo': string;
  'Solução': string | null;
  'Solicitante': string;
  'Agente Responsável': string;
  'Departamento': string;
  'TMA (minutos)': number;
  'FRT (minutos)': number;
  'Satisfação do Cliente': string;
  created_at?: string;
  updated_at?: string;
}
