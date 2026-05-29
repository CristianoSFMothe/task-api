# Task API

API REST para gerenciamento de usuários, autenticação JWT e tarefas, construída com NestJS, Fastify, Drizzle ORM e PostgreSQL.

[![CI](https://img.shields.io/github/actions/workflow/status/CristianoSFMothe/task-api/ci.yml?branch=main&label=CI)](https://github.com/CristianoSFMothe/task-api/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-DOC.md-blue)](./DOC.md)
[![Swagger](https://img.shields.io/badge/swagger-%2Fdocs-85EA2D?logo=swagger&logoColor=222)](http://localhost:3333/docs)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/drizzle-orm-C5F74F?logoColor=black)](https://orm.drizzle.team/)
[![JWT](https://img.shields.io/badge/auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

## Visão geral

- Base URL da API: `http://localhost:3333/api/v1`
- Swagger: `http://localhost:3333/docs`
- Autenticação: `Bearer Token`
- Banco de dados: PostgreSQL
- ORM: Drizzle ORM

Documentação completa dos endpoints: [DOC.md](./DOC.md)

## Funcionalidades

- Cadastro público de usuários
- Login com JWT
- Listagem e busca de usuários
- Atualização do próprio nome
- Desativação e reativação de usuários por administradores
- Criação, consulta, atualização e remoção de tarefas
- Controle de status da tarefa com transições validadas

## Requisitos

- Node.js 20+
- npm
- PostgreSQL

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com os valores abaixo:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_api
JWT_SECRET=uma-chave-segura
JWT_EXPIRES_IN=1d
PORT=3333
NODE_ENV=development
```

## Instalação

```bash
npm install
```

## Banco de dados

Gerar migrations:

```bash
npm run db:generate
```

Aplicar migrations:

```bash
npm run db:migrate
```

Sincronizar schema diretamente com o banco:

```bash
npm run db:push
```

Abrir Drizzle Studio:

```bash
npm run db:studio
```

## Execução

Ambiente de desenvolvimento:

```bash
npm run start:dev
```

Build de produção:

```bash
npm run build
npm run start:prod
```

## Testes

Todos os testes:

```bash
npm run test
```

Testes por módulo:

```bash
npm run test:auth
npm run test:users
npm run test:tasks
```

Cobertura:

```bash
npm run test:cov
```

## Autenticação e permissões

- Rotas públicas:
  - `POST /api/v1/users`
  - `POST /api/v1/auth/login`
- Demais rotas exigem `Authorization: Bearer <token>`
- Rotas administrativas:
  - `GET /api/v1/users`
  - `PATCH /api/v1/users/:id/status`
  - `DELETE /api/v1/users/:id`
- Em tarefas:
  - administradores podem visualizar qualquer tarefa ativa
  - usuários comuns veem tarefas próprias e tarefas pelas quais são responsáveis
  - somente `ADMIN` ou dono da tarefa podem editar seus dados
  - `ADMIN`, dono ou responsável podem atualizar o status

## Endpoints disponíveis

| Método   | Rota                       | Descrição                             |
| -------- | -------------------------- | ------------------------------------- |
| `POST`   | `/api/v1/users`            | Criar usuário                         |
| `POST`   | `/api/v1/auth/login`       | Autenticar usuário                    |
| `POST`   | `/api/v1/auth/logout`      | Encerrar sessão lógica                |
| `GET`    | `/api/v1/users`            | Listar usuários ativos                |
| `GET`    | `/api/v1/users/search`     | Buscar usuários por nome e/ou email   |
| `GET`    | `/api/v1/users/me`         | Retornar usuário autenticado          |
| `PATCH`  | `/api/v1/users/me`         | Atualizar nome do usuário autenticado |
| `PATCH`  | `/api/v1/users/:id/status` | Reativar usuário                      |
| `DELETE` | `/api/v1/users/:id`        | Desativar usuário                     |
| `POST`   | `/api/v1/tasks`            | Criar tarefa                          |
| `GET`    | `/api/v1/tasks`            | Listar tarefas visíveis               |
| `GET`    | `/api/v1/tasks/:id`        | Buscar tarefa por ID                  |
| `PATCH`  | `/api/v1/tasks/:id`        | Atualizar dados da tarefa             |
| `PATCH`  | `/api/v1/tasks/:id/status` | Atualizar status da tarefa            |
| `DELETE` | `/api/v1/tasks/:id`        | Remover tarefa                        |

## Observações importantes

- A API usa `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true`
- Campos extras enviados no body são rejeitados
- A senha deve ter de 6 a 20 caracteres e conter ao menos uma letra minúscula, uma maiúscula, um número e um caractere especial
- O prefixo global da API é `api/v1`
- O Swagger mantém o token salvo na interface com `persistAuthorization: true`
