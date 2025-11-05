import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim())
    console.log('Total de linhas:', lines.length)
    
    // Pegar os headers do CSV (primeira linha) e limpar caracteres invisíveis
    const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''))
    console.log('Headers do CSV:', headers)
    
    const chamados = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/\r/g, ''))
      const obj: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || null
        
        // Converter tipos baseado no nome da coluna
        if (header === 'TMA (minutos)' || header === 'FRT (minutos)') {
          // Usar 0 se vazio (NOT NULL no banco)
          obj[header] = value && value !== '' ? parseInt(value) : 0
        } else {
          obj[header] = value && value !== '' ? value : null
        }
      })
      
      return obj
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
