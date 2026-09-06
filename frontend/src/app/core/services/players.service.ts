import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config';
import type { Player, PlayerInput, PlayerListResponse, PlayerQuery } from '../models/player.model';

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
    return firstValueFrom(
      this.http.get<PlayerListResponse>(`${API_BASE_URL}/players`, { params }),
    );
  }

  findOne(id: string): Promise<Player> {
    return firstValueFrom(this.http.get<Player>(`${API_BASE_URL}/players/${id}`));
  }

  create(dto: PlayerInput): Promise<Player> {
    return firstValueFrom(this.http.post<Player>(`${API_BASE_URL}/players`, dto));
  }

  update(id: string, dto: PlayerInput): Promise<Player> {
    return firstValueFrom(this.http.patch<Player>(`${API_BASE_URL}/players/${id}`, dto));
  }

  remove(id: string): Promise<{ id: string }> {
    return firstValueFrom(this.http.delete<{ id: string }>(`${API_BASE_URL}/players/${id}`));
  }
}
