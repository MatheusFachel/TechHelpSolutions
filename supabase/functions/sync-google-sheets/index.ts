// Supabase Edge Function para sincronizar Google Sheets com o banco de dados
// Deploy: supabase functions deploy sync-google-sheets

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')!;
const SPREADSHEET_ID = Deno.env.get('SPREADSHEET_ID')!;
const SHEET_NAME = Deno.env.get('SHEET_NAME') || 'Sheet1';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GoogleSheetsRow {
  values: string[];
}

interface ChamadoRow {
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
}

serve(async (req) => {
  try {
    console.log('Iniciando sincronização com Google Sheets...');

    // 1. Buscar dados do Google Sheets
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const sheetsResponse = await fetch(sheetsUrl);
    
    if (!sheetsResponse.ok) {
      throw new Error(`Erro ao buscar Google Sheets: ${sheetsResponse.statusText}`);
    }

    const sheetsData = await sheetsResponse.json();
    const rows = sheetsData.values;

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum dado encontrado na planilha' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Processar dados (pular header - primeira linha)
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const chamados: ChamadoRow[] = dataRows.map((row: string[]) => {
      return {
        'ID do Chamado': row[0] || '',
        'Data de Abertura': row[1] || '',
        'Data de Fechamento': row[2] || null,
        'Status': row[3] || '',
        'Prioridade': row[4] || '',
        'Motivo': row[5] || '',
        'Solução': row[6] || null,
        'Solicitante': row[7] || '',
        'Agente Responsável': row[8] || '',
        'Departamento': row[9] || '',
        'TMA (minutos)': parseInt(row[10]) || 0,
        'FRT (minutos)': parseInt(row[11]) || 0,
        'Satisfação do Cliente': row[12] || '',
      };
    });

    console.log(`Processados ${chamados.length} registros`);

    // 3. Conectar ao Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 4. Fazer upsert (inserir ou atualizar) dos dados
    const { data, error } = await supabase
      .from('chamados')
      .upsert(chamados, { 
        onConflict: 'ID do Chamado',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Erro ao fazer upsert no Supabase:', error);
      throw error;
    }

    console.log('Sincronização concluída com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `${chamados.length} chamados sincronizados com sucesso`,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na sincronização:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
