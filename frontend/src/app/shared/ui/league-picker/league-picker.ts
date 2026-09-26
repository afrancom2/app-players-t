import { Component, computed, inject, output, signal } from '@angular/core';
import { LEAGUE_LOGOS } from '../../../core/data/league-logos';
import type { League } from '../../../core/models/catalog.model';
import { CatalogsService } from '../../../core/services/catalogs.service';

@Component({
  selector: 'app-league-picker',
  imports: [],
  templateUrl: './league-picker.html',
  styleUrl: './league-picker.scss',
})
export class LeaguePicker {
  private readonly catalogs = inject(CatalogsService);

  readonly closed = output<void>();
  readonly selected = output<League>();

  protected readonly search = signal('');

  protected readonly results = computed(() => {
    const term = this.search().trim().toLowerCase();
    const leagues = this.catalogs.leagues();
    if (!term) return leagues;
    return leagues.filter(
      (liga) => liga.nombre.toLowerCase().includes(term) || liga.pais.toLowerCase().includes(term),
    );
  });

  protected logoFor(liga: League): string | null {
    const file = LEAGUE_LOGOS[`${liga.pais}|${liga.nombre}`];
    return file ? `leagues/${file}` : null;
  }

  protected initialsFor(liga: League): string {
    return liga.nombre.slice(0, 3).toUpperCase();
  }

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected choose(liga: League): void {
    this.selected.emit(liga);
  }

  protected close(): void {
    this.closed.emit();
  }
}
