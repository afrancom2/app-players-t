import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config';
import type {
  ClubRef,
  Player,
  PlayerInput,
  PlayerListResponse,
  PlayerQuery,
  TituloRef,
} from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  constructor(private readonly http: HttpClient) {}

  async findAll(query: PlayerQuery): Promise<PlayerListResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    const response = await firstValueFrom(
      this.http.get<PlayerListResponse>(`${API_BASE_URL}/players`, { params }),
    );
    return { ...response, items: response.items.map((player) => normalizePlayer(player)) };
  }

  async findOne(id: string): Promise<Player> {
    const player = await firstValueFrom(this.http.get<Player>(`${API_BASE_URL}/players/${id}`));
    return normalizePlayer(player);
  }

  async create(dto: PlayerInput): Promise<Player> {
    const player = await firstValueFrom(this.http.post<Player>(`${API_BASE_URL}/players`, dto));
    return normalizePlayer(player);
  }

  async update(id: string, dto: PlayerInput): Promise<Player> {
    const player = await firstValueFrom(
      this.http.patch<Player>(`${API_BASE_URL}/players/${id}`, dto),
    );
    return normalizePlayer(player);
  }

  remove(id: string): Promise<{ id: string }> {
    return firstValueFrom(this.http.delete<{ id: string }>(`${API_BASE_URL}/players/${id}`));
  }
}

/** El backend usa ids numéricos (Postgres); los normalizamos a string en cada nivel anidado. */
function normalizePlayer(player: Player): Player {
  return {
    ...player,
    id: String(player.id),
    clubActual: player.clubActual ? normalizeClub(player.clubActual) : null,
    trayectoria: player.trayectoria.map((item) => ({
      ...item,
      clubId: normalizeClub(item.clubId),
    })),
    palmares: player.palmares.map((item) => ({
      ...item,
      tituloId: normalizeTitulo(item.tituloId),
      clubId: item.clubId ? normalizeClub(item.clubId) : undefined,
    })),
  };
}

function normalizeClub(club: ClubRef): ClubRef {
  return { ...club, id: String(club.id), ligaId: String(club.ligaId) };
}

function normalizeTitulo(titulo: TituloRef): TituloRef {
  return { ...titulo, id: String(titulo.id) };
}
