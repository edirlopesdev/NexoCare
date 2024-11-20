# Contexto do Banco de Dados

O projeto utiliza Supabase com as seguintes tabelas principais:

1. clientes
   - id: UUID (PK)
   - empresa_id: UUID (FK para empresas)
   - nome: text
   - tipo_cabelo: text (nullable)
   - condicao_cabelo: text (nullable)
   - criado_em: timestamp with time zone

2. agendamentos
   - id: UUID (PK)
   - empresa_id: UUID (FK para empresas)
   - usuario_id: UUID (FK para auth.users)
   - cliente_id: UUID (FK para clientes)
   - data_agendamento: timestamp with time zone
   - tipo_servico: text (nullable)
   - status: text ('pendente', 'confirmado', 'cancelado')
   - observacoes: text (nullable)
   - criado_em: timestamp with time zone

3. perfis
   - id: UUID (PK, FK para auth.users)
   - empresa_id: UUID (FK para empresas)
   - nome: text
   - cargo: text
   - criado_em: timestamp with time zone

5. planos
   - id: UUID (PK)
   - nome: text
   - max_usuarios: integer
   - recursos: jsonb
   - preco: numeric(10, 2)
   - criado_em: timestamp with time zone

6. produtos
   - id: UUID (PK)
   - empresa_id: UUID (FK para empresas)
   - nome: text
   - marca: text
   - tipo: text
   - codigo_cor: text (nullable)
   - criado_em: timestamp with time zone

As interfaces TypeScript correspondentes estão definidas em src/types/supabase-types.ts.
