import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CatalogsService } from './catalogs.service.js';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('leagues')
  leagues() {
    return this.catalogsService.findAllLeagues();
  }

  @Get('leagues/:id/teams')
  teamsByLeague(@Param('id', ParseIntPipe) id: number) {
    return this.catalogsService.findTeamsByLeague(id);
  }

  @Get('teams')
  teams() {
    return this.catalogsService.findAllTeams();
  }

  @Get('titles')
  titles() {
    return this.catalogsService.findAllTitles();
  }
}
