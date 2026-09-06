export interface League {
  _id: string;
  nombre: string;
  pais: string;
}

export interface Team {
  _id: string;
  nombre: string;
  ligaId: string;
}

export interface Title {
  _id: string;
  nombre: string;
}
