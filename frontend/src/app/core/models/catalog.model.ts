export interface League {
  id: string;
  nombre: string;
  pais: string;
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
