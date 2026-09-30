/**
 * Grupos de títulos que no dependen de una liga, en el mismo orden en que
 * aparecen al inicio del selector de liga del palmarés. `codigo` coincide con
 * el campo `grupo` de los títulos del backend.
 */
export interface TitleGroup {
  readonly codigo: string;
  readonly nombre: string;
  readonly descripcion: string;
  /** Los títulos de selección no se asocian a un club. */
  readonly esSelecciones: boolean;
}

export const TITLE_GROUPS: readonly TitleGroup[] = [
  { codigo: 'SELECCIONES', nombre: 'Selecciones', descripcion: 'Títulos con la selección nacional', esSelecciones: true },
  { codigo: 'FIFA', nombre: 'FIFA', descripcion: 'Internacional · Mundial', esSelecciones: false },
  { codigo: 'UEFA', nombre: 'UEFA', descripcion: 'Internacional · Europa', esSelecciones: false },
  { codigo: 'CONMEBOL', nombre: 'CONMEBOL', descripcion: 'Internacional · Sudamérica', esSelecciones: false },
  { codigo: 'CONCACAF', nombre: 'Concacaf', descripcion: 'Internacional · Norte y Centroamérica', esSelecciones: false },
  { codigo: 'AFC', nombre: 'AFC', descripcion: 'Internacional · Asia', esSelecciones: false },
  { codigo: 'CAF', nombre: 'CAF', descripcion: 'Internacional · África', esSelecciones: false },
  { codigo: 'UAFA', nombre: 'UAFA', descripcion: 'Internacional · Mundo árabe', esSelecciones: false },
  { codigo: 'OFC', nombre: 'OFC', descripcion: 'Internacional · Oceanía', esSelecciones: false },
];

export function findTitleGroup(codigo: string | null | undefined): TitleGroup | undefined {
  return codigo ? TITLE_GROUPS.find((grupo) => grupo.codigo === codigo) : undefined;
}

/** Logo de cada grupo bajo public/groups/; los que no aparecen muestran iniciales. */
export const TITLE_GROUP_LOGOS: Record<string, string> = {
  FIFA: 'fifa.svg',
  UEFA: 'uefa.svg',
  CONMEBOL: 'conmebol.svg',
  CONCACAF: 'concacaf.svg',
  AFC: 'afc.svg',
  CAF: 'caf.svg',
  UAFA: 'uafa.svg',
  OFC: 'ofc.svg',
};
