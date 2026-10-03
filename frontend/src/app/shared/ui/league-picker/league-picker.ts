import { Component, computed, inject, input, output, signal } from '@angular/core';
import { LEAGUE_LOGOS } from '../../../core/data/league-logos';
import { TITLE_GROUPS, TITLE_GROUP_LOGOS, type TitleGroup } from '../../../core/data/title-groups';
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

  /** Muestra al inicio los grupos de títulos internacionales y de selecciones (usado en el palmarés). */
  readonly withGroups = input(false);
  readonly closed = output<void>();
  readonly selected = output<League>();
  readonly groupSelected = output<TitleGroup>();

  protected readonly search = signal('');

  protected readonly results = computed(() => {
    const term = this.search().trim().toLowerCase();
    const leagues = this.catalogs.leagues();
    if (!term) return leagues;
    return leagues.filter(
      (liga) => liga.nombre.toLowerCase().includes(term) || liga.pais.toLowerCase().includes(term),
    );
  });

  protected readonly groupResults = computed(() => {
    if (!this.withGroups()) return [];
    const term = this.search().trim().toLowerCase();
    if (!term) return TITLE_GROUPS;
    return TITLE_GROUPS.filter(
      (grupo) =>
        grupo.nombre.toLowerCase().includes(term) || grupo.descripcion.toLowerCase().includes(term),
    );
  });

  protected logoFor(liga: League): string | null {
    const file = LEAGUE_LOGOS[`${liga.pais}|${liga.nombre}`];
    return file ? `leagues/${file}` : null;
  }

  protected initialsFor(liga: League): string {
    return liga.nombre.slice(0, 3).toUpperCase();
  }

  protected groupLogoFor(grupo: TitleGroup): string | null {
    const file = TITLE_GROUP_LOGOS[grupo.codigo];
    return file ? `groups/${file}` : null;
  }

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected choose(liga: League): void {
    this.selected.emit(liga);
  }

  protected chooseGroup(grupo: TitleGroup): void {
    this.groupSelected.emit(grupo);
  }

  protected close(): void {
    this.closed.emit();
  }
}
