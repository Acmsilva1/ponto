# Ponto Digital

Monorepo oficial da aplicação de controle de ponto.

## Estrutura

- `api/`: backend Node.js com regras de negocio, auth, persistencia e integracao com Supabase
- `web/`: frontend React/Vite consumindo a API
- `shared/`: contratos compartilhados entre frontend e backend
- `docs/`: documentacao do projeto e instrucoes para agentes

## Fluxos oficiais

- Cadastro de colaborador: criado na tela inicial e autenticado pela API
- Recuperacao de acesso: gera senha provisoria no login e registra auditoria no banco
- Troca de senha: feita na tela propria de perfil
- Login master: `gestor / 12345`

## Comandos

- `npm run dev:web`
- `npm run dev:api`
- `npm run build`
