import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.168.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Iniciando sincronização do CSV...')
    
    // URL do CSV no GitHub
    const csvUrl = 'https://raw.githubusercontent.com/MatheusFachel/TechHelpSolutions/main/public/data/chamados.csv'
    
    // Buscar CSV
    console.log('Buscando CSV:', csvUrl)
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Erro ao buscar CSV: ${response.status}`)
    }
    
    const csvText = await response.text()
    console.log('CSV baixado com sucesso')
    
    // Parse CSV usando biblioteca Deno (respeita aspas e vírgulas dentro de campos)
    const records = await parse(csvText, {
      skipFirstRow: true,
      columns: [
        'ID do Chamado',
        'Data de Abertura',
        'Data de Fechamento',
        'Status',
        'Prioridade',
        'Motivo',
        'Solução',
        'Solicitante',
        'Agente Responsável',
        'Departamento',
        'TMA (minutos)',
        'FRT (minutos)',
        'Satisfação do Cliente'
      ]
    })
    
    console.log('Total de registros parseados:', records.length)
    
    const chamados = records.map((record: any) => {
      return {
        'ID do Chamado': record['ID do Chamado'] || null,
        'Data de Abertura': record['Data de Abertura'] || null,
        'Data de Fechamento': record['Data de Fechamento'] || null,
        'Status': record['Status'] || null,
        'Prioridade': record['Prioridade'] || null,
        'Motivo': record['Motivo'] || null,
        'Solução': record['Solução'] || null,
        'Solicitante': record['Solicitante'] || null,
        'Agente Responsável': record['Agente Responsável'] || null,
        'Departamento': record['Departamento'] || null,
        'TMA (minutos)': record['TMA (minutos)'] && record['TMA (minutos)'] !== '' ? parseInt(record['TMA (minutos)']) : 0,
        'FRT (minutos)': record['FRT (minutos)'] && record['FRT (minutos)'] !== '' ? parseInt(record['FRT (minutos)']) : 0,
        'Satisfação do Cliente': record['Satisfação do Cliente'] || null
      }
    })

    console.log('Chamados parseados:', chamados.length)
    console.log('Exemplo chamado:', JSON.stringify(chamados[0]))

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Inserir/atualizar dados
    console.log('Sincronizando com o banco de dados...')
    const { data, error } = await supabase
      .from('chamados')
      .upsert(chamados, { onConflict: 'ID do Chamado' })

    if (error) {
      console.error('Erro ao sincronizar:', error)
      throw error
    }

    console.log('Sincronização concluída com sucesso!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${chamados.length} chamados sincronizados com sucesso!`,
        count: chamados.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erro na sincronização:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
