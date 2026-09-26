import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark';

const STORAGE_KEY = 'jugadores.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemPrefersDark = signal(this.media.matches);
  private readonly stored = signal<ThemePreference | null>(this.readStored());

  readonly effective = computed<ThemePreference>(
    () => this.stored() ?? (this.systemPrefersDark() ? 'dark' : 'light'),
  );

  constructor() {
    this.media.addEventListener('change', (event) => this.systemPrefersDark.set(event.matches));

    effect(() => {
      const explicit = this.stored();
      if (explicit) {
        document.documentElement.setAttribute('data-theme', explicit);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  toggle(): void {
    const next: ThemePreference = this.effective() === 'dark' ? 'light' : 'dark';
    this.stored.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage no disponible (modo privado, etc.): el tema no persiste entre recargas.
    }
  }

  private readStored(): ThemePreference | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
