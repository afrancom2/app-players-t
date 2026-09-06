import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { League, LeagueSchema } from './schemas/league.schema.js';
import { Team, TeamSchema } from './schemas/team.schema.js';
import { Title, TitleSchema } from './schemas/title.schema.js';
import { CatalogsController } from './catalogs.controller.js';
import { CatalogsService } from './catalogs.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: League.name, schema: LeagueSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Title.name, schema: TitleSchema },
    ]),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService, MongooseModule],
})
export class CatalogsModule {}
