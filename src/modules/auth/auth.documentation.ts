export const authDocumentation = {
  login: {
    summary: 'Autenticar um usuário',
    description:
      'Recebe email e senha válidos e retorna um token JWT com os dados básicos do usuário autenticado.',
    successDescription: 'Usuário autenticado com sucesso',
    unauthorizedDescription: 'Email ou senha inválidos',
  },
  logout: {
    summary: 'Encerrar a sessão do usuário autenticado',
    description:
      'Encerra a sessão lógica do usuário autenticado e retorna uma mensagem de confirmação.',
    successDescription: 'Logout realizado com sucesso',
  },
} as const;
