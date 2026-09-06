import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config';
import type { League, Team, Title } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogsService {
  private readonly leaguesSignal = signal<League[]>([]);
  private readonly teamsSignal = signal<Team[]>([]);
  private readonly titlesSignal = signal<Title[]>([]);
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  readonly leagues = this.leaguesSignal.asReadonly();
  readonly teams = this.teamsSignal.asReadonly();
  readonly titles = this.titlesSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  ensureLoaded(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = Promise.all([
      firstValueFrom(this.http.get<League[]>(`${API_BASE_URL}/catalogs/leagues`)),
      firstValueFrom(this.http.get<Team[]>(`${API_BASE_URL}/catalogs/teams`)),
      firstValueFrom(this.http.get<Title[]>(`${API_BASE_URL}/catalogs/titles`)),
    ]).then(([leagues, teams, titles]) => {
      // El backend devuelve ids numéricos (Postgres); los normalizamos a
      // string aquí para que el resto del frontend los trate como opacos
      // (selects, comparaciones, rutas) sin preocuparse por el tipo real.
      this.leaguesSignal.set(leagues.map((liga) => ({ ...liga, id: String(liga.id) })));
      this.teamsSignal.set(
        teams.map((team) => ({ ...team, id: String(team.id), ligaId: String(team.ligaId) })),
      );
      this.titlesSignal.set(titles.map((title) => ({ ...title, id: String(title.id) })));
      this.loaded = true;
    });

    return this.loadPromise;
  }

  teamsByLeague(ligaId: string): Team[] {
    return this.teamsSignal().filter((team) => team.ligaId === ligaId);
  }

  teamName(clubId: string): string {
    return this.teamsSignal().find((team) => team.id === clubId)?.nombre ?? '—';
  }

  leagueOfTeam(clubId: string): League | undefined {
    const team = this.teamsSignal().find((t) => t.id === clubId);
    if (!team) return undefined;
    return this.leaguesSignal().find((liga) => liga.id === team.ligaId);
  }
}
