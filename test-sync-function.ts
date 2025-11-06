/**
 * Script para testar a Edge Function de sincronização CSV
 * 
 * Este script:
 * 1. Chama a Edge Function sync-csv-to-supabase
 * 2. Verifica se a sincronização foi bem-sucedida
 * 3. Compara quantidade de registros antes e depois
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bttgotjfushzmcrfkpxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dGdvdGpmdXNoem1jcmZrcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDU2MzgsImV4cCI6MjA3NzY4MTYzOH0.I8aiwrY_oZpsq-kuGvAThpxgixx7fcoj-MqrTc_ywmI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSyncFunction() {
  console.log('\n🔄 TESTANDO EDGE FUNCTION DE SINCRONIZAÇÃO\n');
  console.log('='.repeat(80));
  
  try {
    // 1. Contar registros antes da sincronização
    console.log('\n📊 1. CONTANDO REGISTROS ANTES DA SINCRONIZAÇÃO...\n');
    const { count: countBefore, error: countBeforeError } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true });

    if (countBeforeError) {
      console.error('❌ Erro ao contar registros:', countBeforeError);
      return;
    }

    console.log(`   Registros antes: ${countBefore}`);

    // 2. Chamar a Edge Function
    console.log('\n🚀 2. CHAMANDO EDGE FUNCTION...\n');
    console.log('   URL: https://bttgotjfushzmcrfkpxl.supabase.co/functions/v1/sync-csv-to-supabase');
    
    const { data: functionData, error: functionError } = await supabase.functions.invoke('sync-csv-to-supabase', {
      body: {}
    });

    if (functionError) {
      console.error('❌ Erro ao chamar função:', functionError);
      
      // Verificar se a função existe
      console.log('\n⚠️ A Edge Function pode não estar deployada.');
      console.log('   Para deployar, execute: supabase functions deploy sync-csv-to-supabase');
      return;
    }

    console.log('✅ Função executada com sucesso!');
    console.log('   Resposta:', JSON.stringify(functionData, null, 2));

    // 3. Aguardar alguns segundos para sincronização completar
    console.log('\n⏳ 3. AGUARDANDO SINCRONIZAÇÃO...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Contar registros depois da sincronização
    console.log('📊 4. CONTANDO REGISTROS DEPOIS DA SINCRONIZAÇÃO...\n');
    const { count: countAfter, error: countAfterError } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true });

    if (countAfterError) {
      console.error('❌ Erro ao contar registros:', countAfterError);
      return;
    }

    console.log(`   Registros depois: ${countAfter}`);

    // 5. Comparar resultados
    console.log('\n' + '='.repeat(80));
    console.log('\n📈 RESULTADO DA SINCRONIZAÇÃO:\n');
    console.log(`   Antes:  ${countBefore} registros`);
    console.log(`   Depois: ${countAfter} registros`);
    console.log(`   Diferença: ${(countAfter || 0) - (countBefore || 0)} registros`);

    if (countAfter === 550) {
      console.log('\n✅ PERFEITO! Todos os 550 registros do CSV estão no banco!\n');
    } else {
      console.log(`\n⚠️ ATENÇÃO! Esperado 550 registros, mas temos ${countAfter}\n`);
    }

    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE:', error);
  }
}

// Executar teste
testSyncFunction();
