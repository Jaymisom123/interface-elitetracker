// Constantes de rotas para facilitar manutenção e evitar erros de digitação
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  HABITS: '/habits',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PROJECTS: '/projects',
  // Adicione novas rotas aqui conforme necessário
} as const

// Tipo para autocompletar as rotas
export type RouteKeys = keyof typeof ROUTES
export type RoutePaths = (typeof ROUTES)[RouteKeys]
