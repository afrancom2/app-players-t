export type Posicion = 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero';
export type Estado = 'activo' | 'retirado';

export interface ClubRef {
  _id: string;
  nombre: string;
  ligaId: string;
}

export interface TituloRef {
  _id: string;
  nombre: string;
}

export interface TrayectoriaItem {
  clubId: ClubRef;
  anioInicio: number;
  anioFin?: number;
}

export interface Seleccion {
  nombre: string;
  anioInicio: number;
  anioFin?: number;
}

export interface PalmaresItem {
  tituloId: TituloRef;
  cantidad: number;
  clubId?: ClubRef;
}

export interface Player {
  _id: string;
  nombreCompleto: string;
  nacionalidad: string;
  fechaNacimiento: string;
  posicion: Posicion;
  fotoUrl?: string;
  biografia?: string;
  trayectoria: TrayectoriaItem[];
  seleccion?: Seleccion;
  palmares: PalmaresItem[];
  estado: Estado;
  anioRetiro?: number;
  clubActual: ClubRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerListResponse {
  items: Player[];
  total: number;
  page: number;
  limit: number;
}

export interface PlayerQuery {
  search?: string;
  posicion?: Posicion;
  estado?: Estado;
  liga?: string;
  equipo?: string;
  page?: number;
  limit?: number;
}

/** Formas usadas para enviar datos al crear/editar (solo ids de catálogo). */
export interface TrayectoriaItemInput {
  clubId: string;
  anioInicio: number;
  anioFin?: number;
}

export interface PalmaresItemInput {
  tituloId: string;
  cantidad: number;
  clubId?: string;
}

export interface PlayerInput {
  nombreCompleto: string;
  nacionalidad: string;
  fechaNacimiento: string;
  posicion: Posicion;
  fotoUrl?: string;
  biografia?: string;
  trayectoria: TrayectoriaItemInput[];
  seleccion?: Seleccion;
  palmares: PalmaresItemInput[];
  estado: Estado;
  anioRetiro?: number;
}

export const POSICIONES: Posicion[] = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
