export interface League {
  id: string;
  nombre: string;
  pais: string;
  orden: number | null;
}

export interface Team {
  id: string;
  nombre: string;
  ligaId: string;
}

/** Un título pertenece a una liga (nacional de clubes) o a un grupo (internacional o selecciones). */
export interface Title {
  id: string;
  nombre: string;
  ligaId: string | null;
  grupo: string | null;
}
