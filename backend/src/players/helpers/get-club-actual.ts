interface TrayectoriaItemLike {
  anioInicio: number;
  anioFin?: number | null;
  clubId: unknown;
}

/**
 * "Club actual" is not stored — it's derived from trayectoria: the entry with
 * no anioFin (still there); if several are open, the most recent by anioInicio.
 * When every entry has anioFin the player has no current club (free agent or
 * retired), so it returns null. Retired players are handled by the caller.
 */
export function getClubActual<T extends TrayectoriaItemLike>(
  trayectoria: T[] | undefined,
): T | null {
  const sinFin = (trayectoria ?? []).filter(
    (item) => item.anioFin === undefined || item.anioFin === null,
  );
  if (sinFin.length === 0) {
    return null;
  }
  return sinFin.reduce((latest, item) => (item.anioInicio > latest.anioInicio ? item : latest));
}
