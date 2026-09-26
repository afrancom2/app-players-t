import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  template: `
    <button
      type="button"
      class="iconbtn"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.effective() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      [attr.title]="theme.effective() === 'dark' ? 'Modo claro' : 'Modo oscuro'"
    >
      @if (theme.effective() === 'dark') {
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="M4.93 4.93l1.41 1.41"></path>
          <path d="M17.66 17.66l1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="M6.34 17.66l-1.41 1.41"></path>
          <path d="M19.07 4.93l-1.41 1.41"></path>
        </svg>
      } @else {
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path>
        </svg>
      }
    </button>
  `,
  styles: [
    `
      .iconbtn {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: 1px solid var(--line);
        background: var(--surface);
        color: var(--ink-soft);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .iconbtn:hover {
        color: var(--ink);
        border-color: var(--ink-soft);
      }
    `,
  ],
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
