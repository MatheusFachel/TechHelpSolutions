/**
 * DIAGNÓSTICO COMPLETO DOS PROBLEMAS REPORTADOS
 * 
 * 1. Verificar se chamado 551 existe no Google Sheets
 * 2. Verificar se chamado 551 chegou ao Supabase
 * 3. Testar sync-google-sheets manualmente
 * 4. Listar tabelas de notificações
 * 5. Verificar cron job / polling automático
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bttgotjfushzmcrfkpxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dGdvdGpmdXNoem1jcmZrcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDU2MzgsImV4cCI6MjA3NzY4MTYzOH0.I8aiwrY_oZpsq-kuGvAThpxgixx7fcoj-MqrTc_ywmI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnostico() {
  console.log('\n🔍 DIAGNÓSTICO COMPLETO DO SISTEMA\n');
  console.log('='.repeat(100));
  
  try {
    // 1. Verificar se CHAMADO-00551 existe no Supabase
    console.log('\n📊 1. VERIFICANDO CHAMADO-00551 NO SUPABASE...\n');
    
    const { data: chamado551, error: error551 } = await supabase
      .from('chamados')
      .select('*')
      .eq('"ID do Chamado"', 'CHAMADO-00551')
      .maybeSingle();
    
    if (chamado551) {
      console.log('   ✅ CHAMADO-00551 ENCONTRADO!');
      console.log(JSON.stringify(chamado551, null, 2));
    } else {
      console.log('   ❌ CHAMADO-00551 NÃO ENCONTRADO NO BANCO');
    }
    
    // 2. Verificar total de chamados
    console.log('\n' + '='.repeat(100));
    console.log('\n📈 2. TOTAL DE CHAMADOS NO SUPABASE...\n');
    
    const { count, error: countError } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Total de registros: ${count}`);
    
    if (count === 550) {
      console.log('   ⚠️ Ainda tem 550 registros (falta o 551)');
    } else if (count === 551) {
      console.log('   ✅ Agora tem 551 registros!');
    } else {
      console.log(`   ⚠️ Total inesperado: ${count}`);
    }
    
    // 3. Listar tabelas de notificações
    console.log('\n' + '='.repeat(100));
    console.log('\n🔔 3. VERIFICANDO TABELAS DE NOTIFICAÇÕES...\n');
    
    // Tentar buscar de 'notifications'
    const { data: notif1, error: error1 } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });
    
    if (!error1) {
      console.log(`   ✅ Tabela 'notifications' existe (${notif1 || 0} registros)`);
    } else {
      console.log(`   ❌ Tabela 'notifications' erro: ${error1.message}`);
    }
    
    // Tentar buscar de 'notificacoes'
    const { data: notif2, error: error2 } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true });
    
    if (!error2) {
      console.log(`   ✅ Tabela 'notificacoes' existe (${notif2 || 0} registros)`);
    } else {
      console.log(`   ❌ Tabela 'notificacoes' erro: ${error2.message}`);
    }
    
    // 4. Testar Edge Function sync-google-sheets
    console.log('\n' + '='.repeat(100));
    console.log('\n🚀 4. TESTANDO EDGE FUNCTION sync-google-sheets...\n');
    
    try {
      const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-google-sheets');
      
      if (syncError) {
        console.log('   ❌ Erro ao chamar função:', syncError.message);
        console.log('   Detalhes:', JSON.stringify(syncError, null, 2));
      } else {
        console.log('   ✅ Função executada com sucesso!');
        console.log('   Resposta:', JSON.stringify(syncData, null, 2));
      }
    } catch (err: any) {
      console.log('   ❌ Erro na execução:', err.message);
    }
    
    // 5. Aguardar e verificar novamente
    console.log('\n' + '='.repeat(100));
    console.log('\n⏳ 5. AGUARDANDO 3 SEGUNDOS E VERIFICANDO NOVAMENTE...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { data: chamado551After, error: error551After } = await supabase
      .from('chamados')
      .select('"ID do Chamado", "Status", "Prioridade", "Motivo"')
      .eq('"ID do Chamado"', 'CHAMADO-00551')
      .maybeSingle();
    
    if (chamado551After) {
      console.log('   ✅ CHAMADO-00551 AGORA ESTÁ NO BANCO!');
      console.log(JSON.stringify(chamado551After, null, 2));
    } else {
      console.log('   ❌ CHAMADO-00551 AINDA NÃO ESTÁ NO BANCO');
      console.log('\n   📋 POSSÍVEIS CAUSAS:');
      console.log('      1. Edge Function não tem credenciais do Google Sheets');
      console.log('      2. SPREADSHEET_ID ou SHEET_NAME incorretos');
      console.log('      3. Google Sheets API não habilitada');
      console.log('      4. Permissões insuficientes');
    }
    
    // 6. Verificar último chamado no banco
    console.log('\n' + '='.repeat(100));
    console.log('\n📋 6. ÚLTIMOS 3 CHAMADOS NO BANCO:\n');
    
    const { data: ultimos } = await supabase
      .from('chamados')
      .select('"ID do Chamado", "updated_at"')
      .order('"ID do Chamado"', { ascending: false })
      .limit(3);
    
    ultimos?.forEach((c: any) => {
      console.log(`   ${c['ID do Chamado']} - Última atualização: ${c.updated_at}`);
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('\n📋 RESUMO DO DIAGNÓSTICO:\n');
    
    const problemas = [];
    
    if (!chamado551After) {
      problemas.push('❌ Chamado 551 não está no banco');
    }
    
    if (error1 && error2) {
      problemas.push('❌ Nenhuma tabela de notificações acessível');
    } else if (!error1 && !error2) {
      problemas.push('⚠️ DUAS tabelas de notificações (notifications E notificacoes)');
    }
    
    if (problemas.length === 0) {
      console.log('   ✅ Nenhum problema detectado!\n');
    } else {
      console.log('   PROBLEMAS ENCONTRADOS:\n');
      problemas.forEach(p => console.log(`   ${p}`));
    }
    
    console.log('\n' + '='.repeat(100));
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
  }
}

diagnostico();
