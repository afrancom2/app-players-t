import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type QueryFilter } from 'mongoose';
import { CatalogsService } from '../catalogs/catalogs.service.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { QueryPlayerDto } from './dto/query-player.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { getClubActual } from './helpers/get-club-actual.js';
import { Player, type PlayerDocument } from './schemas/player.schema.js';

const POPULATE = [
  { path: 'trayectoria.clubId', select: 'nombre ligaId' },
  { path: 'palmares.tituloId', select: 'nombre' },
  { path: 'palmares.clubId', select: 'nombre ligaId' },
];

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
    private readonly catalogsService: CatalogsService,
  ) {}

  async findAll(query: QueryPlayerDto) {
    const filter: QueryFilter<Player> = {};

    if (query.posicion) {
      filter.posicion = query.posicion;
    }
    if (query.estado) {
      filter.estado = query.estado;
    }
    if (query.search) {
      filter.nombreCompleto = { $regex: escapeRegex(query.search), $options: 'i' };
    }

    if (query.equipo) {
      filter['trayectoria.clubId'] = query.equipo;
    } else if (query.liga) {
      const teamIds = await this.catalogsService.teamIdsForLeague(query.liga);
      filter['trayectoria.clubId'] = { $in: teamIds };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await Promise.all([
      this.playerModel
        .find(filter)
        .collation({ locale: 'es', strength: 1 })
        .sort({ nombreCompleto: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(POPULATE)
        .lean()
        .exec(),
      this.playerModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map(withClubActual),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const player = await this.playerModel.findById(id).populate(POPULATE).lean().exec();
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return withClubActual(player);
  }

  async create(dto: CreatePlayerDto) {
    const created = await this.playerModel.create(dto);
    return this.findOne(created.id);
  }

  async update(id: string, dto: UpdatePlayerDto) {
    const update = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );

    const updated = await this.playerModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return this.findOne(updated.id);
  }

  async remove(id: string) {
    const deleted = await this.playerModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return { id: deleted.id };
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function withClubActual<T extends { trayectoria: any[] }>(player: T) {
  const clubActualItem = getClubActual(player.trayectoria);
  return {
    ...player,
    clubActual: clubActualItem ? clubActualItem.clubId : null,
  };
}
