/**
 * Sistema de autenticação simples para portfólio/demonstração
 * Não usa email - apenas usuário e senha
 */

export interface User {
  username: string;
  name: string;
}

// Usuários demo (em produção real, isso estaria no backend)
const DEMO_USERS = [
  { username: 'demo', password: 'demo123', name: 'Usuário Demo' },
  { username: 'admin', password: 'admin123', name: 'Administrador' },
  { username: 'gestor', password: 'gestor123', name: 'Gestor' },
];

const STORAGE_KEY = 'tech-help-auth';

/**
 * Faz login no sistema
 */
export const login = (username: string, password: string): User | null => {
  const user = DEMO_USERS.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    const authUser: User = {
      username: user.username,
      name: user.name,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    return authUser;
  }

  return null;
};

/**
 * Faz logout do sistema
 */
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Verifica se há um usuário logado
 */
export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Lista de usuários disponíveis (apenas para demonstração/ajuda)
 */
export const getDemoUsers = () => {
  return DEMO_USERS.map(u => ({
    username: u.username,
    password: u.password,
    name: u.name,
  }));
};
