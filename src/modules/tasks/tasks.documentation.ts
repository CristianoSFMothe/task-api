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
  findById: {
    summary: 'Buscar tarefa por ID',
    description:
      'Retorna uma tarefa ativa pelo UUID informado. Administradores podem acessar qualquer tarefa ativa; usuários comuns apenas tarefas visíveis para eles.',
    successDescription: 'Tarefa encontrada com sucesso',
    uuidParamDescription: 'UUID da tarefa que será consultada',
    validationErrorDescription: 'UUID inválido',
    notFoundDescription: 'Tarefa não encontrada',
  },
  update: {
    summary: 'Atualizar tarefa',
    description:
      'Atualiza título, descrição, tags e/ou responsável de uma tarefa ativa. Apenas administradores ou o dono da tarefa podem realizar essa alteração.',
    successDescription: 'Tarefa atualizada com sucesso',
    uuidParamDescription: 'UUID da tarefa que será atualizada',
    validationErrorDescription:
      'UUID inválido ou payload de atualização inválido',
    forbiddenDescription:
      'Apenas administradores ou o dono da tarefa podem atualizar a tarefa',
    notFoundDescription: 'Tarefa não encontrada',
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
  delete: {
    summary: 'Deletar tarefa',
    description:
      'Administradores removem a tarefa fisicamente. Usuários comuns realizam delete lógico apenas nas próprias tarefas ativas.',
    successDescription: 'Tarefa deletada com sucesso',
    uuidParamDescription: 'UUID da tarefa que será deletada',
    validationErrorDescription: 'UUID inválido',
    forbiddenDescription:
      'Apenas administradores ou o dono da tarefa podem deletá-la',
    notFoundDescription: 'Tarefa não encontrada',
  },
} as const;
