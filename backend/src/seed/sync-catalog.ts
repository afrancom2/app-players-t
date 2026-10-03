import type { INestApplicationContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { League } from '../catalogs/entities/league.entity.js';
import { Team } from '../catalogs/entities/team.entity.js';
import { Title } from '../catalogs/entities/title.entity.js';
import { Palmares } from '../players/entities/palmares.entity.js';
import { Trayectoria } from '../players/entities/trayectoria.entity.js';
import { LEAGUES_DATA } from './leagues-data.js';
import { LEAGUE_TITLES, TITLE_GROUPS } from './titles-data.js';

export interface CatalogRefs {
  leaguesByKey: Record<string, League>;
  teamsByName: Record<string, Team>;
  titlesByName: Record<string, Title>;
}

/**
 * Crea o actualiza ligas, equipos y títulos a partir de los datos del código,
 * sin tocar nunca usuarios ni jugadores. Es seguro ejecutarlo en cada
 * arranque del backend:
 *   - lo que ya existe se actualiza en el mismo registro (conserva su id, así
 *     que las fichas de jugadores reales que lo referencian nunca se rompen);
 *   - lo que ya no está en el código pero nadie usa se elimina, para no
 *     acumular basura cuando algo se renombra o se quita;
 *   - lo que ya no está en el código pero SÍ está en uso por un jugador real
 *     se deja intacto, para no perder esa información.
 */
export async function syncCatalog(app: INestApplicationContext): Promise<CatalogRefs> {
  const leagueRepo = app.get<Repository<League>>(getRepositoryToken(League));
  const teamRepo = app.get<Repository<Team>>(getRepositoryToken(Team));
  const titleRepo = app.get<Repository<Title>>(getRepositoryToken(Title));
  const trayectoriaRepo = app.get<Repository<Trayectoria>>(getRepositoryToken(Trayectoria));
  const palmaresRepo = app.get<Repository<Palmares>>(getRepositoryToken(Palmares));

  console.log('Sincronizando catálogo (ligas, equipos y títulos)...');

  const leaguesByKey: Record<string, League> = {};
  const teamsByName: Record<string, Team> = {};
  const seenLeagueIds = new Set<number>();
  const seenTeamIds = new Set<number>();

  for (const [index, liga] of LEAGUES_DATA.entries()) {
    const orden = index + 1;
    let league = await leagueRepo.findOne({ where: { pais: liga.pais, nombre: liga.nombre } });
    if (league) {
      league.orden = orden;
      league = await leagueRepo.save(league);
    } else {
      league = await leagueRepo.save(leagueRepo.create({ nombre: liga.nombre, pais: liga.pais, orden }));
    }
    leaguesByKey[`${liga.pais}|${liga.nombre}`] = league;
    seenLeagueIds.add(league.id);

    for (const teamName of liga.equipos) {
      let team = await teamRepo.findOne({ where: { ligaId: league.id, nombre: teamName } });
      if (!team) {
        team = await teamRepo.save(teamRepo.create({ nombre: teamName, ligaId: league.id }));
      }
      teamsByName[teamName] = team;
      seenTeamIds.add(team.id);
    }
  }

  const titlesByName: Record<string, Title> = {};
  const seenTitleIds = new Set<number>();

  const upsertTitle = async (nombre: string, ligaId: number | null, grupo: string | null, orden: number) => {
    let title = await titleRepo.findOne({ where: { nombre } });
    if (title) {
      title.ligaId = ligaId;
      title.grupo = grupo;
      title.orden = orden;
      title = await titleRepo.save(title);
    } else {
      title = await titleRepo.save(titleRepo.create({ nombre, ligaId, grupo, orden }));
    }
    titlesByName[nombre] = title;
    seenTitleIds.add(title.id);
  };

  for (const [key, titulos] of Object.entries(LEAGUE_TITLES)) {
    const league = leaguesByKey[key];
    if (!league) throw new Error(`Títulos para una liga que no existe en el catálogo: ${key}`);
    for (const [orden, nombre] of titulos.entries()) {
      await upsertTitle(nombre, league.id, null, orden);
    }
  }
  for (const grupo of TITLE_GROUPS) {
    for (const [orden, nombre] of grupo.titulos.entries()) {
      await upsertTitle(nombre, null, grupo.codigo, orden);
    }
  }

  // Limpieza segura de lo que ya no está en el código. El orden importa:
  // títulos primero, luego equipos, luego ligas — cada paso solo deja
  // "huérfanos" posibles para que el siguiente los pueda limpiar.
  let removedTitles = 0;
  for (const title of await titleRepo.find()) {
    if (seenTitleIds.has(title.id)) continue;
    const enUso = await palmaresRepo.count({ where: { tituloId: title.id } });
    if (enUso === 0) {
      await titleRepo.remove(title);
      removedTitles++;
    }
  }

  let removedTeams = 0;
  for (const team of await teamRepo.find()) {
    if (seenTeamIds.has(team.id)) continue;
    const enTrayectoria = await trayectoriaRepo.count({ where: { clubId: team.id } });
    const enPalmares = await palmaresRepo.count({ where: { clubId: team.id } });
    if (enTrayectoria === 0 && enPalmares === 0) {
      await teamRepo.remove(team);
      removedTeams++;
    }
  }

  let removedLeagues = 0;
  for (const league of await leagueRepo.find()) {
    if (seenLeagueIds.has(league.id)) continue;
    const equiposRestantes = await teamRepo.count({ where: { ligaId: league.id } });
    const titulosRestantes = await titleRepo.count({ where: { ligaId: league.id } });
    if (equiposRestantes === 0 && titulosRestantes === 0) {
      await leagueRepo.remove(league);
      removedLeagues++;
    }
  }

  const removedNote =
    removedLeagues || removedTeams || removedTitles
      ? ` (se limpiaron ${removedLeagues} liga(s), ${removedTeams} equipo(s) y ${removedTitles} título(s) sin uso que ya no están en el código)`
      : '';
  console.log(
    // Nota: se cuenta por id (seenXIds), no por Object.keys(xByName) — algunos
    // nombres de equipo se repiten en distintas ligas (ej. "Nacional" en
    // Portugal y Uruguay), y contar por nombre los pisaría entre sí.
    `Catálogo sincronizado: ${seenLeagueIds.size} ligas, ${seenTeamIds.size} equipos, ${seenTitleIds.size} títulos.${removedNote}`,
  );

  return { leaguesByKey, teamsByName, titlesByName };
}
