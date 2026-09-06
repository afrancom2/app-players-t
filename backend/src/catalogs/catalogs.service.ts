import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from './entities/league.entity.js';
import { Team } from './entities/team.entity.js';
import { Title } from './entities/title.entity.js';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(League) private readonly leagueRepo: Repository<League>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(Title) private readonly titleRepo: Repository<Title>,
  ) {}

  findAllLeagues() {
    return this.leagueRepo.find({ order: { pais: 'ASC', nombre: 'ASC' } });
  }

  findAllTeams() {
    return this.teamRepo.find({ order: { nombre: 'ASC' } });
  }

  findTeamsByLeague(ligaId: number) {
    return this.teamRepo.find({ where: { ligaId }, order: { nombre: 'ASC' } });
  }

  findAllTitles() {
    return this.titleRepo.find({ order: { nombre: 'ASC' } });
  }

  async teamIdsForLeague(ligaId: number): Promise<number[]> {
    const teams = await this.teamRepo.find({ where: { ligaId }, select: { id: true } });
    return teams.map((team) => team.id);
  }
}
