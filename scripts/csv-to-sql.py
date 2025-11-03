# 🔄 Script Python para Converter CSV → SQL INSERT

import csv
import os

# Configurações
csv_file = "cahamado suporte tecnico.csv"  # Seu arquivo CSV
output_sql = "import-all-chamados.sql"

def escape_sql_string(value):
    """Escapa aspas simples para SQL"""
    if value is None or value == '':
        return 'NULL'
    # Substituir aspas simples por duas aspas simples
    value = str(value).replace("'", "''")
    return f"'{value}'"

def convert_csv_to_sql(csv_path, output_path):
    """Converte CSV para SQL INSERTs"""
    
    inserts = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        headers = next(reader)  # Pular header
        
        for row in reader:
            # Escapar valores
            id_chamado = escape_sql_string(row[0])
            data_abertura = escape_sql_string(row[1])
            data_fechamento = escape_sql_string(row[2]) if row[2] else 'NULL'
            status = escape_sql_string(row[3])
            prioridade = escape_sql_string(row[4])
            motivo = escape_sql_string(row[5])
            solucao = escape_sql_string(row[6]) if row[6] else 'NULL'
            solicitante = escape_sql_string(row[7])
            agente = escape_sql_string(row[8])
            departamento = escape_sql_string(row[9])
            tma = row[10] if row[10] else '0'
            frt = row[11] if row[11] else '0'
            satisfacao = escape_sql_string(row[12])
            
            # Criar INSERT
            insert = f'''INSERT INTO chamados ("ID do Chamado", "Data de Abertura", "Data de Fechamento", "Status", "Prioridade", "Motivo", "Solução", "Solicitante", "Agente Responsável", "Departamento", "TMA (minutos)", "FRT (minutos)", "Satisfação do Cliente")
VALUES ({id_chamado}, {data_abertura}, {data_fechamento}, {status}, {prioridade}, {motivo}, {solucao}, {solicitante}, {agente}, {departamento}, {tma}, {frt}, {satisfacao});'''
            
            inserts.append(insert)
    
    # Escrever arquivo SQL
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write("-- Importação completa de todos os chamados\n")
        file.write("-- Total de registros: {}\n\n".format(len(inserts)))
        file.write("BEGIN;\n\n")
        file.write('\n'.join(inserts))
        file.write("\n\nCOMMIT;\n")
        file.write("\n-- Verificar importação:\n")
        file.write("SELECT COUNT(*) as total FROM chamados;\n")
    
    print(f"✅ Arquivo SQL criado: {output_path}")
    print(f"📊 Total de INSERTs: {len(inserts)}")

if __name__ == "__main__":
    # Tentar encontrar o CSV em vários locais
    possible_paths = [
        os.path.join(os.path.expanduser("~"), "Downloads", csv_file),
        os.path.join(os.path.dirname(__file__), "..", "public", "data", csv_file),
        os.path.join(os.path.dirname(__file__), csv_file),
    ]
    
    csv_path = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_path = path
            break
    
    if csv_path is None:
        print(f"❌ Arquivo CSV não encontrado!")
        print(f"📝 Procurei em:")
        for path in possible_paths:
            print(f"   - {path}")
        print(f"\n� Copie o arquivo '{csv_file}' para uma dessas pastas")
        print(f"   OU edite a variável 'csv_file' no script com o caminho completo")
    else:
        print(f"✅ CSV encontrado: {csv_path}")
        convert_csv_to_sql(csv_path, output_sql)
        print(f"\n🎯 Próximos passos:")
        print(f"1. Abra o arquivo: {output_sql}")
        print(f"2. Copie todo o conteúdo")
        print(f"3. Cole no Supabase SQL Editor")
        print(f"4. Execute (Ctrl + Enter)")
