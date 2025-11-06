/**
 * Criar notificação de teste e testar botões
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bttgotjfushzmcrfkpxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dGdvdGpmdXNoem1jcmZrcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDU2MzgsImV4cCI6MjA3NzY4MTYzOH0.I8aiwrY_oZpsq-kuGvAThpxgixx7fcoj-MqrTc_ywmI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const CURRENT_USER = 'default_user';

async function testNotificationButtons() {
  console.log('\n🧪 TESTE COMPLETO DE BOTÕES DE NOTIFICAÇÃO\n');
  console.log('='.repeat(100));
  
  try {
    // 1. Criar notificação de teste
    console.log('\n➕ 1. CRIANDO NOTIFICAÇÃO DE TESTE...\n');
    
    const { data: inserted, error: insertError } = await supabase
      .from('notifications')
      .insert({
        chamado_id: 'CHAMADO-00551',
        motivo: 'Lentidão do Sistema - TESTE',
        user_id: CURRENT_USER,
        read: false
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('   ❌ Erro ao inserir:', insertError);
      return;
    }
    
    console.log('   ✅ Notificação criada!');
    console.log('   ID:', inserted.id);
    
    // 2. Testar UPDATE (marcar como lida)
    console.log('\n' + '='.repeat(100));
    console.log('\n📝 2. TESTANDO UPDATE (Marcar como lida)...\n');
    
    const { data: updated, error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', inserted.id)
      .select();
    
    if (updateError) {
      console.error('   ❌ ERRO NO UPDATE:', updateError);
      console.error('   Code:', updateError.code);
      console.error('   Message:', updateError.message);
      console.error('   Details:', updateError.details);
      console.error('   Hint:', updateError.hint);
    } else {
      console.log('   ✅ UPDATE funcionou!');
      console.log('   Resultado:', updated);
    }
    
    // 3. Criar mais notificações para testar "marcar todas"
    console.log('\n' + '='.repeat(100));
    console.log('\n➕ 3. CRIANDO MAIS NOTIFICAÇÕES...\n');
    
    await supabase.from('notifications').insert([
      { chamado_id: 'CHAMADO-00552', motivo: 'Teste 2', user_id: CURRENT_USER, read: false },
      { chamado_id: 'CHAMADO-00553', motivo: 'Teste 3', user_id: CURRENT_USER, read: false }
    ]);
    
    console.log('   ✅ Mais 2 notificações criadas');
    
    // 4. Testar marcar todas como lidas
    console.log('\n' + '='.repeat(100));
    console.log('\n📝 4. TESTANDO "MARCAR TODAS COMO LIDAS"...\n');
    
    const { data: markedAll, error: markAllError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', CURRENT_USER)
      .eq('read', false)
      .select();
    
    if (markAllError) {
      console.error('   ❌ ERRO AO MARCAR TODAS:', markAllError);
      console.error('   Code:', markAllError.code);
      console.error('   Message:', markAllError.message);
    } else {
      console.log('   ✅ MARCAR TODAS funcionou!');
      console.log(`   Marcadas: ${markedAll?.length || 0} notificações`);
    }
    
    // 5. Testar DELETE (limpar todas)
    console.log('\n' + '='.repeat(100));
    console.log('\n🗑️  5. TESTANDO "LIMPAR TODAS"...\n');
    
    const { data: deleted, error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', CURRENT_USER)
      .select();
    
    if (deleteError) {
      console.error('   ❌ ERRO AO DELETAR:', deleteError);
      console.error('   Code:', deleteError.code);
      console.error('   Message:', deleteError.message);
      console.error('   Details:', deleteError.details);
      console.error('   Hint:', deleteError.hint);
    } else {
      console.log('   ✅ DELETE funcionou!');
      console.log(`   Deletadas: ${deleted?.length || 0} notificações`);
    }
    
    // 6. Resumo
    console.log('\n' + '='.repeat(100));
    console.log('\n📊 RESUMO DOS TESTES:\n');
    
    console.log('   INSERT:  ' + (insertError ? '❌ FALHOU' : '✅ OK'));
    console.log('   UPDATE:  ' + (updateError ? '❌ FALHOU' : '✅ OK'));
    console.log('   DELETE:  ' + (deleteError ? '❌ FALHOU' : '✅ OK'));
    
    if (updateError || deleteError) {
      console.log('\n   ⚠️ DIAGNÓSTICO:');
      console.log('   Problema: Políticas RLS bloqueando UPDATE/DELETE');
      console.log('   Causa: As políticas permitem apenas SELECT e INSERT');
      console.log('   Solução: Verificar migração 20251105211011_create_notifications_table.sql');
    } else {
      console.log('\n   ✅ TODOS OS BOTÕES FUNCIONANDO CORRETAMENTE!');
    }
    
    console.log('\n' + '='.repeat(100));
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
  }
}

testNotificationButtons();
