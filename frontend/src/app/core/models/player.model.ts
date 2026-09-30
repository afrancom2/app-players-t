export type Posicion = 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero';
export type Estado = 'activo' | 'retirado';

export interface ClubRef {
  id: string;
  nombre: string;
  ligaId: string;
}

export interface TituloRef {
  id: string;
  nombre: string;
  ligaId: string | null;
  grupo: string | null;
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
  id: string;
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
  nacionalidad?: string;
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
  // null = vaciar el campo al editar (un `undefined` se omite del JSON y el
  // backend lo interpreta como "no cambiar").
  fotoUrl: string | null;
  biografia: string | null;
  trayectoria: TrayectoriaItemInput[];
  seleccion: SeleccionInput | null;
  palmares: PalmaresItemInput[];
  estado: Estado;
  anioRetiro: number | null;
}

export interface SeleccionInput {
  nombre: string;
  anioInicio: number;
  anioFin: number | null;
}

export const POSICIONES: Posicion[] = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
