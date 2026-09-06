import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogsModule } from '../catalogs/catalogs.module.js';
import { Player, PlayerSchema } from './schemas/player.schema.js';
import { PlayersController } from './players.controller.js';
import { PlayersService } from './players.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    CatalogsModule,
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {}
