# 🔔 Sistema de Notificações Real-time

## Como Funciona

O sistema detecta automaticamente novos chamados através da conexão real-time com o Supabase e exibe notificações toast no **canto superior direito** da tela.

## Onde Aparecem as Notificações

```
┌─────────────────────────────────────────────────────┐
│                                         ┌─────────┐ │
│  Tech Help Dashboard                    │ 🎫 Novo │ │ <- NOTIFICAÇÃO AQUI
│                                         │ chamado │ │    (canto superior direito)
│                                         └─────────┘ │
│                                                     │
│  [KPI Cards]                                        │
│  [Gráficos]                                         │
│  [Tabela]                                           │
└─────────────────────────────────────────────────────┘
```

## Tipos de Notificação

### 1. **Novo Chamado Detectado** (Verde/Success)
- **Título**: `🎫 Novo chamado: [ID]`
- **Descrição**: Primeiros 60 caracteres do motivo
- **Ação**: Botão "Ver agora" que rola a página até a tabela
- **Duração**: 5 segundos

Exemplo:
```
🎫 Novo chamado: INC-2024-001
Impressora não funciona. Problema no driver de impressão...
[Ver agora]
```

### 2. **Múltiplos Chamados** (Azul/Info)
- Quando houver mais de 3 novos chamados simultaneamente
- Mostra: "E mais X novo(s) chamado(s)"
- **Duração**: 3 segundos

### 3. **Dados Atualizados** (Verde/Success)
- Após recarregar dados manualmente (botão refresh)
- Mensagem: "Dados atualizados com sucesso!"
- **Duração**: 2 segundos

### 4. **Erro ao Carregar** (Vermelho/Error)
- Quando falha ao buscar dados do Supabase
- Mensagem: "Erro ao carregar os dados do Supabase"

## Como Testar

### Opção 1: Adicionar Chamado Manualmente
1. Acesse o Supabase Dashboard
2. Vá em Table Editor > chamados
3. Clique em "Insert row"
4. Preencha os dados e clique em "Save"
5. A notificação aparecerá automaticamente em 500ms

### Opção 2: Sincronização via CSV
1. Adicione uma nova linha no arquivo `public/data/chamados.csv`
2. Faça commit e push para o GitHub
3. Execute a Edge Function de sincronização:
   ```bash
   curl -X POST https://[SEU-PROJECT-ID].supabase.co/functions/v1/sync-csv-to-supabase \
     -H "Authorization: Bearer [SEU-ANON-KEY]"
   ```
4. Após sincronização, a notificação aparecerá

### Opção 3: Simular em Desenvolvimento
Você pode forçar uma notificação adicionando temporariamente no código:

```typescript
// Em Index.tsx, dentro de useEffect
useEffect(() => {
  // Simular notificação após 3 segundos
  setTimeout(() => {
    toast.success("🎫 Novo chamado: INC-TEST-001", {
      description: "Teste de notificação do sistema...",
      action: {
        label: "Ver agora",
        onClick: () => console.log("Clicou!"),
      },
      duration: 5000,
    });
  }, 3000);
}, []);
```

## Configurações Técnicas

### Biblioteca Utilizada
- **Sonner**: Biblioteca moderna de toast para React
- Componente: `<Sonner />` já está em `src/App.tsx`
- Importação: `import { toast } from "sonner"`

### Real-time Subscription
```typescript
supabase
  .channel('chamados-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'chamados' },
    (payload) => {
      // Debounce de 500ms
      setTimeout(() => loadData(), 500);
    }
  )
  .subscribe();
```

### Proteção Contra Spam
- ✅ Máximo de 3 notificações individuais
- ✅ Delay de 300ms entre notificações múltiplas
- ✅ Notificações não aparecem no carregamento inicial
- ✅ Debounce de 500ms no real-time para evitar múltiplos reloads

## Troubleshooting

### Notificações Não Aparecem
1. **Verifique se o `<Sonner />` está renderizado**:
   - Abra `src/App.tsx`
   - Confirme que tem `<Sonner />` dentro do return

2. **Verifique o console do navegador**:
   - Abra DevTools (F12)
   - Procure por erros relacionados a Sonner ou toast

3. **Teste manualmente**:
   ```typescript
   // Cole no console do navegador
   toast.success("Teste!")
   ```

### Real-time Não Funciona
1. **Verifique a conexão com Supabase**:
   - Console do navegador deve mostrar: "Mudança detectada: {payload}"

2. **Confirme que Real-time está habilitado**:
   - Supabase Dashboard > Database > Replication
   - Tabela `chamados` deve estar com replicação ativada

3. **Verifique permissões RLS**:
   - As políticas RLS devem permitir SELECT na tabela

## Personalização

### Alterar Posição das Notificações
Edite `src/components/ui/sonner.tsx`:

```typescript
<Sonner
  position="top-right"  // Altere para: top-left, bottom-right, etc.
  theme={theme}
  {...props}
/>
```

### Alterar Duração Padrão
No código onde chama `toast.success()`:

```typescript
toast.success("Mensagem", {
  duration: 10000, // 10 segundos
});
```

### Adicionar Som
```typescript
toast.success("Novo chamado!", {
  onAutoClose: () => {
    new Audio('/notification.mp3').play();
  },
});
```

## Recursos Adicionais

- [Documentação Sonner](https://sonner.emilkowal.ski/)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
