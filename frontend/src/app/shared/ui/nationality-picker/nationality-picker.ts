import { Component, computed, output, signal } from '@angular/core';
import { FIFA_NATIONALITIES } from '../../../core/data/fifa-nationalities';

@Component({
  selector: 'app-nationality-picker',
  imports: [],
  templateUrl: './nationality-picker.html',
  styleUrl: './nationality-picker.scss',
})
export class NationalityPicker {
  readonly closed = output<void>();
  readonly selected = output<string>();

  protected readonly search = signal('');

  protected readonly results = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return FIFA_NATIONALITIES;
    return FIFA_NATIONALITIES.filter((n) => n.name.toLowerCase().includes(term));
  });

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected choose(name: string): void {
    this.selected.emit(name);
  }

  protected close(): void {
    this.closed.emit();
  }
}
