import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from './enums/role.enum.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let usersService: { findByEmail: ReturnType<typeof vi.fn> };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  let authService: AuthService;
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await bcrypt.hash('correcta1234', 10);
    usersService = { findByEmail: vi.fn() };
    jwtService = { signAsync: vi.fn().mockResolvedValue('signed.jwt.token') };
    authService = new AuthService(usersService as any, jwtService as any);
  });

  it('returns a token and user info when the password matches', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@jugadores.app',
      nombre: 'Administrador',
      role: Role.ADMIN,
      passwordHash,
    });

    const result = await authService.login('admin@jugadores.app', 'correcta1234');

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'admin@jugadores.app',
      nombre: 'Administrador',
      role: Role.ADMIN,
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-1', role: Role.ADMIN }),
    );
  });

  it('rejects when the password does not match', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@jugadores.app',
      nombre: 'Administrador',
      role: Role.ADMIN,
      passwordHash,
    });

    await expect(authService.login('admin@jugadores.app', 'incorrecta')).rejects.toThrow();
  });

  it('rejects when the user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(authService.login('nadie@jugadores.app', 'cualquiera')).rejects.toThrow();
  });
});
