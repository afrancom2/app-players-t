import type { Posicion } from '../../core/models/player.model';

export const POSICION_GRADIENTS: Record<Posicion, string> = {
  Portero: 'linear-gradient(160deg, #3c7c58, #1b231e)',
  Defensa: 'linear-gradient(160deg, #c79a45, #7a5b1c)',
  Mediocampista: 'linear-gradient(160deg, #5c92ad, #24404d)',
  Delantero: 'linear-gradient(160deg, #b8543a, #5c281b)',
};

export function initialsOf(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
