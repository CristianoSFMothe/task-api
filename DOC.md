# Documentação Completa da API

## Informações gerais

- Base URL local: `http://localhost:3333/api/v1`
- Swagger: `http://localhost:3333/docs`
- Formato: `application/json`
- Autenticação: JWT Bearer
- Prefixo global: `api/v1`

## Convenções da API

### Autenticação

Envie o token JWT no header:

```http
Authorization: Bearer <token>
```

### Validação

A aplicação usa `ValidationPipe` global com:

- `whitelist: true`
- `forbidNonWhitelisted: true`

Na prática isso significa:

- campos não declarados no DTO são rejeitados
- formatos inválidos retornam erro `400`
- alguns fluxos também passam por validação adicional com Zod no service

### Perfis de acesso

- `USER`: perfil padrão
- `ADMIN`: perfil com acesso administrativo

### Status de usuário

- `ACTIVE`
- `INACTIVE`

### Status de tarefa

- `PENDING`
- `IN_PROGRESS`
- `PAUSED`
- `BLOCKED`
- `DONE`
- `CANCELLED`

### Transições de status da tarefa

| Status atual  | Próximos status permitidos               |
| ------------- | ---------------------------------------- |
| `PENDING`     | `IN_PROGRESS`, `CANCELLED`               |
| `IN_PROGRESS` | `DONE`, `PAUSED`, `BLOCKED`, `CANCELLED` |
| `PAUSED`      | `IN_PROGRESS`, `BLOCKED`, `CANCELLED`    |
| `BLOCKED`     | `IN_PROGRESS`, `PAUSED`, `CANCELLED`     |
| `DONE`        | nenhum                                   |
| `CANCELLED`   | nenhum                                   |

## Modelos de resposta

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

## Endpoints

## Auth

### `POST /auth/login`

Autentica um usuário e retorna um JWT.

Autenticação: pública

Body:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

Regras:

- `email` deve ser válido
- `password` é obrigatória
- o usuário precisa existir e estar ativo
- email ou senha inválidos retornam `401`

