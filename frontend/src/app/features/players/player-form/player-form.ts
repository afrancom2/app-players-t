import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FIFA_NATIONALITIES } from '../../../core/data/fifa-nationalities';
import type { Estado, Player, PlayerInput, Posicion } from '../../../core/models/player.model';
import { POSICIONES } from '../../../core/models/player.model';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { PlayersService } from '../../../core/services/players.service';
import { NationalityPicker } from '../../../shared/ui/nationality-picker/nationality-picker';
import { ToastService } from '../../../shared/ui/toast/toast.service';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-player-form',
  imports: [ReactiveFormsModule, RouterLink, NationalityPicker],
  templateUrl: './player-form.html',
  styleUrl: './player-form.scss',
})
export class PlayerForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);
  protected readonly catalogs = inject(CatalogsService);
  private readonly toast = inject(ToastService);

  protected readonly posiciones = POSICIONES;
  protected readonly step = signal<Step>(1);
  protected readonly saving = signal(false);
  protected readonly loading = signal(true);
  protected readonly showNationalityPicker = signal(false);
  protected readonly nacionalidadCode = signal('');

  private playerId: string | null = null;

  protected readonly form = this.fb.nonNullable.group({
    nombreCompleto: ['', Validators.required],
    nacionalidad: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    posicion: ['Portero' as Posicion, Validators.required],
    fotoUrl: [''],
    biografia: [''],
    estado: ['activo' as Estado, Validators.required],
    anioRetiro: [null as number | null],
    seleccionNombre: [''],
    seleccionInicio: [null as number | null],
    seleccionFin: [null as number | null],
    trayectoria: this.fb.array<FormGroup>([]),
    palmares: this.fb.array<FormGroup>([]),
  });

  get isEditMode(): boolean {
    return this.playerId !== null;
  }

  get trayectoria(): FormArray<FormGroup> {
    return this.form.controls.trayectoria;
  }

  get palmares(): FormArray<FormGroup> {
    return this.form.controls.palmares;
  }

  async ngOnInit(): Promise<void> {
    await this.catalogs.ensureLoaded();
    this.playerId = this.route.snapshot.paramMap.get('id');

    if (this.playerId) {
      const player = await this.playersService.findOne(this.playerId);
      this.patchFromPlayer(player);
    } else {
      this.addTrayectoria();
    }
    this.loading.set(false);
  }

  private patchFromPlayer(player: Player): void {
    this.form.patchValue({
      nombreCompleto: player.nombreCompleto,
      nacionalidad: player.nacionalidad,
      fechaNacimiento: player.fechaNacimiento.slice(0, 10),
      posicion: player.posicion,
      fotoUrl: player.fotoUrl ?? '',
      biografia: player.biografia ?? '',
      estado: player.estado,
      anioRetiro: player.anioRetiro ?? null,
    });
    this.nacionalidadCode.set(
      FIFA_NATIONALITIES.find((n) => n.name === player.nacionalidad)?.code ?? '',
    );
    this.form.patchValue({
      seleccionNombre: player.seleccion?.nombre ?? '',
      seleccionInicio: player.seleccion?.anioInicio ?? null,
      seleccionFin: player.seleccion?.anioFin ?? null,
    });

    for (const item of player.trayectoria) {
      this.addTrayectoria({
        ligaId: item.clubId.ligaId,
        clubId: item.clubId.id,
        anioInicio: item.anioInicio,
        anioFin: item.anioFin ?? null,
      });
    }
    for (const item of player.palmares) {
      this.addPalmares({
        tituloId: item.tituloId.id,
        cantidad: item.cantidad,
        clubId: item.clubId?.id ?? '',
      });
    }
  }

  openNationalityPicker(): void {
    this.showNationalityPicker.set(true);
  }

  onNationalitySelected(name: string): void {
    this.form.controls.nacionalidad.setValue(name);
    this.nacionalidadCode.set(FIFA_NATIONALITIES.find((n) => n.name === name)?.code ?? '');
    this.showNationalityPicker.set(false);
  }

  addTrayectoria(initial?: { ligaId: string; clubId: string; anioInicio: number; anioFin: number | null }): void {
    this.trayectoria.push(
      this.fb.nonNullable.group({
        ligaId: [initial?.ligaId ?? ''],
        clubId: [initial?.clubId ?? '', Validators.required],
        anioInicio: [initial?.anioInicio ?? null, Validators.required],
        anioFin: [initial?.anioFin ?? null],
      }),
    );
  }

  removeTrayectoria(index: number): void {
    this.trayectoria.removeAt(index);
  }

  teamsForRow(index: number) {
    const ligaId = this.trayectoria.at(index).get('ligaId')!.value as string;
    return ligaId ? this.catalogs.teamsByLeague(ligaId) : [];
  }

  onRowLeagueChange(index: number): void {
    this.trayectoria.at(index).get('clubId')!.setValue('');
  }

  addPalmares(initial?: { tituloId: string; cantidad: number; clubId: string }): void {
    this.palmares.push(
      this.fb.nonNullable.group({
        tituloId: [initial?.tituloId ?? '', Validators.required],
        cantidad: [initial?.cantidad ?? 1, [Validators.required, Validators.min(1)]],
        clubId: [initial?.clubId ?? ''],
      }),
    );
  }

  removePalmares(index: number): void {
    this.palmares.removeAt(index);
  }

  goToStep(step: Step): void {
    this.step.set(step);
  }

  nextStep(): void {
    if (this.step() < 3) this.step.set((this.step() + 1) as Step);
  }

  prevStep(): void {
    if (this.step() > 1) this.step.set((this.step() - 1) as Step);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.trayectoria.length === 0) {
      this.form.markAllAsTouched();
      this.toast.error('Revisa los campos obligatorios antes de guardar.');
      return;
    }

    const value = this.form.getRawValue();

    const payload: PlayerInput = {
      nombreCompleto: value.nombreCompleto,
      nacionalidad: value.nacionalidad,
      fechaNacimiento: value.fechaNacimiento,
      posicion: value.posicion,
      fotoUrl: value.fotoUrl || undefined,
      biografia: value.biografia || undefined,
      estado: value.estado,
      anioRetiro: value.estado === 'retirado' ? (value.anioRetiro ?? undefined) : undefined,
      seleccion: value.seleccionNombre
        ? {
            nombre: value.seleccionNombre,
            anioInicio: value.seleccionInicio!,
            anioFin: value.seleccionFin ?? undefined,
          }
        : undefined,
      trayectoria: value.trayectoria.map((item) => ({
        clubId: item['clubId'],
        anioInicio: item['anioInicio']!,
        anioFin: item['anioFin'] ?? undefined,
      })),
      palmares: value.palmares.map((item) => ({
        tituloId: item['tituloId'],
        cantidad: item['cantidad'],
        clubId: item['clubId'] || undefined,
      })),
    };

    this.saving.set(true);
    try {
      const saved = this.isEditMode
        ? await this.playersService.update(this.playerId!, payload)
        : await this.playersService.create(payload);
      this.toast.success(this.isEditMode ? 'Cambios guardados.' : 'Jugador creado.');
      await this.router.navigate(['/jugadores', saved.id]);
    } catch {
      this.toast.error('No se pudo guardar el jugador.');
    } finally {
      this.saving.set(false);
    }
  }
}
