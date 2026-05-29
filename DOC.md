# Documentação da Task API

## Índice

- [Visão Geral](#visão-geral)
- [URLs e Ambientes](#urls-e-ambientes)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [CORS](#cors)
- [Convenções da API](#convenções-da-api)
- [Autenticação](#autenticação)
- [Perfis e Regras de Acesso](#perfis-e-regras-de-acesso)
- [Validação e Erros](#validação-e-erros)
- [Glossário de Mensagens](#glossário-de-mensagens)
- [Modelos de Dados](#modelos-de-dados)
- [Fluxos de Negócio Importantes](#fluxos-de-negócio-importantes)
- [Guia de Início Rápido](#guia-de-início-rápido)
- [Referência dos Endpoints](#referência-dos-endpoints)
- [Exemplos cURL](#exemplos-curl)

## Visão Geral

A Task API é uma API REST para:

- autenticação com JWT
- cadastro e gerenciamento de usuários
- criação e acompanhamento de tarefas
- controle de responsáveis
- transições de status validadas no backend

Stack principal:

- NestJS 11
- Fastify
- PostgreSQL
- Drizzle ORM
- JWT
- Class Validator + Zod

## URLs e Ambientes

- Base URL local: `http://localhost:3333/api/v1`
- Swagger: `http://localhost:3333/docs`
- Content-Type padrão: `application/json`

Prefixo global da aplicação:

```text
/api/v1
```

Exemplo real de rota:

```text
POST /api/v1/auth/login
```

## Variáveis de Ambiente

A aplicação lê a configuração de um arquivo `.env` na raiz do projeto.

| Variável         | Obrigatória | Padrão        | Descrição                                            |
| ---------------- | ----------- | ------------- | ---------------------------------------------------- |
| `DATABASE_URL`   | sim         | —             | String de conexão do PostgreSQL                      |
| `JWT_SECRET`     | sim         | —             | Chave usada para assinar e validar os tokens JWT     |
| `JWT_EXPIRES_IN` | não         | `1d`          | Tempo de expiração do token (ex.: `1d`, `12h`, `30m`)|
| `NODE_ENV`       | sim         | —             | `development`, `production` ou `test`                |
| `PORT`           | não         | `3333`        | Porta HTTP do servidor                               |

Exemplo de `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_api
JWT_SECRET=uma-chave-segura
JWT_EXPIRES_IN=1d
NODE_ENV=development
PORT=3333
```

## CORS

O CORS está habilitado globalmente com a seguinte configuração:

| Opção         | Valor                                          |
| ------------- | ---------------------------------------------- |
| `origin`      | `true` (reflete e aceita qualquer origem)      |
| `methods`     | `GET, POST, PUT, PATCH, DELETE, OPTIONS`       |
| `credentials` | `true` (permite envio de cookies/credenciais)  |

> Em produção, recomenda-se restringir `origin` a uma lista explícita de domínios confiáveis em vez de aceitar qualquer origem.

## Convenções da API

- **Content-Type**: todas as requisições e respostas usam `application/json`.
- **Nomenclatura**: os campos das respostas seguem `camelCase`. A única exceção é `access_token` (em `snake_case`) na resposta de login.
- **Datas**: todos os campos de data/hora são retornados como strings no formato **ISO 8601** com timezone (ex.: `2026-05-28T13:45:30.000Z`).
- **Identificadores**: todos os `id` são `UUID` v4.
- **Paginação**: os endpoints de listagem (`GET /tasks` e `GET /users`) **não** possuem paginação — retornam a lista completa já filtrada por permissão e pelos query params disponíveis. Não há parâmetros `page`, `limit` ou `offset`.

## Autenticação

A API usa JWT Bearer Token.

Header esperado:

```http
Authorization: Bearer <token>
```

Rotas públicas:

- `POST /users`
- `POST /auth/login`

Todas as demais rotas exigem token válido.

O token é emitido pelo endpoint `POST /auth/login`.

Detalhes do token:

- **Algoritmo**: `HS256` (HMAC SHA-256), assinado com `JWT_SECRET`
- **Expiração**: definida por `JWT_EXPIRES_IN` (padrão `1d`)
- **Payload**:

```json
{
  "sub": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "email": "john@example.com",
  "role": "USER"
}
```

| Campo   | Descrição                          |
| ------- | ---------------------------------- |
| `sub`   | ID (UUID) do usuário autenticado   |
| `email` | Email do usuário                   |
| `role`  | Perfil do usuário (`USER`/`ADMIN`) |

Se o token for inválido, expirado ou apontar para um usuário inexistente/inativo, a API retorna `401`.

Observações sobre a sessão:

- não há **refresh token** — quando o token expira, é necessário autenticar novamente
- o `POST /auth/logout` é apenas lógico: **não** existe blacklist de tokens no servidor, então o token continua válido até expirar

## Perfis e Regras de Acesso

Perfis disponíveis:

- `USER`
- `ADMIN`

Regras gerais:

- `ADMIN` pode acessar rotas administrativas de usuários
- `ADMIN` pode visualizar qualquer tarefa ativa
- usuário comum visualiza apenas:
  - tarefas próprias
  - tarefas em que é responsável
- somente `ADMIN` ou o dono da tarefa podem editar dados da tarefa
- `ADMIN`, dono da tarefa ou responsável podem atualizar status da tarefa
- somente `ADMIN` ou o dono da tarefa podem deletá-la

## Validação e Erros

### Validação global

A aplicação usa `ValidationPipe` global com:

- `whitelist: true`
- `forbidNonWhitelisted: true`

Isso significa:

- campos extras fora do DTO são rejeitados
- tipos e formatos inválidos retornam `400`
- alguns endpoints ainda têm validação complementar com Zod no service

### Formato comum de erros do Nest

Exemplo de erro `400`:

```json
{
  "message": [
    "Informe um email válido",
    "A senha deve ter no mínimo 6 caracteres",
    "A senha deve conter ao menos uma letra maiúscula",
    "A senha deve conter ao menos um número",
    "A senha deve conter ao menos um caractere especial"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Exemplo de erro `401`:

```json
{
  "message": "Email ou senha inválidos",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Exemplo de erro `403`:

```json
{
  "message": "Você não tem permissão para atualizar esta tarefa",
  "error": "Forbidden",
  "statusCode": 403
}
```

Exemplo de erro `404`:

```json
{
  "message": "Tarefa não encontrada",
  "error": "Not Found",
  "statusCode": 404
}
```

### Códigos de status usados

| Código | Quando aparece                                                         |
| ------ | ---------------------------------------------------------------------- |
| `200`  | leitura, atualização, logout e remoções bem-sucedidas                  |
| `201`  | criação bem-sucedida                                                   |
| `400`  | payload inválido, UUID inválido, filtros inválidos, transição inválida |
| `401`  | token inválido ou credenciais inválidas                                |
| `403`  | usuário autenticado sem permissão suficiente                           |
| `404`  | recurso não encontrado ou invisível pela regra de acesso               |
| `409`  | conflito de unicidade, como email já cadastrado                        |

## Glossário de Mensagens

Todas as mensagens retornadas pela API são centralizadas no código. Abaixo, o catálogo completo por categoria.

### Validação (`400`)

| Mensagem                                                  | Quando ocorre                                  |
| --------------------------------------------------------- | ---------------------------------------------- |
| `O nome é obrigatório`                                    | `name` ausente                                 |
| `O nome deve ter no mínimo 2 caracteres`                  | `name` curto demais                            |
| `O nome deve ter no máximo 100 caracteres`                | `name` longo demais                            |
| `O email é obrigatório`                                   | `email` ausente                                |
| `Informe um email válido`                                 | `email` em formato inválido                    |
| `A senha é obrigatória`                                   | `password` ausente                             |
| `A senha deve ter no mínimo 6 caracteres`                 | `password` com menos de 6 caracteres           |
| `A senha deve ter no máximo 20 caracteres`                | `password` com mais de 20 caracteres           |
| `A senha deve conter ao menos uma letra minúscula`        | `password` sem letra minúscula                 |
| `A senha deve conter ao menos uma letra maiúscula`        | `password` sem letra maiúscula                 |
| `A senha deve conter ao menos um número`                  | `password` sem dígito                          |
| `A senha deve conter ao menos um caractere especial`      | `password` sem caractere especial              |
| `O título é obrigatório`                                  | `title` da tarefa ausente                      |
| `Informe ao menos um campo para atualizar a tarefa`       | `PATCH /tasks/:id` sem nenhum campo            |
| `Informe ao menos um filtro de busca: name e/ou email`    | `GET /users/search` sem filtros                |

### Autenticação (`401`)

| Mensagem                  | Quando ocorre                                |
| ------------------------- | -------------------------------------------- |
| `Email ou senha inválidos`| credenciais incorretas no login              |
| `Token inválido`          | token ausente, malformado ou expirado        |

### Usuários

| Mensagem                                       | Status | Quando ocorre                            |
| ---------------------------------------------- | ------ | ---------------------------------------- |
| `Usuário não encontrado`                       | `404`  | usuário inexistente ou inativo           |
| `Email já cadastrado`                          | `409`  | e-mail duplicado na criação              |
| `Usuário deletado com sucesso`                 | `200`  | desativação lógica concluída             |
| `Usuário já está ativo`                        | `200`  | reativação de usuário já ativo           |
| `Status do usuário atualizado com sucesso`     | `200`  | reativação concluída                     |

### Tarefas

| Mensagem                                                             | Status | Quando ocorre                                  |
| -------------------------------------------------------------------- | ------ | ---------------------------------------------- |
| `Apenas administradores podem criar tarefas para outros usuários`    | `403`  | `USER` tenta usar `userEmail` de outra pessoa  |
| `Tarefa não encontrada`                                              | `404`  | tarefa inexistente ou fora da visibilidade     |
| `Você não tem permissão para atualizar esta tarefa`                  | `403`  | edição sem ser dono/admin                      |
| `Você não tem permissão para atualizar o status desta tarefa`        | `403`  | mudança de status sem permissão                |
| `Transição de status da tarefa inválida`                             | `400`  | transição fora da máquina de estados           |
| `Você não tem permissão para deletar esta tarefa`                    | `403`  | exclusão sem permissão                         |
| `Tarefas concluídas não podem ser deletadas`                         | `400`  | tentativa de deletar tarefa `DONE`             |
| `Tarefa deletada com sucesso`                                        | `200`  | exclusão concluída                             |

### Autenticação — sucesso

| Mensagem                          | Status | Quando ocorre        |
| --------------------------------- | ------ | -------------------- |
| `Logout realizado com sucesso`    | `200`  | logout efetuado      |

## Modelos de Dados

### Usuário

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Usuário com tarefas

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "John Doe",
  "email": "john@example.com",
  "tasks": [
    {
      "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
      "title": "Preparar documentação da API",
      "description": "Consolidar os endpoints do módulo de tarefas.",
      "tags": ["backend", "documentacao"],
      "status": "PENDING",
      "createdBy": "John Doe",
      "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
      "responsibleId": null
    }
  ]
}
```

### Resposta de login

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Tarefa

```json
{
  "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
  "title": "Preparar documentação da API",
  "description": "Consolidar os endpoints do módulo de tarefas.",
  "tags": ["backend", "documentacao"],
  "status": "PENDING",
  "createdBy": "John Doe",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "responsibleId": null
}
```

### Dicionário de campos

#### Usuário (resposta)

| Campo   | Tipo     | Descrição                                                              |
| ------- | -------- | ---------------------------------------------------------------------- |
| `id`    | `uuid`   | Identificador único do usuário                                         |
| `name`  | `string` | Nome do usuário                                                        |
| `email` | `string` | E-mail único do usuário                                                |
| `role`  | `enum`   | `USER` ou `ADMIN` — retornado apenas em respostas que expõem o perfil  |
| `tasks` | `array`  | Tarefas associadas — presente em `GET /users`, `GET /users/me` e busca |

> A `password` **nunca** é retornada em nenhuma resposta. Ela é armazenada com hash `bcrypt` (10 rounds).

#### Tarefa (resposta)

| Campo           | Tipo           | Descrição                                                           |
| --------------- | -------------- | ------------------------------------------------------------------- |
| `id`            | `uuid`         | Identificador único da tarefa                                       |
| `title`         | `string`       | Título da tarefa                                                    |
| `description`   | `string\|null` | Descrição livre; `null` quando não informada                        |
| `tags`          | `string[]`     | Lista de etiquetas; default `[]`                                    |
| `status`        | `enum`         | Status atual (ver enums abaixo)                                     |
| `createdBy`     | `string`       | Nome do usuário que criou a tarefa                                  |
| `userId`        | `uuid`         | ID do **dono** da tarefa                                            |
| `responsibleId` | `uuid\|null`   | ID do **responsável**; `null` quando não há responsável            |

#### Campos internos (não retornados na API)

A tabela de tarefas possui campos de controle que existem no banco mas **não** são expostos nas respostas:

| Campo            | Tipo        | Descrição                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------------------- |
| `isActive`       | `boolean`   | Controle de exclusão lógica (`false` = removida logicamente)              |
| `createdAt`      | `timestamp` | Data de criação                                                           |
| `updatedAt`      | `timestamp` | Data da última atualização                                                |
| `startedAt`      | `timestamp` | Preenchido ao entrar em `IN_PROGRESS` pela primeira vez                   |
| `completedAt`    | `timestamp` | Preenchido ao entrar em `DONE`                                            |
| `completionTime` | `integer`   | Tempo de conclusão em segundos (`completedAt − startedAt`), se aplicável  |
| `deletedAt`      | `timestamp` | Data da exclusão lógica                                                   |

> O usuário também possui `createdAt` e `updatedAt` internos, não retornados nas respostas.

### Enums relevantes

Status de usuário:

- `ACTIVE`
- `INACTIVE`

Status de tarefa:

- `PENDING`
- `IN_PROGRESS`
- `PAUSED`
- `BLOCKED`
- `DONE`
- `CANCELLED`

## Fluxos de Negócio Importantes

### Criação de usuários

- a rota de criação é pública
- usuários novos entram como `USER`
- usuários novos entram como `ACTIVE`
- `email` é único

### Criação de tarefas

- sem `userEmail`, a tarefa pertence ao usuário autenticado
- somente `ADMIN` pode criar tarefa para outro usuário
- `responsibleEmail` é opcional
- o responsável pode ser:
  - o dono da tarefa
  - o usuário autenticado
  - outro usuário ativo existente

### Atualização de tarefas

- pelo menos um campo deve ser enviado
- `description: ""` vira `null`
- `responsibleId: null` remove o responsável
- atualização de dados não altera o `status`

### Atualização de status da tarefa

Transições permitidas:

| Atual         | Permitidos                               |
| ------------- | ---------------------------------------- |
| `PENDING`     | `IN_PROGRESS`, `CANCELLED`               |
| `IN_PROGRESS` | `DONE`, `PAUSED`, `BLOCKED`, `CANCELLED` |
| `PAUSED`      | `IN_PROGRESS`, `BLOCKED`, `CANCELLED`    |
| `BLOCKED`     | `IN_PROGRESS`, `PAUSED`, `CANCELLED`     |
| `DONE`        | nenhum                                   |
| `CANCELLED`   | nenhum                                   |

Efeitos automáticos:

- ao entrar em `IN_PROGRESS`, `startedAt` é preenchido se ainda estiver vazio
- ao entrar em `DONE`, `completedAt` é preenchido
- ao entrar em `DONE`, `completionTime` é calculado em segundos se `startedAt` existir

### Exclusão de tarefas

- `ADMIN` faz exclusão física
- usuário comum faz exclusão lógica
- tarefas `DONE` não podem ser deletadas

## Guia de Início Rápido

Fluxo típico de uso da API, do cadastro até a conclusão de uma tarefa.

### 1. Criar uma conta

```bash
curl -X POST http://localhost:3333/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{ "name": "John Doe", "email": "john@example.com", "password": "Senha@123" }'
```

### 2. Autenticar e obter o token

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com", "password": "Senha@123" }'
```

Guarde o `access_token` retornado.

### 3. Usar o token nas próximas requisições

Inclua o header em todas as rotas protegidas:

```http
Authorization: Bearer SEU_TOKEN
```

### 4. Criar uma tarefa

```bash
curl -X POST http://localhost:3333/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{ "title": "Preparar documentação da API", "tags": ["backend"] }'
```

A tarefa nasce com status `PENDING` e pertence ao usuário autenticado.

### 5. Avançar o status da tarefa

```bash
curl -X PATCH http://localhost:3333/api/v1/tasks/<TASK_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{ "status": "IN_PROGRESS" }'
```

Ao entrar em `IN_PROGRESS`, o `startedAt` é registrado. Em seguida, ao mover para `DONE`, o `completedAt` e o `completionTime` são calculados automaticamente.

> Respeite a [tabela de transições](#atualização-de-status-da-tarefa): a partir de `PENDING`, só é possível ir para `IN_PROGRESS` ou `CANCELLED`.

## Referência dos Endpoints

## Auth

### `POST /auth/login`

Resumo: autentica um usuário e retorna um JWT.

Autenticação: pública

Body:

| Campo      | Tipo     | Obrigatório | Regra              |
| ---------- | -------- | ----------- | ------------------ |
| `email`    | `string` | sim         | email válido       |
| `password` | `string` | sim         | não pode ser vazia |

Exemplo de request:

```json
{
  "email": "john@example.com",
  "password": "Senha@123"
}
```

Resposta `200`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "John Doe",
  "email": "john@example.com"
}
```

Regras:

- o usuário deve existir
- o usuário deve estar ativo
- email e senha devem ser compatíveis

Erros comuns:

- `400`: payload inválido
- `401`: `Email ou senha inválidos`

### `POST /auth/logout`

Resumo: encerra a sessão lógica do usuário autenticado.

Autenticação: obrigatória

Body: não possui

Resposta `200`:

```json
{
  "message": "Logout realizado com sucesso"
}
```

Observação:

- não existe blacklist de token nesta rota

## Users

### `POST /users`

Resumo: cria um novo usuário.

Autenticação: pública

Body:

| Campo      | Tipo     | Obrigatório | Regra                                                                                                            |
| ---------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `name`     | `string` | sim         | entre 2 e 100 caracteres                                                                                         |
| `email`    | `string` | sim         | email válido e único                                                                                             |
| `password` | `string` | sim         | de 6 a 20 caracteres, com ao menos uma minúscula, uma maiúscula, um número e um caractere especial               |

Exemplo de request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Senha@123"
}
```

Resposta `201`:

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "John Doe",
  "email": "john@example.com"
}
```

Erros comuns:

- `400`: dados inválidos
- `409`: `Email já cadastrado`

### `GET /users`

Resumo: lista todos os usuários ativos com suas tarefas.

Autenticação: obrigatória

Permissão: `ADMIN`

Query params: não possui

Resposta `200`:

```json
[
  {
    "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
    "name": "John Doe",
    "email": "john@example.com",
    "tasks": []
  }
]
```

Erros comuns:

- `401`: token ausente, inválido ou expirado
- `403`: acesso administrativo necessário

### `GET /users/search`

Resumo: busca usuários ativos por nome e/ou email.

Autenticação: obrigatória

Permissão: usuário autenticado

Query params:

| Parâmetro | Tipo     | Obrigatório | Regra         |
| --------- | -------- | ----------- | ------------- |
| `name`    | `string` | não         | busca parcial |
| `email`   | `string` | não         | busca exata   |

Regras:

- é obrigatório informar `name`, `email` ou ambos
- `email` deve ser válido quando enviado

Exemplo:

```http
GET /api/v1/users/search?name=john
```

Resposta `200`:

```json
[
  {
    "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
    "name": "John Doe",
    "email": "john@example.com",
    "tasks": []
  }
]
```

Erros comuns:

- `400`: nenhum filtro informado ou email inválido

### `GET /users/me`

Resumo: retorna o usuário autenticado com suas tarefas.

Autenticação: obrigatória

Body: não possui

Resposta `200`:

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "John Doe",
  "email": "john@example.com",
  "tasks": []
}
```

Erros comuns:

- `401`: token inválido
- `404`: usuário não encontrado ou inativo

### `PATCH /users/me`

Resumo: atualiza o nome do usuário autenticado.

Autenticação: obrigatória

Body:

| Campo  | Tipo     | Obrigatório | Regra              |
| ------ | -------- | ----------- | ------------------ |
| `name` | `string` | sim         | não pode ser vazio |

Exemplo de request:

```json
{
  "name": "Johnny Doe"
}
```

Resposta `200`:

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "Johnny Doe",
  "email": "john@example.com"
}
```

Erros comuns:

- `400`: payload inválido
- `404`: usuário não encontrado

### `PATCH /users/:id/status`

Resumo: reativa um usuário inativo.

Autenticação: obrigatória

Permissão: `ADMIN`

Path params:

| Parâmetro | Tipo   | Obrigatório | Descrição       |
| --------- | ------ | ----------- | --------------- |
| `id`      | `uuid` | sim         | UUID do usuário |

Body: não possui

Resposta `200`:

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a67",
  "message": "Status do usuário atualizado com sucesso"
}
```

Resposta alternativa `200`:

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a67",
  "message": "Usuário já está ativo"
}
```

Erros comuns:

- `400`: UUID inválido
- `403`: acesso administrativo necessário
- `404`: usuário não encontrado

### `DELETE /users/:id`

Resumo: desativa um usuário de forma lógica.

Autenticação: obrigatória

Permissão: `ADMIN`

Path params:

| Parâmetro | Tipo   | Obrigatório | Descrição       |
| --------- | ------ | ----------- | --------------- |
| `id`      | `uuid` | sim         | UUID do usuário |

Body: não possui

Efeito:

- altera o status do usuário para `INACTIVE`

Resposta `200`:

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "message": "Usuário deletado com sucesso"
}
```

Erros comuns:

- `400`: UUID inválido
- `403`: acesso administrativo necessário
- `404`: usuário não encontrado

## Tasks

### `POST /tasks`

Resumo: cria uma nova tarefa.

Autenticação: obrigatória

Body:

| Campo              | Tipo       | Obrigatório | Regra                                         |
| ------------------ | ---------- | ----------- | --------------------------------------------- |
| `title`            | `string`   | sim         | não pode ser vazio                            |
| `description`      | `string`   | não         | opcional                                      |
| `tags`             | `string[]` | não         | default `[]`                                  |
| `userEmail`        | `string`   | não         | somente `ADMIN` pode criar para outro usuário |
| `responsibleEmail` | `string`   | não         | email do responsável                          |

Exemplo de request:

```json
{
  "title": "Preparar documentação da API",
  "description": "Consolidar os endpoints do módulo de tarefas.",
  "tags": ["backend", "documentacao"],
  "userEmail": "john@example.com",
  "responsibleEmail": "mary@example.com"
}
```

Regras:

- sem `userEmail`, a tarefa pertence ao usuário autenticado
- somente `ADMIN` pode criar para outro usuário
- `responsibleEmail` é opcional
- o dono e o responsável precisam existir e estar ativos

Resposta `201`:

```json
{
  "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
  "title": "Preparar documentação da API",
  "description": "Consolidar os endpoints do módulo de tarefas.",
  "tags": ["backend", "documentacao"],
  "status": "PENDING",
  "createdBy": "John Doe",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "responsibleId": null
}
```

Erros comuns:

- `400`: payload inválido
- `403`: `Apenas administradores podem criar tarefas para outros usuários`
- `404`: usuário dono ou responsável não encontrado

### `GET /tasks`

Resumo: lista tarefas visíveis para o usuário autenticado.

Autenticação: obrigatória

Visibilidade:

- `ADMIN`: todas as tarefas ativas
- `USER`: tarefas próprias e tarefas nas quais é responsável

Query params:

| Parâmetro       | Tipo     | Obrigatório | Regra                                                              |
| --------------- | -------- | ----------- | ------------------------------------------------------------------ |
| `title`         | `string` | não         | busca parcial por título                                           |
| `status`        | `enum`   | não         | `PENDING`, `IN_PROGRESS`, `PAUSED`, `BLOCKED`, `DONE`, `CANCELLED` |
| `tag`           | `string` | não         | filtra tarefas que contenham a tag                                 |
| `responsibleId` | `uuid`   | não         | filtra pelo responsável                                            |

Exemplo:

```http
GET /api/v1/tasks?status=PENDING&tag=backend
```

Resposta `200`:

```json
[
  {
    "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
    "title": "Preparar documentação da API",
    "description": "Consolidar os endpoints do módulo de tarefas.",
    "tags": ["backend", "documentacao"],
    "status": "PENDING",
    "createdBy": "John Doe",
    "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
    "responsibleId": null
  }
]
```

Erros comuns:

- `400`: filtros inválidos

### `GET /tasks/:id`

Resumo: busca uma tarefa ativa por UUID.

Autenticação: obrigatória

Path params:

| Parâmetro | Tipo   | Obrigatório | Descrição      |
| --------- | ------ | ----------- | -------------- |
| `id`      | `uuid` | sim         | UUID da tarefa |

Visibilidade:

- `ADMIN`: qualquer tarefa ativa
- `USER`: somente tarefa própria ou tarefa em que é responsável

Resposta `200`:

```json
{
  "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
  "title": "Preparar documentação da API",
  "description": "Consolidar os endpoints do módulo de tarefas.",
  "tags": ["backend", "documentacao"],
  "status": "PENDING",
  "createdBy": "John Doe",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "responsibleId": null
}
```

Erros comuns:

- `400`: UUID inválido
- `404`: tarefa não encontrada ou fora do escopo de visibilidade

### `PATCH /tasks/:id`

Resumo: atualiza dados da tarefa.

Autenticação: obrigatória

Permissão:

- `ADMIN`
- dono da tarefa

Body:

| Campo           | Tipo           | Obrigatório | Regra                          |
| --------------- | -------------- | ----------- | ------------------------------ |
| `title`         | `string`       | não         | se enviado, não pode ser vazio |
| `description`   | `string`       | não         | string vazia vira `null`       |
| `tags`          | `string[]`     | não         | substitui a lista atual        |
| `responsibleId` | `uuid \| null` | não         | `null` remove o responsável    |

Exemplo de request:

```json
{
  "title": "Atualizar documentação da API",
  "description": "",
  "tags": ["api", "backend"],
  "responsibleId": "7f0506ab-70d3-4aab-bec9-6bd22fba8a69"
}
```

Regras:

- pelo menos um campo deve ser enviado
- essa rota não altera o status da tarefa
- `responsibleId` deve apontar para usuário ativo existente, salvo quando for `null`

Resposta `200`:

```json
{
  "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
  "title": "Atualizar documentação da API",
  "description": null,
  "tags": ["api", "backend"],
  "status": "PENDING",
  "createdBy": "John Doe",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "responsibleId": "7f0506ab-70d3-4aab-bec9-6bd22fba8a69"
}
```

Erros comuns:

- `400`: UUID inválido, payload inválido ou nenhum campo enviado
- `403`: `Você não tem permissão para atualizar esta tarefa`
- `404`: tarefa não encontrada ou responsável não encontrado

### `PATCH /tasks/:id/status`

Resumo: atualiza o status da tarefa.

Autenticação: obrigatória

Permissão:

- `ADMIN`
- dono da tarefa
- responsável pela tarefa

Body:

| Campo    | Tipo   | Obrigatório | Regra                                 |
| -------- | ------ | ----------- | ------------------------------------- |
| `status` | `enum` | sim         | deve respeitar a tabela de transições |

Exemplo de request:

```json
{
  "status": "IN_PROGRESS"
}
```

Resposta `200`:

```json
{
  "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
  "title": "Preparar documentação da API",
  "description": "Consolidar os endpoints do módulo de tarefas.",
  "tags": ["backend", "documentacao"],
  "status": "IN_PROGRESS",
  "createdBy": "John Doe",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "responsibleId": null
}
```

Erros comuns:

- `400`: UUID inválido ou transição inválida
- `403`: `Você não tem permissão para atualizar o status desta tarefa`
- `404`: tarefa não encontrada

### `DELETE /tasks/:id`

Resumo: remove uma tarefa.

Autenticação: obrigatória

Comportamento por perfil:

- `ADMIN`: exclusão física
- usuário comum: exclusão lógica

Path params:

| Parâmetro | Tipo   | Obrigatório | Descrição      |
| --------- | ------ | ----------- | -------------- |
| `id`      | `uuid` | sim         | UUID da tarefa |

Regras:

- tarefas com status `DONE` não podem ser deletadas
- usuário comum só pode deletar tarefas próprias
- responsável não pode deletar tarefa de outro usuário

Resposta `200`:

```json
{
  "id": "8f0506ab-70d3-4aab-bec9-6bd22fba8a70",
  "message": "Tarefa deletada com sucesso"
}
```

Erros comuns:

- `400`: UUID inválido ou tentativa de remover tarefa concluída
- `403`: `Você não tem permissão para deletar esta tarefa`
- `404`: tarefa não encontrada

## Matriz rápida de permissões

| Rota                      | Público | Usuário autenticado   | Admin |
| ------------------------- | ------- | --------------------- | ----- |
| `POST /users`             | sim     | sim                   | sim   |
| `POST /auth/login`        | sim     | sim                   | sim   |
| `POST /auth/logout`       | não     | sim                   | sim   |
| `GET /users`              | não     | não                   | sim   |
| `GET /users/search`       | não     | sim                   | sim   |
| `GET /users/me`           | não     | sim                   | sim   |
| `PATCH /users/me`         | não     | sim                   | sim   |
| `PATCH /users/:id/status` | não     | não                   | sim   |
| `DELETE /users/:id`       | não     | não                   | sim   |
| `POST /tasks`             | não     | sim                   | sim   |
| `GET /tasks`              | não     | sim                   | sim   |
| `GET /tasks/:id`          | não     | visibilidade limitada | sim   |
| `PATCH /tasks/:id`        | não     | somente dono          | sim   |
| `PATCH /tasks/:id/status` | não     | dono ou responsável   | sim   |
| `DELETE /tasks/:id`       | não     | somente dono          | sim   |

## Exemplos cURL

### Criar usuário

```bash
curl -X POST http://localhost:3333/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Senha@123"
  }'
```

### Fazer login

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Senha@123"
  }'
```

### Criar tarefa autenticada

```bash
curl -X POST http://localhost:3333/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Preparar documentação da API",
    "description": "Consolidar os endpoints do módulo de tarefas.",
    "tags": ["backend", "documentacao"]
  }'
```

### Atualizar dados da tarefa

```bash
curl -X PATCH http://localhost:3333/api/v1/tasks/8f0506ab-70d3-4aab-bec9-6bd22fba8a70 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Atualizar documentação da API",
    "description": "",
    "tags": ["api", "backend"],
    "responsibleId": null
  }'
```

### Atualizar status da tarefa

```bash
curl -X PATCH http://localhost:3333/api/v1/tasks/8f0506ab-70d3-4aab-bec9-6bd22fba8a70/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

## Observações Finais

- a versão interativa oficial continua disponível no Swagger
- este arquivo foi escrito com base nos controllers, DTOs, schemas e regras implementadas no código
- quando um contrato mudar no código, o `DOC.md` deve ser atualizado junto
