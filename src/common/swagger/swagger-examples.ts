export const swaggerExamples = {
  auth: {
    email: 'john@example.com',
    password: 'Senha@123',
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    logoutMessage: 'Logout realizado com sucesso',
  },
  user: {
    id: '6f0506ab-70d3-4aab-bec9-6bd22fba8a66',
    inactiveId: '6f0506ab-70d3-4aab-bec9-6bd22fba8a67',
    name: 'John Doe',
    updatedName: 'Johnny Doe',
    email: 'john@example.com',
    role: 'USER' as const,
    deletedMessage: 'Usuário deletado com sucesso',
    statusUpdatedMessage: 'Status do usuário atualizado com sucesso',
  },
  task: {
    id: '8f0506ab-70d3-4aab-bec9-6bd22fba8a70',
    title: 'Preparar documentação da API',
    description: 'Consolidar os endpoints do módulo de tarefas.',
    tags: ['backend', 'documentacao'],
    status: 'IN_PROGRESS' as const,
    deletedMessage: 'Tarefa deletada com sucesso',
  },
  errors: {
    badRequestMessages: [
      'Informe um email válido',
      'A senha deve ter no mínimo 6 caracteres',
    ],
    unauthorizedMessage: 'Email ou senha inválidos',
    forbiddenMessage: 'Forbidden resource',
    notFoundMessage: 'Usuário não encontrado',
    conflictMessage: 'Email já cadastrado',
    internalServerErrorMessage: 'Erro interno do servidor',
  },
};
