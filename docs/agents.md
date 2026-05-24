# Agents

## Objetivo

Este arquivo orienta automacoes e futuros agentes que trabalhem neste repositorio.

## Convenções

- Nao reintroduzir logica de negocio no frontend
- Nao acessar Supabase diretamente pelo `web`
- Toda feature nova deve nascer na `api` e expor contrato explicito
- Dados compartilhados devem ir para `shared`
- Troca de senha fica na tela de perfil
- Recuperacao de acesso gera senha provisoria pela API e deve ser registrada no banco

## Mapa de pastas

- `api/src/features/*`
- `web/src/features/*`
- `shared/src/*`
