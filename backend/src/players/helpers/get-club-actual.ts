interface TrayectoriaItemLike {
  anioInicio: number;
  anioFin?: number;
  clubId: unknown;
}

/**
 * "Club actual" is not stored — it's derived from trayectoria: the entry with
 * no anioFin (still there), or if every entry has one, the most recent by anioInicio.
 */
export function getClubActual<T extends TrayectoriaItemLike>(
  trayectoria: T[] | undefined,
): T | null {
  if (!trayectoria || trayectoria.length === 0) {
    return null;
  }

  const sinFin = trayectoria.filter((item) => item.anioFin === undefined || item.anioFin === null);
  if (sinFin.length > 0) {
    return sinFin.reduce((latest, item) => (item.anioInicio > latest.anioInicio ? item : latest));
  }

  return trayectoria.reduce((latest, item) => (item.anioInicio > latest.anioInicio ? item : latest));
}
