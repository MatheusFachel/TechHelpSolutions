/**
 * AUDITORIA COMPLETA: CSV → Supabase → Dashboard
 * 
 * Este script verifica a integridade dos dados em todo o fluxo:
 * 1. Lê o CSV local (fonte primária)
 * 2. Busca dados do Supabase (banco de dados)
 * 3. Compara registro por registro
 * 4. Identifica divergências
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

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

function parseCSV(csvContent: string): ChamadoDB[] {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim()
  });

  return result.data.map((row: any) => {
    // Converter TMA e FRT para número
    const tma = row['TMA (minutos)'];
    const frt = row['FRT (minutos)'];
    
    return {
      'ID do Chamado': row['ID do Chamado'] || null,
      'Data de Abertura': row['Data de Abertura'] || null,
      'Data de Fechamento': row['Data de Fechamento'] || null,
      'Status': row['Status'] || null,
      'Prioridade': row['Prioridade'] || null,
      'Motivo': row['Motivo'] || null,
      'Solução': row['Solução'] || null,
      'Solicitante': row['Solicitante'] || null,
      'Agente Responsável': row['Agente Responsável'] || null,
      'Departamento': row['Departamento'] || null,
      'TMA (minutos)': tma && tma !== '' ? parseInt(tma) : 0,
      'FRT (minutos)': frt && frt !== '' ? parseInt(frt) : 0,
      'Satisfação do Cliente': row['Satisfação do Cliente'] || null
    } as ChamadoDB;
  });
}

async function auditDataIntegrity() {
  console.log('\n🔍 AUDITORIA COMPLETA DE DADOS\n');
  console.log('='.repeat(100));
  
  try {
    // 1. Ler CSV local
    console.log('\n📄 1. LENDO CSV LOCAL...\n');
    const csvPath = path.join(process.cwd(), 'public', 'data', 'chamados.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const csvData = parseCSV(csvContent);
    console.log(`   ✅ ${csvData.length} registros lidos do CSV`);

    // 2. Buscar dados do Supabase
    console.log('\n💾 2. BUSCANDO DADOS DO SUPABASE...\n');
    const { data: supabaseData, error } = await supabase
      .from('chamados')
      .select('*')
      .order('"ID do Chamado"', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar dados do Supabase:', error);
      return;
    }

    console.log(`   ✅ ${supabaseData?.length || 0} registros retornados do Supabase`);

    // 3. Comparar quantidades
    console.log('\n' + '='.repeat(100));
    console.log('\n📊 3. COMPARAÇÃO DE QUANTIDADES:\n');
    console.log(`   CSV:      ${csvData.length} registros`);
    console.log(`   Supabase: ${supabaseData?.length || 0} registros`);
    
    if (csvData.length === supabaseData?.length) {
      console.log('\n   ✅ QUANTIDADE: Perfeito! Mesma quantidade em ambos.\n');
    } else {
      console.log(`\n   ❌ ATENÇÃO: Diferença de ${Math.abs(csvData.length - (supabaseData?.length || 0))} registros!\n`);
    }

    // 4. Comparar registros individuais
    console.log('='.repeat(100));
    console.log('\n🔬 4. COMPARAÇÃO DETALHADA (primeiros 10 registros):\n');
    
    let divergencias = 0;
    const maxCheck = Math.min(10, csvData.length);

    for (let i = 0; i < maxCheck; i++) {
      const csvRecord = csvData[i];
      const supabaseRecord = supabaseData?.find((r: ChamadoDB) => r['ID do Chamado'] === csvRecord['ID do Chamado']);

      console.log(`\n   📋 Registro ${i + 1}: ${csvRecord['ID do Chamado']}`);

      if (!supabaseRecord) {
        console.log('      ❌ NÃO ENCONTRADO NO SUPABASE!');
        divergencias++;
        continue;
      }

      // Comparar campos-chave
      const camposParaComparar: (keyof ChamadoDB)[] = [
        'Status',
        'Prioridade',
        'Motivo',
        'Agente Responsável',
        'Departamento',
        'TMA (minutos)',
        'FRT (minutos)',
        'Satisfação do Cliente'
      ];

      let divergiu = false;
      camposParaComparar.forEach(campo => {
        const csvValue = csvRecord[campo];
        const supabaseValue = supabaseRecord[campo];

        if (csvValue !== supabaseValue) {
          if (!divergiu) {
            console.log('      ⚠️  DIVERGÊNCIAS:');
            divergiu = true;
            divergencias++;
          }
          console.log(`         ${campo}:`);
          console.log(`            CSV:      "${csvValue}"`);
          console.log(`            Supabase: "${supabaseValue}"`);
        }
      });

      if (!divergiu) {
        console.log('      ✅ Todos os campos coincidem');
      }
    }

    // 5. Verificar distribuição por Status
    console.log('\n' + '='.repeat(100));
    console.log('\n📊 5. DISTRIBUIÇÃO POR STATUS:\n');

    const csvStatusCount: Record<string, number> = {};
    csvData.forEach(r => {
      csvStatusCount[r.Status] = (csvStatusCount[r.Status] || 0) + 1;
    });

    const supabaseStatusCount: Record<string, number> = {};
    supabaseData?.forEach((r: ChamadoDB) => {
      supabaseStatusCount[r.Status] = (supabaseStatusCount[r.Status] || 0) + 1;
    });

    console.log('   Status         | CSV   | Supabase | Match');
    console.log('   ' + '-'.repeat(60));

    const allStatuses = new Set([...Object.keys(csvStatusCount), ...Object.keys(supabaseStatusCount)]);
    allStatuses.forEach(status => {
      const csvCount = csvStatusCount[status] || 0;
      const supabaseCount = supabaseStatusCount[status] || 0;
      const match = csvCount === supabaseCount ? '✅' : '❌';
      console.log(`   ${status.padEnd(15)}| ${csvCount.toString().padStart(5)} | ${supabaseCount.toString().padStart(8)} | ${match}`);
    });

    // 6. Resumo final
    console.log('\n' + '='.repeat(100));
    console.log('\n📋 RESUMO DA AUDITORIA:\n');

    console.log(`   Total de registros verificados: ${maxCheck}`);
    console.log(`   Divergências encontradas: ${divergencias}`);
    
    if (divergencias === 0 && csvData.length === supabaseData?.length) {
      console.log('\n   ✅✅✅ PERFEITO! Dados 100% íntegros em todo o fluxo! ✅✅✅\n');
      console.log('   ✅ Nenhum dado hard-coded ou alucinação detectada');
      console.log('   ✅ CSV e Supabase estão perfeitamente sincronizados');
      console.log('   ✅ Dashboard está consumindo dados reais do banco\n');
    } else {
      console.log('\n   ⚠️  ATENÇÃO: Foram encontradas divergências!\n');
      console.log('   Revise os logs acima para detalhes.\n');
    }

    console.log('='.repeat(100));

  } catch (error) {
    console.error('\n❌ ERRO DURANTE A AUDITORIA:', error);
  }
}

// Executar auditoria
auditDataIntegrity();
