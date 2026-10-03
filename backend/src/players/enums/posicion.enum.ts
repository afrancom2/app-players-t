// El valor de cada miembro es la abreviación que se guarda en la base de
// datos y se muestra como badge en la UI. El nombre completo para mostrar en
// formularios/fichas vive en POSICION_LABELS (frontend) — no se duplica aquí
// porque el backend nunca necesita el nombre largo, solo validar el código.
export enum Posicion {
  PORTERO = 'POR',
  DEFENSA_CENTRAL = 'DFC',
  LATERAL_DERECHO = 'LD',
  LATERAL_IZQUIERDO = 'LI',
  MEDIO_CENTRO_DEFENSIVO = 'MCD',
  MEDIO_CENTRO_OFENSIVO = 'MCO',
  MEDIO_DERECHO = 'MD',
  MEDIO_IZQUIERDO = 'MI',
  EXTREMO_DERECHO = 'ED',
  EXTREMO_IZQUIERDO = 'EI',
  DELANTERO_CENTRO = 'DC',
}
