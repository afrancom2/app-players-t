import { Component, computed, input } from '@angular/core';
import type { Posicion } from '../../../core/models/player.model';
import { POSICION_GRADIENTS, initialsOf } from '../posicion-gradient';

@Component({
  selector: 'app-player-photo',
  imports: [],
  template: `
    @if (fotoUrl()) {
      <img [src]="fotoUrl()" [alt]="nombre()" class="fill-img" />
    } @else {
      <div class="fill-gradient" [style.background]="gradient()">
        <span class="initials">{{ initials() }}</span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }
      .fill-img,
      .fill-gradient {
        width: 100%;
        height: 100%;
      }
      .fill-img {
        object-fit: cover;
        display: block;
      }
      .fill-gradient {
        display: flex;
        align-items: flex-start;
        padding: 6% 0 0 6%;
      }
      .initials {
        font-family: 'Fraunces', Georgia, serif;
        font-weight: 900;
        font-size: 3.4em;
        color: rgba(255, 255, 255, 0.5);
      }
    `,
  ],
})
export class PlayerPhoto {
  readonly nombre = input.required<string>();
  readonly posicion = input.required<Posicion>();
  readonly fotoUrl = input<string | undefined>(undefined);

  protected readonly gradient = computed(() => POSICION_GRADIENTS[this.posicion()]);
  protected readonly initials = computed(() => initialsOf(this.nombre()));
}
