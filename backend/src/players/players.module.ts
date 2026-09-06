import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from '../catalogs/catalogs.module.js';
import { Palmares } from './entities/palmares.entity.js';
import { Player } from './entities/player.entity.js';
import { Trayectoria } from './entities/trayectoria.entity.js';
import { PlayersController } from './players.controller.js';
import { PlayersService } from './players.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Trayectoria, Palmares]), CatalogsModule],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {}
