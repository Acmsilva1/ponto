# Arquitetura

## Visao geral

O projeto foi organizado em tres camadas:

- `web`: interface do usuario
- `api`: backend Node.js com MVC por feature
- `shared`: tipos e contratos

## Fluxo

1. O usuario abre o `web`
2. O frontend chama a `api`
3. A `api` valida, autentica e persiste no Supabase
4. O frontend apenas renderiza o resultado

## Regras

- O frontend nao acessa o Supabase diretamente
- O backend e a unica camada que conhece o banco
- Autenticacao e autorizacao vivem na `api`
- Recuperacao de acesso gera senha provisoria no backend
- Troca de senha acontece na tela propria de perfil
