import { Component, input } from '@angular/core';
import type { Estado } from '../../../core/models/player.model';

@Component({
  selector: 'app-status-chip',
  imports: [],
  template: `
    <span class="chip" [class.chip-activo]="estado() === 'activo'" [class.chip-retirado]="estado() === 'retirado'">
      {{ estado() === 'activo' ? 'Activo' : 'Retirado' }}
    </span>
  `,
})
export class StatusChip {
  readonly estado = input.required<Estado>();
}
