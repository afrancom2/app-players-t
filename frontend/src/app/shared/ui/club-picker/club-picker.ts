import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TEAM_LOGOS } from '../../../core/data/team-logos';
import type { League, Team } from '../../../core/models/catalog.model';
import { CatalogsService } from '../../../core/services/catalogs.service';

@Component({
  selector: 'app-club-picker',
  imports: [],
  templateUrl: './club-picker.html',
  styleUrl: './club-picker.scss',
})
export class ClubPicker {
  private readonly catalogs = inject(CatalogsService);

  readonly liga = input.required<League>();
  readonly closed = output<void>();
  readonly selected = output<Team>();

  protected readonly search = signal('');

  protected readonly results = computed(() => {
    const term = this.search().trim().toLowerCase();
    const teams = this.catalogs.teamsByLeague(this.liga().id);
    if (!term) return teams;
    return teams.filter((team) => team.nombre.toLowerCase().includes(term));
  });

  protected logoFor(team: Team): string | null {
    const liga = this.liga();
    const file = TEAM_LOGOS[`${liga.pais}|${liga.nombre}|${team.nombre}`];
    return file ? `teams/${file}` : null;
  }

  protected initialsFor(team: Team): string {
    return team.nombre.slice(0, 2).toUpperCase();
  }

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected choose(team: Team): void {
    this.selected.emit(team);
  }

  protected close(): void {
    this.closed.emit();
  }
}
