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

export interface Title {
  id: string;
  nombre: string;
}
