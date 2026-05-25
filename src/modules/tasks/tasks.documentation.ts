export const tasksDocumentation = {
  create: {
    summary: 'Criar uma nova tarefa',
    description:
      'Cria uma tarefa para o usuário autenticado. Administradores também podem criar tarefas para outros usuários e definir um responsável por email.',
    successDescription: 'Tarefa criada com sucesso',
    forbiddenDescription:
      'Apenas administradores podem criar tarefas para outros usuários',
  },
  findAll: {
    summary: 'Listar tarefas',
    description:
      'Retorna a lista de tarefas disponíveis para o usuário autenticado.',
    successDescription: 'Lista de tarefas retornada com sucesso',
  },
} as const;
