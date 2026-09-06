import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import type { League, Team } from '../../../core/models/catalog.model';
import type { Estado, Player, Posicion } from '../../../core/models/player.model';
import { POSICIONES } from '../../../core/models/player.model';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { PlayersService } from '../../../core/services/players.service';
import { PlayerPhoto } from '../../../shared/ui/player-photo/player-photo';
import { SkeletonCard } from '../../../shared/ui/skeleton-card/skeleton-card';
import { StatusChip } from '../../../shared/ui/status-chip/status-chip';

@Component({
  selector: 'app-player-list',
  imports: [FormsModule, RouterLink, PlayerPhoto, StatusChip, SkeletonCard],
  templateUrl: './player-list.html',
  styleUrl: './player-list.scss',
})
export class PlayerList implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly catalogs = inject(CatalogsService);
  private readonly playersService = inject(PlayersService);
  private readonly router = inject(Router);

  protected readonly posiciones = POSICIONES;
  protected readonly players = signal<Player[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly page = signal(1);
  protected readonly limit = 12;

  protected search = '';
  protected posicion: Posicion | '' = '';
  protected estado: Estado | '' = '';
  protected ligaId = '';
  protected equipoId = '';

  protected get teamsForSelectedLeague(): Team[] {
    return this.ligaId ? this.catalogs.teamsByLeague(this.ligaId) : [];
  }

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.limit));
  }

  async ngOnInit(): Promise<void> {
    await this.catalogs.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const response = await this.playersService.findAll({
        search: this.search || undefined,
        posicion: this.posicion || undefined,
        estado: this.estado || undefined,
        liga: this.ligaId || undefined,
        equipo: this.equipoId || undefined,
        page: this.page(),
        limit: this.limit,
      });
      this.players.set(response.items);
      this.total.set(response.total);
    } finally {
      this.loading.set(false);
    }
  }

  onLeagueChange(): void {
    this.equipoId = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.page.set(1);
    void this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.posicion = '';
    this.estado = '';
    this.ligaId = '';
    this.equipoId = '';
    this.applyFilters();
  }

  goToPage(delta: number): void {
    const next = this.page() + delta;
    if (next < 1 || next > this.totalPages) return;
    this.page.set(next);
    void this.load();
  }

  openPlayer(player: Player): void {
    void this.router.navigate(['/jugadores', player._id]);
  }

  leagueName(liga: League): string {
    return `${liga.nombre} — ${liga.pais}`;
  }
}
