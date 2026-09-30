import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FIFA_NATIONALITIES } from '../../../core/data/fifa-nationalities';
import { LEAGUE_LOGOS } from '../../../core/data/league-logos';
import { TEAM_LOGOS } from '../../../core/data/team-logos';
import { findTitleGroup, TITLE_GROUP_LOGOS, type TitleGroup } from '../../../core/data/title-groups';
import { titleInitials, titleLogoPath } from '../../../core/data/title-logos';
import type { League, Team, Title } from '../../../core/models/catalog.model';
import type { Estado, Player, PlayerInput, Posicion } from '../../../core/models/player.model';
import { POSICIONES } from '../../../core/models/player.model';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { PlayersService } from '../../../core/services/players.service';
import { ClubPicker } from '../../../shared/ui/club-picker/club-picker';
import { LeaguePicker } from '../../../shared/ui/league-picker/league-picker';
import { NationalityPicker } from '../../../shared/ui/nationality-picker/nationality-picker';
import { TitlePicker } from '../../../shared/ui/title-picker/title-picker';
import { ToastService } from '../../../shared/ui/toast/toast.service';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-player-form',
  imports: [ReactiveFormsModule, RouterLink, NationalityPicker, LeaguePicker, ClubPicker, TitlePicker],
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
  protected readonly showSeleccionPicker = signal(false);
  protected readonly seleccionCode = signal('');
  protected readonly leaguePickerRow = signal<number | null>(null);
  protected readonly clubPickerRow = signal<number | null>(null);
  protected readonly palmaresOrigenRow = signal<number | null>(null);
  protected readonly palmaresTitleRow = signal<number | null>(null);
  protected readonly palmaresClubLeagueRow = signal<number | null>(null);
  protected readonly palmaresClubRow = signal<number | null>(null);

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
    this.seleccionCode.set(
      FIFA_NATIONALITIES.find((n) => n.name === player.seleccion?.nombre)?.code ?? '',
    );

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

  openSeleccionPicker(): void {
    this.showSeleccionPicker.set(true);
  }

  onSeleccionSelected(name: string): void {
    this.form.controls.seleccionNombre.setValue(name);
    this.seleccionCode.set(FIFA_NATIONALITIES.find((n) => n.name === name)?.code ?? '');
    this.showSeleccionPicker.set(false);
  }

  clearSeleccion(): void {
    this.form.patchValue({ seleccionNombre: '', seleccionInicio: null, seleccionFin: null });
    this.seleccionCode.set('');
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

  leagueForRow(index: number): League | undefined {
    const ligaId = this.trayectoria.at(index).get('ligaId')!.value as string;
    return ligaId ? this.catalogs.leagues().find((liga) => liga.id === ligaId) : undefined;
  }

  leagueLogoForRow(index: number): string | null {
    const liga = this.leagueForRow(index);
    if (!liga) return null;
    const file = LEAGUE_LOGOS[`${liga.pais}|${liga.nombre}`];
    return file ? `leagues/${file}` : null;
  }

  openLeaguePicker(index: number): void {
    this.leaguePickerRow.set(index);
  }

  onLeagueSelected(liga: League): void {
    const index = this.leaguePickerRow();
    if (index === null) return;
    this.trayectoria.at(index).get('ligaId')!.setValue(liga.id);
    this.trayectoria.at(index).get('clubId')!.setValue('');
    this.leaguePickerRow.set(null);
  }

  teamForRow(index: number): Team | undefined {
    const clubId = this.trayectoria.at(index).get('clubId')!.value as string;
    return clubId ? this.catalogs.teams().find((team) => team.id === clubId) : undefined;
  }

  teamLogoForRow(index: number): string | null {
    const liga = this.leagueForRow(index);
    const team = this.teamForRow(index);
    if (!liga || !team) return null;
    const file = TEAM_LOGOS[`${liga.pais}|${liga.nombre}|${team.nombre}`];
    return file ? `teams/${file}` : null;
  }

  openClubPicker(index: number): void {
    if (!this.leagueForRow(index)) return;
    this.clubPickerRow.set(index);
  }

  onClubSelected(team: Team): void {
    const index = this.clubPickerRow();
    if (index === null) return;
    this.trayectoria.at(index).get('clubId')!.setValue(team.id);
    this.clubPickerRow.set(null);
  }

  /**
   * Cada fila del palmarés tiene un origen (una liga o un grupo internacional /
   * de selecciones) que filtra los títulos. El club se filtra por la liga de
   * origen en títulos nacionales; en internacionales se elige primero la liga
   * del club (`clubLigaId`); en títulos de selección no hay club.
   */
  addPalmares(initial?: { tituloId: string; cantidad: number; clubId: string }): void {
    const title = initial ? this.catalogs.titles().find((t) => t.id === initial.tituloId) : undefined;
    const clubLigaId =
      title?.grupo && initial?.clubId ? (this.catalogs.leagueOfTeam(initial.clubId)?.id ?? '') : '';
    this.palmares.push(
      this.fb.nonNullable.group({
        origenLigaId: [title?.ligaId ?? ''],
        origenGrupo: [title?.grupo ?? ''],
        tituloId: [initial?.tituloId ?? '', Validators.required],
        cantidad: [initial?.cantidad ?? 1, [Validators.required, Validators.min(1)]],
        clubLigaId: [clubLigaId],
        clubId: [initial?.clubId ?? ''],
      }),
    );
  }

  private palmaresValue(index: number, control: string): string {
    return this.palmares.at(index).get(control)!.value as string;
  }

  palmaresLeague(index: number): League | undefined {
    const ligaId = this.palmaresValue(index, 'origenLigaId');
    return ligaId ? this.catalogs.leagues().find((liga) => liga.id === ligaId) : undefined;
  }

  palmaresGroup(index: number): TitleGroup | undefined {
    return findTitleGroup(this.palmaresValue(index, 'origenGrupo'));
  }

  palmaresTitle(index: number): Title | undefined {
    const tituloId = this.palmaresValue(index, 'tituloId');
    return tituloId ? this.catalogs.titles().find((title) => title.id === tituloId) : undefined;
  }

  /** Liga desde la que se elige el club: la de origen en títulos nacionales, o la elegida aparte en internacionales. */
  palmaresClubLeague(index: number): League | undefined {
    const origen = this.palmaresLeague(index);
    if (origen) return origen;
    const ligaId = this.palmaresValue(index, 'clubLigaId');
    return ligaId ? this.catalogs.leagues().find((liga) => liga.id === ligaId) : undefined;
  }

  palmaresClub(index: number): Team | undefined {
    const clubId = this.palmaresValue(index, 'clubId');
    return clubId ? this.catalogs.teams().find((team) => team.id === clubId) : undefined;
  }

  palmaresTieneClub(index: number): boolean {
    const grupo = this.palmaresGroup(index);
    return !!this.palmaresLeague(index) || (!!grupo && !grupo.esSelecciones);
  }

  palmaresEsInternacional(index: number): boolean {
    const grupo = this.palmaresGroup(index);
    return !!grupo && !grupo.esSelecciones;
  }

  leagueLogo(liga: League): string | null {
    const file = LEAGUE_LOGOS[`${liga.pais}|${liga.nombre}`];
    return file ? `leagues/${file}` : null;
  }

  teamLogo(liga: League, team: Team): string | null {
    const file = TEAM_LOGOS[`${liga.pais}|${liga.nombre}|${team.nombre}`];
    return file ? `teams/${file}` : null;
  }

  groupLogo(grupo: TitleGroup): string | null {
    const file = TITLE_GROUP_LOGOS[grupo.codigo];
    return file ? `groups/${file}` : null;
  }

  titleLogoFor(title: Title): string | null {
    return titleLogoPath(title.nombre);
  }

  titleInitialsFor(title: Title): string {
    return titleInitials(title.nombre);
  }

  openPalmaresOrigenPicker(index: number): void {
    this.palmaresOrigenRow.set(index);
  }

  onPalmaresLeagueSelected(liga: League): void {
    this.setPalmaresOrigen({ origenLigaId: liga.id, origenGrupo: '' });
  }

  onPalmaresGroupSelected(grupo: TitleGroup): void {
    this.setPalmaresOrigen({ origenLigaId: '', origenGrupo: grupo.codigo });
  }

  private setPalmaresOrigen(origen: { origenLigaId: string; origenGrupo: string }): void {
    const index = this.palmaresOrigenRow();
    if (index === null) return;
    this.palmares.at(index).patchValue({ ...origen, tituloId: '', clubLigaId: '', clubId: '' });
    this.palmaresOrigenRow.set(null);
  }

  openPalmaresTitlePicker(index: number): void {
    if (!this.palmaresLeague(index) && !this.palmaresGroup(index)) return;
    this.palmaresTitleRow.set(index);
  }

  onPalmaresTitleSelected(title: Title): void {
    const index = this.palmaresTitleRow();
    if (index === null) return;
    this.palmares.at(index).get('tituloId')!.setValue(title.id);
    this.palmaresTitleRow.set(null);
  }

  openPalmaresClubLeaguePicker(index: number): void {
    this.palmaresClubLeagueRow.set(index);
  }

  onPalmaresClubLeagueSelected(liga: League): void {
    const index = this.palmaresClubLeagueRow();
    if (index === null) return;
    this.palmares.at(index).patchValue({ clubLigaId: liga.id, clubId: '' });
    this.palmaresClubLeagueRow.set(null);
  }

  openPalmaresClubPicker(index: number): void {
    if (!this.palmaresClubLeague(index)) return;
    this.palmaresClubRow.set(index);
  }

  onPalmaresClubSelected(team: Team): void {
    const index = this.palmaresClubRow();
    if (index === null) return;
    this.palmares.at(index).get('clubId')!.setValue(team.id);
    this.palmaresClubRow.set(null);
  }

  clearPalmaresClub(index: number): void {
    this.palmares.at(index).patchValue({ clubId: '' });
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
      // null (no undefined) para que un campo vaciado se borre al editar.
      fotoUrl: value.fotoUrl.trim() || null,
      biografia: value.biografia.trim() || null,
      estado: value.estado,
      anioRetiro: value.estado === 'retirado' ? (value.anioRetiro ?? null) : null,
      seleccion: value.seleccionNombre
        ? {
            nombre: value.seleccionNombre,
            anioInicio: value.seleccionInicio!,
            anioFin: value.seleccionFin ?? null,
          }
        : null,
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
