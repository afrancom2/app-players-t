import { Component, computed, input } from '@angular/core';
import type { Posicion } from '../../../core/models/player.model';
import { POSICION_GRADIENTS, initialsOf } from '../posicion-gradient';

@Component({
  selector: 'app-avatar-placeholder',
  imports: [],
  template: `
    @if (fotoUrl()) {
      <img [src]="fotoUrl()" [alt]="nombre()" class="avatar-img" [style.width.px]="size()" [style.height.px]="size()" />
    } @else {
      <div
        class="avatar-placeholder"
        [style.background]="gradient()"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [style.font-size.px]="size() * 0.36"
      >
        {{ initials() }}
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: inline-block;
        flex-shrink: 0;
      }
      .avatar-img,
      .avatar-placeholder {
        border-radius: 50%;
        object-fit: cover;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .avatar-placeholder {
        color: rgba(255, 255, 255, 0.85);
        font-family: 'Fraunces', Georgia, serif;
        font-weight: 700;
      }
    `,
  ],
})
export class AvatarPlaceholder {
  readonly nombre = input.required<string>();
  readonly posicion = input.required<Posicion>();
  readonly fotoUrl = input<string | undefined>(undefined);
  readonly size = input<number>(44);

  protected readonly gradient = computed(() => POSICION_GRADIENTS[this.posicion()]);
  protected readonly initials = computed(() => initialsOf(this.nombre()));
}
