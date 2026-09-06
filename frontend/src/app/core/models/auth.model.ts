export type Role = 'admin' | 'consulta';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
