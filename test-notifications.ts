/**
 * Teste dos botões de notificação
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bttgotjfushzmcrfkpxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dGdvdGpmdXNoem1jcmZrcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDU2MzgsImV4cCI6MjA3NzY4MTYzOH0.I8aiwrY_oZpsq-kuGvAThpxgixx7fcoj-MqrTc_ywmI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const CURRENT_USER = 'default_user';

async function testNotifications() {
  console.log('\n🔔 TESTE DE NOTIFICAÇÕES\n');
  console.log('='.repeat(100));
  
  try {
    // 1. Listar notificações
    console.log('\n📋 1. LISTANDO NOTIFICAÇÕES...\n');
    const { data: allNotifs, error: listError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', CURRENT_USER)
      .order('created_at', { ascending: false });
    
    if (listError) {
      console.error('❌ Erro ao listar:', listError);
      return;
    }
    
    console.log(`   Total: ${allNotifs?.length || 0} notificações`);
    console.log(`   Não lidas: ${allNotifs?.filter(n => !n.read).length || 0}`);
    
    allNotifs?.forEach((n: any) => {
      console.log(`   - ${n.chamado_id} | Lida: ${n.read} | ID: ${n.id}`);
    });
    
    if (!allNotifs || allNotifs.length === 0) {
      console.log('\n   ⚠️ Nenhuma notificação encontrada para testar');
      return;
    }
    
    // 2. Testar marcar uma como lida
    console.log('\n' + '='.repeat(100));
    console.log('\n📝 2. TESTANDO MARCAR UMA COMO LIDA...\n');
    
    const primeiraNotif = allNotifs[0];
    console.log(`   Tentando marcar como lida: ${primeiraNotif.id}`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', primeiraNotif.id)
      .select();
    
    if (updateError) {
      console.error('   ❌ Erro ao atualizar:', updateError);
      console.error('   Detalhes:', JSON.stringify(updateError, null, 2));
    } else {
      console.log('   ✅ Atualização bem-sucedida!');
      console.log('   Resultado:', updateData);
    }
    
    // 3. Testar marcar todas como lidas
    console.log('\n' + '='.repeat(100));
    console.log('\n📝 3. TESTANDO MARCAR TODAS COMO LIDAS...\n');
    
    const { data: markAllData, error: markAllError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', CURRENT_USER)
      .eq('read', false)
      .select();
    
    if (markAllError) {
      console.error('   ❌ Erro ao marcar todas:', markAllError);
      console.error('   Detalhes:', JSON.stringify(markAllError, null, 2));
    } else {
      console.log('   ✅ Marcadas como lidas!');
      console.log(`   Quantidade: ${markAllData?.length || 0}`);
    }
    
    // 4. Testar limpar todas
    console.log('\n' + '='.repeat(100));
    console.log('\n🗑️  4. TESTANDO LIMPAR TODAS...\n');
    
    const { data: deleteData, error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', CURRENT_USER)
      .select();
    
    if (deleteError) {
      console.error('   ❌ Erro ao deletar:', deleteError);
      console.error('   Detalhes:', JSON.stringify(deleteError, null, 2));
    } else {
      console.log('   ✅ Notificações deletadas!');
      console.log(`   Quantidade: ${deleteData?.length || 0}`);
    }
    
    // 5. Verificar políticas RLS
    console.log('\n' + '='.repeat(100));
    console.log('\n🔒 5. DIAGNÓSTICO DE RLS...\n');
    
    console.log('   As políticas RLS estão permitindo:');
    console.log('   - SELECT: ' + (listError ? '❌' : '✅'));
    console.log('   - UPDATE: ' + (updateError ? '❌' : '✅'));
    console.log('   - DELETE: ' + (deleteError ? '❌' : '✅'));
    
    if (updateError || deleteError) {
      console.log('\n   ⚠️ PROBLEMA DETECTADO!');
      console.log('   As políticas RLS estão bloqueando UPDATE/DELETE');
      console.log('   Solução: Ajustar políticas na migração');
    }
    
    console.log('\n' + '='.repeat(100));
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
  }
}

testNotifications();
