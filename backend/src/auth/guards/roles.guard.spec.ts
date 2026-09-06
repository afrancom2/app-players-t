import { describe, expect, it, vi } from 'vitest';
import { Role } from '../enums/role.enum.js';
import { RolesGuard } from './roles.guard.js';

function makeContext(user: { role: Role } | undefined) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('RolesGuard', () => {
  it('allows the request when no roles are required', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    const guard = new RolesGuard(reflector as any);

    expect(guard.canActivate(makeContext(undefined))).toBe(true);
  });

  it('allows a user whose role is in the required list', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) };
    const guard = new RolesGuard(reflector as any);

    expect(guard.canActivate(makeContext({ role: Role.ADMIN }))).toBe(true);
  });

  it('rejects a user whose role is not in the required list', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) };
    const guard = new RolesGuard(reflector as any);

    expect(guard.canActivate(makeContext({ role: Role.CONSULTA }))).toBe(false);
  });

  it('rejects when there is no authenticated user', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) };
    const guard = new RolesGuard(reflector as any);

    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });
});