Resposta `200`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "6f0506ab-70d3-4aab-bec9-6bd22fba8a66",
  "name": "John Doe",
  "email": "john@example.com"
}
```

Erros comuns:

- `400`: payload inválido
- `401`: `Email ou senha inválidos`

### `POST /auth/logout`

Retorna uma mensagem de logout lógico.

Autenticação: obrigatória

Body: não possui

Resposta `200`:

```json
{
  "message": "Logout realizado com sucesso"
}
```

Observação:

- esta rota não faz blacklist de token; ela apenas retorna uma confirmação

## Users

### `POST /users`

Cria um novo usuário.

Autenticação: pública

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

Regras:

- `name` é obrigatória
- `name` deve ter entre 2 e 100 caracteres
- `email` deve ser válido
- `password` deve ter no mínimo 6 caracteres
- `email` precisa ser único
- novos usuários são criados com:
  - `role = USER`
  - `status = ACTIVE`

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

Lista todos os usuários ativos com suas tarefas.

Autenticação: obrigatória

Permissão: `ADMIN`

Query params: nenhum

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

- `401`: token ausente ou inválido
- `403`: acesso administrativo necessário

### `GET /users/search`

Busca usuários ativos por nome e/ou email.

Autenticação: obrigatória

Permissão: qualquer usuário autenticado

Query params:

| Parâmetro | Tipo     | Obrigatório | Regra         |
| --------- | -------- | ----------- | ------------- |
| `name`    | `string` | não         | busca parcial |
| `email`   | `string` | não         | busca exata   |

Regras:

- é obrigatório enviar pelo menos `name` ou `email`
- `email` deve ser válido quando informado

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

Retorna o usuário autenticado com suas tarefas.

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

Atualiza o nome do usuário autenticado.

Autenticação: obrigatória

Body:

```json
{
  "name": "Johnny Doe"
}
```

Regras:

- apenas o nome pode ser alterado
- `name` é obrigatória

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

Reativa um usuário inativo.

Autenticação: obrigatória

Permissão: `ADMIN`

Path params:

| Parâmetro | Tipo   | Descrição       |
| --------- | ------ | --------------- |
| `id`      | `uuid` | UUID do usuário |

Body: não possui

Regras:

- se o usuário não existir, retorna `404`
- se o usuário já estiver ativo, retorna `200` com mensagem informando isso

Resposta `200`:

```json
{
  "id": "6f0506ab-70d3-4aab-bec9-6bd22fba8a67",
  "message": "Status do usuário atualizado com sucesso"
}
```

Possível resposta alternativa `200`:

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

Desativa um usuário de forma lógica.

Autenticação: obrigatória

Permissão: `ADMIN`

Path params:

| Parâmetro | Tipo   | Descrição       |
| --------- | ------ | --------------- |
| `id`      | `uuid` | UUID do usuário |

Body: não possui

Regras:

- usuários já inativos retornam `404`
- a exclusão é lógica, alterando `status` para `INACTIVE`

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

Cria uma nova tarefa.

Autenticação: obrigatória

Body:

```json
{
  "title": "Preparar documentação da API",
  "description": "Consolidar os endpoints do módulo de tarefas.",
  "tags": ["backend", "documentacao"],
  "userEmail": "john@example.com",
  "responsibleEmail": "mary@example.com"
}
```

Campos:

| Campo              | Tipo       | Obrigatório | Observação                                    |
| ------------------ | ---------- | ----------- | --------------------------------------------- |
| `title`            | `string`   | sim         | não pode ser vazio                            |
| `description`      | `string`   | não         | opcional                                      |
| `tags`             | `string[]` | não         | default `[]`                                  |
| `userEmail`        | `string`   | não         | somente `ADMIN` pode criar para outro usuário |
| `responsibleEmail` | `string`   | não         | email do responsável pela tarefa              |

Regras:

- se `userEmail` não for enviado, a tarefa pertence ao usuário autenticado
- se `userEmail` for igual ao email do usuário autenticado, a tarefa continua sendo dele
- somente `ADMIN` pode criar tarefa para outro usuário
- `responsibleEmail` pode apontar para:
  - o dono da tarefa
  - o usuário autenticado
  - outro usuário ativo existente

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

Lista tarefas visíveis para o usuário autenticado.

Autenticação: obrigatória

Visibilidade:

- `ADMIN`: todas as tarefas ativas
- `USER`: tarefas ativas próprias e tarefas ativas em que é responsável

Query params:

| Parâmetro       | Tipo     | Obrigatório | Regra                                                              |
| --------------- | -------- | ----------- | ------------------------------------------------------------------ |
| `title`         | `string` | não         | busca parcial por título                                           |
| `status`        | `enum`   | não         | `PENDING`, `IN_PROGRESS`, `PAUSED`, `BLOCKED`, `DONE`, `CANCELLED` |
| `tag`           | `string` | não         | filtra tarefas que contenham a tag                                 |
| `responsibleId` | `uuid`   | não         | filtra por responsável                                             |

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

Busca uma tarefa ativa por UUID.

Autenticação: obrigatória

Path params:

| Parâmetro | Tipo   | Descrição      |
| --------- | ------ | -------------- |
| `id`      | `uuid` | UUID da tarefa |

Visibilidade:

- `ADMIN`: qualquer tarefa ativa
- `USER`: apenas tarefa própria ou tarefa em que é responsável

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
- `404`: tarefa não encontrada ou não visível

### `PATCH /tasks/:id`

Atualiza dados da tarefa.

Autenticação: obrigatória

Permissão:

- `ADMIN`
- dono da tarefa

Body:

```json
{
  "title": "Atualizar documentação da API",
  "description": "",
  "tags": ["api", "backend"],
  "responsibleId": "7f0506ab-70d3-4aab-bec9-6bd22fba8a69"
}
```

Campos:

| Campo           | Tipo           | Obrigatório | Regra                                 |
| --------------- | -------------- | ----------- | ------------------------------------- |
| `title`         | `string`       | não         | se enviado, não pode ser vazio        |
| `description`   | `string`       | não         | string vazia é convertida para `null` |
| `tags`          | `string[]`     | não         | substitui a lista atual               |
| `responsibleId` | `uuid \| null` | não         | `null` remove o responsável           |

Regras:

- é obrigatório enviar pelo menos um campo
- somente `ADMIN` ou dono da tarefa podem editar
- `responsibleId` deve apontar para um usuário ativo existente quando não for `null`
- a rota altera apenas dados da tarefa; não altera status

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

- `400`: UUID inválido ou nenhum campo enviado
- `403`: `Você não tem permissão para atualizar esta tarefa`
- `404`: tarefa não encontrada ou responsável não encontrado

### `PATCH /tasks/:id/status`

Atualiza o status da tarefa.

Autenticação: obrigatória

Permissão:

- `ADMIN`
- dono da tarefa
- responsável pela tarefa

Body:

```json
{
  "status": "IN_PROGRESS"
}
```

Regras:

- o status precisa respeitar a tabela de transições
- ao mudar para `IN_PROGRESS`, `startedAt` é preenchido se ainda não existir
- ao mudar para `DONE`:
  - `completedAt` é preenchido
  - `completionTime` é calculado em segundos, se `startedAt` existir
- tarefas inativas não podem ser atualizadas

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

Remove uma tarefa.

Autenticação: obrigatória

Comportamento por perfil:

- `ADMIN`: exclusão física
- usuário comum: exclusão lógica (`isActive = false`)

Path params:

| Parâmetro | Tipo   | Descrição      |
| --------- | ------ | -------------- |
| `id`      | `uuid` | UUID da tarefa |

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

- `400`: UUID inválido ou tarefa concluída
- `403`: `Você não tem permissão para deletar esta tarefa`
- `404`: tarefa não encontrada

## Resumo de permissões

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

## Exemplos de uso com cURL

### Criar usuário

```bash
curl -X POST http://localhost:3333/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "123456"
  }'
```

### Fazer login

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "123456"
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

### Atualizar status da tarefa

```bash
curl -X PATCH http://localhost:3333/api/v1/tasks/8f0506ab-70d3-4aab-bec9-6bd22fba8a70/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

## Observações finais

- o Swagger já expõe a documentação interativa da API
- esta documentação textual foi escrita com base nos controllers, DTOs, schemas e regras implementadas no código
- se um endpoint mudar no código, o `DOC.md` deve ser atualizado junto
