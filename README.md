# Ponto Digital

Monorepo oficial da aplicação de ponto.

## Estrutura

- `api/`: backend Node.js com MVC por feature
- `web/`: frontend React
- `shared/`: contratos comuns
- `docs/`: documentação do projeto e agentes

## Comandos

- `npm run dev:web`
- `npm run dev:api`
- `npm run build`

## Banco

O schema oficial fica em `api/sql/schema.sql`.

Quando houver mudança de colunas em produção, aplique a migração SQL correspondente em `api/sql/migrations/` no banco Supabase antes de publicar o deploy.
