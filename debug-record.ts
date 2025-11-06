/**
 * Debug específico do registro CHAMADO-00010
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const supabaseUrl = 'https://bttgotjfushzmcrfkpxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dGdvdGpmdXNoem1jcmZrcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDU2MzgsImV4cCI6MjA3NzY4MTYzOH0.I8aiwrY_oZpsq-kuGvAThpxgixx7fcoj-MqrTc_ywmI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRecord() {
  console.log('\n🔍 DEBUG: CHAMADO-00010\n');
  console.log('='.repeat(100));
  
  // 1. Ler do CSV
  console.log('\n📄 DADOS DO CSV:\n');
  const csvPath = path.join(process.cwd(), 'public', 'data', 'chamados.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
  });
  
  const csvRecord = result.data.find((row: any) => row['ID do Chamado'] === 'CHAMADO-00010');
  console.log(JSON.stringify(csvRecord, null, 2));
  
  // 2. Buscar do Supabase
  console.log('\n' + '='.repeat(100));
  console.log('\n💾 DADOS DO SUPABASE:\n');
  const { data, error } = await supabase
    .from('chamados')
    .select('*')
    .eq('"ID do Chamado"', 'CHAMADO-00010')
    .single();
    
  if (error) {
    console.error('Erro:', error);
    return;
  }
  
  console.log(JSON.stringify(data, null, 2));
  
  console.log('\n' + '='.repeat(100));
}

debugRecord();
