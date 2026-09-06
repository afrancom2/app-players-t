import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { League } from './entities/league.entity.js';
import { Team } from './entities/team.entity.js';
import { Title } from './entities/title.entity.js';
import { CatalogsController } from './catalogs.controller.js';
import { CatalogsService } from './catalogs.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([League, Team, Title])],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService, TypeOrmModule],
})
export class CatalogsModule {}
