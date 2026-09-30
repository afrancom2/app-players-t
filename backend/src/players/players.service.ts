import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { CatalogsService } from '../catalogs/catalogs.service.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { QueryPlayerDto } from './dto/query-player.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { Estado } from './enums/estado.enum.js';
import { Palmares } from './entities/palmares.entity.js';
import { Player } from './entities/player.entity.js';
import { Trayectoria } from './entities/trayectoria.entity.js';
import { getClubActual } from './helpers/get-club-actual.js';

const RELATIONS = {
  trayectoria: { club: true },
  palmares: { titulo: true, club: true },
} as const;

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
    @InjectRepository(Trayectoria) private readonly trayectoriaRepo: Repository<Trayectoria>,
    @InjectRepository(Palmares) private readonly palmaresRepo: Repository<Palmares>,
    private readonly catalogsService: CatalogsService,
  ) {}

  async findAll(query: QueryPlayerDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<Player> = {};
    if (query.posicion) where.posicion = query.posicion;
    if (query.estado) where.estado = query.estado;
    if (query.nacionalidad) where.nacionalidad = query.nacionalidad;
    if (query.search) where.nombreCompleto = ILike(`%${query.search}%`);

    let teamIds: number[] | null = null;
    if (query.equipo) {
      teamIds = [query.equipo];
    } else if (query.liga) {
      teamIds = await this.catalogsService.teamIdsForLeague(query.liga);
    }

    if (teamIds !== null) {
      if (teamIds.length === 0) {
        return { items: [], total: 0, page, limit };
      }
      const rows = await this.trayectoriaRepo
        .createQueryBuilder('t')
        .select('DISTINCT t.player_id', 'playerId')
        .where('t.club_id IN (:...ids)', { ids: teamIds })
        .getRawMany<{ playerId: number }>();
      const playerIds = rows.map((row) => row.playerId);
      if (playerIds.length === 0) {
        return { items: [], total: 0, page, limit };
      }
      where.id = In(playerIds);
    }

    const [items, total] = await this.playerRepo.findAndCount({
      where,
      relations: RELATIONS,
      order: { nombreCompleto: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items: items.map((player) => this.toResponse(player)), total, page, limit };
  }

  async findOne(id: number) {
    const player = await this.playerRepo.findOne({ where: { id }, relations: RELATIONS });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return this.toResponse(player);
  }

  async create(dto: CreatePlayerDto) {
    const player = this.playerRepo.create({
      nombreCompleto: dto.nombreCompleto,
      nacionalidad: dto.nacionalidad,
      fechaNacimiento: dto.fechaNacimiento,
      posicion: dto.posicion,
      fotoUrl: dto.fotoUrl,
      biografia: dto.biografia,
      estado: dto.estado,
      anioRetiro: dto.estado === Estado.RETIRADO ? dto.anioRetiro : undefined,
      seleccionNombre: dto.seleccion?.nombre,
      seleccionAnioInicio: dto.seleccion?.anioInicio,
      seleccionAnioFin: dto.seleccion?.anioFin,
      trayectoria: dto.trayectoria.map((item) => this.trayectoriaRepo.create(item)),
      palmares: dto.palmares.map((item) => this.palmaresRepo.create(item)),
    });

    const saved = await this.playerRepo.save(player);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdatePlayerDto) {
    const player = await this.playerRepo.findOne({ where: { id }, relations: RELATIONS });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    if (dto.nombreCompleto !== undefined) player.nombreCompleto = dto.nombreCompleto;
    if (dto.nacionalidad !== undefined) player.nacionalidad = dto.nacionalidad;
    if (dto.fechaNacimiento !== undefined) player.fechaNacimiento = dto.fechaNacimiento;
    if (dto.posicion !== undefined) player.posicion = dto.posicion;
    if (dto.fotoUrl !== undefined) player.fotoUrl = dto.fotoUrl;
    if (dto.biografia !== undefined) player.biografia = dto.biografia;
    if (dto.estado !== undefined) player.estado = dto.estado;
    if (dto.anioRetiro !== undefined) player.anioRetiro = dto.anioRetiro;
    if (player.estado !== Estado.RETIRADO) player.anioRetiro = undefined;

    if (dto.seleccion !== undefined) {
      player.seleccionNombre = dto.seleccion?.nombre;
      player.seleccionAnioInicio = dto.seleccion?.anioInicio;
      player.seleccionAnioFin = dto.seleccion?.anioFin;
    }

    if (dto.trayectoria !== undefined) {
      player.trayectoria = dto.trayectoria.map((item) => this.trayectoriaRepo.create(item));
    }
    if (dto.palmares !== undefined) {
      player.palmares = dto.palmares.map((item) => this.palmaresRepo.create(item));
    }

    await this.playerRepo.save(player);
    return this.findOne(id);
  }

  async remove(id: number) {
    const player = await this.playerRepo.findOne({ where: { id } });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    await this.playerRepo.remove(player);
    return { id };
  }

  private toResponse(player: Player) {
    // Postgres no garantiza el orden de las filas de una relación; se ordena
    // cronológicamente (y el periodo abierto, sin anioFin, al final si empatan).
    const ordenada = [...player.trayectoria].sort(
      (a, b) =>
        a.anioInicio - b.anioInicio || (a.anioFin ?? Infinity) - (b.anioFin ?? Infinity),
    );
    const trayectoria = ordenada.map((item) => ({
      clubId: { id: item.club.id, nombre: item.club.nombre, ligaId: item.club.ligaId },
      anioInicio: item.anioInicio,
      anioFin: item.anioFin,
    }));

    const palmares = player.palmares.map((item) => ({
      tituloId: {
        id: item.titulo.id,
        nombre: item.titulo.nombre,
        ligaId: item.titulo.ligaId,
        grupo: item.titulo.grupo,
      },
      cantidad: item.cantidad,
      clubId: item.club ? { id: item.club.id, nombre: item.club.nombre, ligaId: item.club.ligaId } : undefined,
    }));

    // Un jugador retirado no tiene club actual aunque algún periodo quedara sin anioFin.
    const clubActualItem = player.estado === Estado.RETIRADO ? null : getClubActual(trayectoria);

    return {
      id: player.id,
      nombreCompleto: player.nombreCompleto,
      nacionalidad: player.nacionalidad,
      fechaNacimiento: player.fechaNacimiento,
      posicion: player.posicion,
      fotoUrl: player.fotoUrl,
      biografia: player.biografia,
      trayectoria,
      seleccion: player.seleccionNombre
        ? {
            nombre: player.seleccionNombre,
            anioInicio: player.seleccionAnioInicio!,
            anioFin: player.seleccionAnioFin,
          }
        : undefined,
      palmares,
      estado: player.estado,
      anioRetiro: player.anioRetiro,
      clubActual: clubActualItem ? clubActualItem.clubId : null,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
  }
}
