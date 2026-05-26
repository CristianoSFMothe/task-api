type OperationDocumentation = {
  summary: string;
  description: string;
  successDescription: string;
};

type OperationDocumentationWithUuid = OperationDocumentation & {
  uuidParamDescription: string;
  validationErrorDescription: string;
};

type CreateUserDocumentation = OperationDocumentation & {
  conflictDescription: string;
};

type UsersDocumentation = {
  findAll: OperationDocumentation;
  findByEmail: OperationDocumentation;
  findByName: OperationDocumentation;
  findMe: OperationDocumentation;
  updateMyName: OperationDocumentation;
  updateStatus: OperationDocumentationWithUuid;
  delete: OperationDocumentationWithUuid;
  create: CreateUserDocumentation;
};

export const usersDocumentation = {
  findAll: {
    summary: 'Listar os usuários ativos',
    description:
      'Retorna todos os usuários com status ativo. Esta rota exige autenticação e perfil de administrador.',
    successDescription: 'Lista de usuários ativos',
  },
  findByEmail: {
    summary: 'Buscar um usuário por email',
    description:
      'Busca um usuário ativo a partir do email informado no corpo da requisição.',
    successDescription: 'Usuário encontrado com sucesso',
  },
  findByName: {
    summary: 'Buscar usuários por nome',
    description:
      'Busca usuários ativos a partir do nome informado no corpo da requisição.',
    successDescription: 'Usuários encontrados com sucesso',
  },
  findMe: {
    summary: 'Obter os dados do usuário autenticado',
    description:
      'Retorna os dados básicos do usuário associado ao token enviado na requisição.',
    successDescription: 'Dados do usuário autenticado',
  },
  updateMyName: {
    summary: 'Atualizar o nome do usuário autenticado',
    description:
      'Atualiza apenas o nome do usuário autenticado com base no token enviado.',
    successDescription: 'Nome atualizado com sucesso',
  },
  updateStatus: {
    summary: 'Reativar um usuário inativo',
    description:
      'Reativa um usuário inativo a partir do UUID informado. Esta rota exige autenticação e perfil de administrador.',
    uuidParamDescription: 'UUID do usuário que será reativado',
    successDescription: 'Status do usuário atualizado',
    validationErrorDescription: 'UUID inválido',
  },
  delete: {
    summary: 'Desativar um usuário',
    description:
      'Realiza a exclusão lógica de um usuário a partir do UUID informado. Esta rota exige autenticação e perfil de administrador.',
    uuidParamDescription: 'UUID do usuário que será desativado',
    successDescription: 'Usuário deletado com sucesso',
    validationErrorDescription: 'UUID inválido',
  },
  create: {
    summary: 'Criar um novo usuário',
    description:
      'Cria um novo usuário com nome, email e senha válidos, retornando os dados públicos do registro criado.',
    successDescription: 'Usuário adicionado com sucesso',
    conflictDescription: 'Email já cadastrado',
  },
} as const satisfies UsersDocumentation;

export type { UsersDocumentation };
