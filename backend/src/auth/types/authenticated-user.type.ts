import type { Role } from '../enums/role.enum.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  nombre: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  email: string;
  nombre: string;
  role: Role;
}
