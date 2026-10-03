import { Component, computed, inject, input, output, signal } from '@angular/core';
import type { TitleGroup } from '../../../core/data/title-groups';
import { titleInitials, titleLogoPath } from '../../../core/data/title-logos';
import type { League, Title } from '../../../core/models/catalog.model';
import { CatalogsService } from '../../../core/services/catalogs.service';

/** Lista los títulos de una liga o de un grupo (internacional / selecciones), con logo y búsqueda. */
@Component({
  selector: 'app-title-picker',
  imports: [],
  templateUrl: './title-picker.html',
  styleUrl: './title-picker.scss',
})
export class TitlePicker {
  private readonly catalogs = inject(CatalogsService);

  readonly liga = input<League | null>(null);
  readonly grupo = input<TitleGroup | null>(null);
  readonly closed = output<void>();
  readonly selected = output<Title>();

  protected readonly search = signal('');

  protected readonly context = computed(() => {
    const liga = this.liga();
    if (liga) return `${liga.nombre} · ${liga.pais}`;
    const grupo = this.grupo();
    return grupo ? `${grupo.nombre} · ${grupo.descripcion}` : '';
  });

  protected readonly results = computed(() => {
    const liga = this.liga();
    const grupo = this.grupo();
    const titles = liga
      ? this.catalogs.titlesByLeague(liga.id)
      : grupo
        ? this.catalogs.titlesByGroup(grupo.codigo)
        : [];
    const term = this.search().trim().toLowerCase();
    if (!term) return titles;
    return titles.filter((title) => title.nombre.toLowerCase().includes(term));
  });

  protected logoFor(title: Title): string | null {
    return titleLogoPath(title.nombre);
  }

  protected initialsFor(title: Title): string {
    return titleInitials(title.nombre);
  }

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected choose(title: Title): void {
    this.selected.emit(title);
  }

  protected close(): void {
    this.closed.emit();
  }
}
