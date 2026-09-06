import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { League, type LeagueDocument } from './schemas/league.schema.js';
import { Team, type TeamDocument } from './schemas/team.schema.js';
import { Title, type TitleDocument } from './schemas/title.schema.js';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectModel(League.name) readonly leagueModel: Model<LeagueDocument>,
    @InjectModel(Team.name) readonly teamModel: Model<TeamDocument>,
    @InjectModel(Title.name) readonly titleModel: Model<TitleDocument>,
  ) {}

  findAllLeagues() {
    return this.leagueModel.find().sort({ pais: 1, nombre: 1 }).lean().exec();
  }

  findAllTeams() {
    return this.teamModel.find().sort({ nombre: 1 }).lean().exec();
  }

  findTeamsByLeague(ligaId: string) {
    return this.teamModel.find({ ligaId }).sort({ nombre: 1 }).lean().exec();
  }

  findAllTitles() {
    return this.titleModel.find().sort({ nombre: 1 }).lean().exec();
  }

  teamIdsForLeague(ligaId: string) {
    return this.teamModel.find({ ligaId }).distinct('_id').exec();
  }
}
