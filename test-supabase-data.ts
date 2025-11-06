/**
 * Script de teste para validar dados do Supabase
 * 
 * Este script verifica:
 * 1. Conexão com Supabase
 * 2. Quantidade de registros na tabela 'chamados'
 * 3. Primeiros registros para comparação com CSV
 * 4. Últimos registros adicionados
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://bttgotjfushzmcrfkpxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dGdvdGpmdXNoem1jcmZrcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDU2MzgsImV4cCI6MjA3NzY4MTYzOH0.I8aiwrY_oZpsq-kuGvAThpxgixx7fcoj-MqrTc_ywmI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ChamadoDB {
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

async function testSupabaseData() {
  console.log('\n🔍 TESTE DE DADOS DO SUPABASE\n');
  console.log('='.repeat(80));
  
  try {
    // 1. Verificar conexão e contar registros
    console.log('\n📊 1. CONTANDO REGISTROS...\n');
    const { count, error: countError } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      return;
    }

    console.log(`✅ Total de registros no Supabase: ${count}`);
    
    // 2. Contar linhas do CSV (excluindo header)
    const csvPath = path.join(process.cwd(), 'public', 'data', 'chamados.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const csvLines = csvContent.trim().split('\n').length - 1; // -1 para remover header
    
    console.log(`📄 Total de registros no CSV: ${csvLines}`);
    
    if (count === csvLines) {
      console.log('\n✅ PERFEITO! Quantidade de registros coincide!\n');
    } else {
      console.log(`\n⚠️ ATENÇÃO! Diferença de ${Math.abs((count || 0) - csvLines)} registros!\n`);
    }

    // 3. Buscar primeiros 5 registros
    console.log('='.repeat(80));
    console.log('\n📋 2. PRIMEIROS 5 REGISTROS DO SUPABASE:\n');
    
    const { data: firstRecords, error: firstError } = await supabase
      .from('chamados')
      .select('*')
      .order('"ID do Chamado"', { ascending: true })
      .limit(5);

    if (firstError) {
      console.error('❌ Erro ao buscar primeiros registros:', firstError);
      return;
    }

    firstRecords?.forEach((record: ChamadoDB, index) => {
      console.log(`${index + 1}. ID: ${record['ID do Chamado']}`);
      console.log(`   Status: ${record['Status']} | Prioridade: ${record['Prioridade']}`);
      console.log(`   Técnico: ${record['Agente Responsável']}`);
      console.log(`   Motivo: ${record['Motivo'].substring(0, 50)}...`);
      console.log('');
    });

    // 4. Buscar últimos 5 registros
    console.log('='.repeat(80));
    console.log('\n📋 3. ÚLTIMOS 5 REGISTROS DO SUPABASE:\n');
    
    const { data: lastRecords, error: lastError } = await supabase
      .from('chamados')
      .select('*')
      .order('"ID do Chamado"', { ascending: false })
      .limit(5);

    if (lastError) {
      console.error('❌ Erro ao buscar últimos registros:', lastError);
      return;
    }

    lastRecords?.forEach((record: ChamadoDB, index) => {
      console.log(`${index + 1}. ID: ${record['ID do Chamado']}`);
      console.log(`   Status: ${record['Status']} | Prioridade: ${record['Prioridade']}`);
      console.log(`   Técnico: ${record['Agente Responsável']}`);
      console.log(`   Motivo: ${record['Motivo'].substring(0, 50)}...`);
      console.log('');
    });

    // 5. Agrupar por Status
    console.log('='.repeat(80));
    console.log('\n📊 4. DISTRIBUIÇÃO POR STATUS:\n');
    
    const { data: allRecords, error: allError } = await supabase
      .from('chamados')
      .select('Status');

    if (allError) {
      console.error('❌ Erro ao buscar todos registros:', allError);
      return;
    }

    const statusCount: Record<string, number> = {};
    allRecords?.forEach((record: any) => {
      const status = record.Status;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    Object.entries(statusCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        const percentage = ((count / (allRecords?.length || 1)) * 100).toFixed(1);
        console.log(`   ${status.padEnd(15)} : ${count.toString().padStart(3)} (${percentage}%)`);
      });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!\n');

  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE:', error);
  }
}

// Executar teste
testSupabaseData();
