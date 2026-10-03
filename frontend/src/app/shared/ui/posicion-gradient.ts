import type { Posicion } from '../../core/models/player.model';

// Agrupado por línea (portero / defensa / mediocampo / ataque) en vez de un
// color por cada una de las 11 posiciones, reusando los 4 gradientes que ya
// existían.
const PORTERO_GRADIENT = 'linear-gradient(160deg, #3c7c58, #1b231e)';
const DEFENSA_GRADIENT = 'linear-gradient(160deg, #c79a45, #7a5b1c)';
const MEDIOCAMPO_GRADIENT = 'linear-gradient(160deg, #5c92ad, #24404d)';
const ATAQUE_GRADIENT = 'linear-gradient(160deg, #b8543a, #5c281b)';

export const POSICION_GRADIENTS: Record<Posicion, string> = {
  POR: PORTERO_GRADIENT,
  DFC: DEFENSA_GRADIENT,
  LD: DEFENSA_GRADIENT,
  LI: DEFENSA_GRADIENT,
  MCD: MEDIOCAMPO_GRADIENT,
  MCO: MEDIOCAMPO_GRADIENT,
  MD: MEDIOCAMPO_GRADIENT,
  MI: MEDIOCAMPO_GRADIENT,
  ED: ATAQUE_GRADIENT,
  EI: ATAQUE_GRADIENT,
  DC: ATAQUE_GRADIENT,
};

export function initialsOf(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
