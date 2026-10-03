import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import type { Player } from '../../../core/models/player.model';
import { PlayersService } from '../../../core/services/players.service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { PlayerPhoto } from '../../../shared/ui/player-photo/player-photo';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-player-detail',
  imports: [RouterLink, PlayerPhoto],
  templateUrl: './player-detail.html',
  styleUrl: './player-detail.scss',
})
export class PlayerDetail implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  protected readonly player = signal<Player | null>(null);
  protected readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    try {
      this.player.set(await this.playersService.findOne(id));
    } catch {
      // El interceptor HTTP ya mostró el toast con el motivo real del error;
      // aquí solo evitamos que la vista se quede "cargando" para siempre.
    } finally {
      this.loading.set(false);
    }
  }

  async remove(): Promise<void> {
    const player = this.player();
    if (!player) return;

    const confirmed = await this.confirmDialog.confirm({
      title: `¿Eliminar a ${player.nombreCompleto}?`,
      message: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
    });
    if (!confirmed) return;

    try {
      await this.playersService.remove(player.id);
      this.toast.success('Jugador eliminado.');
      await this.router.navigateByUrl('/jugadores');
    } catch {
      // El interceptor HTTP ya mostró el toast con el motivo real del error.
    }
  }

  totalTitulos(player: Player): number {
    return player.palmares.reduce((sum, item) => sum + item.cantidad, 0);
  }
}
