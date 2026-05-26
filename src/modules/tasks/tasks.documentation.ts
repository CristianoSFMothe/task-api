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
      'Retorna a lista de tarefas disponíveis para o usuário autenticado, com filtros opcionais por título, status, tag e responsável.',
    successDescription: 'Lista de tarefas retornada com sucesso',
  },
  updateStatus: {
    summary: 'Atualizar status da tarefa',
    description:
      'Atualiza o status de uma tarefa usando uma transição explícita e validada pelo backend.',
    successDescription: 'Status da tarefa atualizado com sucesso',
    uuidParamDescription: 'UUID da tarefa que terá o status atualizado',
    validationErrorDescription: 'UUID inválido ou transição de status inválida',
    forbiddenDescription:
      'Apenas administradores, dono da tarefa ou responsável podem atualizar o status',
    notFoundDescription: 'Tarefa não encontrada',
  },
} as const;
