import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, type Repository } from 'typeorm';
import { AppModule } from '../app.module.js';
import { Role } from '../auth/enums/role.enum.js';
import { League } from '../catalogs/entities/league.entity.js';
import { Team } from '../catalogs/entities/team.entity.js';
import { Title } from '../catalogs/entities/title.entity.js';
import { Estado } from '../players/enums/estado.enum.js';
import { Posicion } from '../players/enums/posicion.enum.js';
import { Palmares } from '../players/entities/palmares.entity.js';
import { Player } from '../players/entities/player.entity.js';
import { Trayectoria } from '../players/entities/trayectoria.entity.js';
import { User } from '../users/entities/user.entity.js';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const leagueRepo = app.get<Repository<League>>(getRepositoryToken(League));
  const teamRepo = app.get<Repository<Team>>(getRepositoryToken(Team));
  const titleRepo = app.get<Repository<Title>>(getRepositoryToken(Title));
  const playerRepo = app.get<Repository<Player>>(getRepositoryToken(Player));
  const trayectoriaRepo = app.get<Repository<Trayectoria>>(getRepositoryToken(Trayectoria));
  const palmaresRepo = app.get<Repository<Palmares>>(getRepositoryToken(Palmares));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  console.log('Limpiando tablas...');
  const dataSource = app.get(DataSource);
  await dataSource.query(
    'TRUNCATE TABLE player_palmares, player_trayectoria, players, users, teams, leagues, titles RESTART IDENTITY CASCADE',
  );

  console.log('Creando ligas y equipos...');
  const leaguesData = [
    { nombre: 'Serie A', pais: 'Italia', equipos: ['Juventus', 'Parma', 'Inter', 'Milan'] },
    { nombre: 'Ligue 1', pais: 'Francia', equipos: ['Paris Saint-Germain', 'Marsella', 'Lyon'] },
    { nombre: 'LaLiga', pais: 'España', equipos: ['Real Sociedad', 'Villarreal', 'Athletic Club'] },
    {
      nombre: 'Bundesliga',
      pais: 'Alemania',
      equipos: ['Bayern Múnich', 'Borussia Dortmund', 'RB Leipzig'],
    },
  ];

  const teamsByName: Record<string, Team> = {};
  for (const liga of leaguesData) {
    const league = await leagueRepo.save(leagueRepo.create({ nombre: liga.nombre, pais: liga.pais }));
    for (const teamName of liga.equipos) {
      teamsByName[teamName] = await teamRepo.save(
        teamRepo.create({ nombre: teamName, ligaId: league.id }),
      );
    }
  }

  console.log('Creando catálogo de títulos...');
  const titleNames = [
    'Mundial',
    'Serie A',
    'LaLiga',
    'Bundesliga',
    'Ligue 1',
    'Copa Italia',
    'Copa del Rey',
    'Copa Alemana',
    'Supercopa de Italia',
    'Supercopa de Francia',
    'Copa de la UEFA',
    'Champions League',
    'Eurocopa',
  ];
  const titlesByName: Record<string, Title> = {};
  for (const nombre of titleNames) {
    titlesByName[nombre] = await titleRepo.save(titleRepo.create({ nombre }));
  }

  console.log('Creando usuarios de prueba...');
  const adminHash = await bcrypt.hash('admin1234', 10);
  const consultaHash = await bcrypt.hash('consulta1234', 10);
  await userRepo.save([
    userRepo.create({
      email: 'admin@jugadores.app',
      passwordHash: adminHash,
      nombre: 'Administrador',
      role: Role.ADMIN,
    }),
    userRepo.create({
      email: 'consulta@jugadores.app',
      passwordHash: consultaHash,
      nombre: 'Usuario de Consulta',
      role: Role.CONSULTA,
    }),
  ]);

  console.log('Creando jugadores de ejemplo...');
  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Gianluigi Buffon',
      nacionalidad: 'Italia',
      fechaNacimiento: '1978-01-28',
      posicion: Posicion.PORTERO,
      biografia:
        'Gianluigi Buffon es un exfutbolista italiano nacido en 1978. Debutó muy joven en el Parma, brilló durante muchos años en la Juventus y fue clave para que Italia ganara el Mundial de 2006. Es considerado uno de los mejores porteros de la historia y se retiró en 2023.',
      trayectoria: [
        trayectoriaRepo.create({ clubId: teamsByName['Parma'].id, anioInicio: 1995, anioFin: 2001 }),
        trayectoriaRepo.create({ clubId: teamsByName['Juventus'].id, anioInicio: 2001, anioFin: 2018 }),
        trayectoriaRepo.create({
          clubId: teamsByName['Paris Saint-Germain'].id,
          anioInicio: 2018,
          anioFin: 2019,
        }),
        trayectoriaRepo.create({ clubId: teamsByName['Juventus'].id, anioInicio: 2019, anioFin: 2021 }),
        trayectoriaRepo.create({ clubId: teamsByName['Parma'].id, anioInicio: 2021, anioFin: 2023 }),
      ],
      seleccionNombre: 'Italia',
      seleccionAnioInicio: 1997,
      seleccionAnioFin: 2018,
      palmares: [
        palmaresRepo.create({ tituloId: titlesByName['Mundial'].id, cantidad: 1 }),
        palmaresRepo.create({
          tituloId: titlesByName['Serie A'].id,
          cantidad: 10,
          clubId: teamsByName['Juventus'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Copa Italia'].id,
          cantidad: 1,
          clubId: teamsByName['Juventus'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Copa Italia'].id,
          cantidad: 1,
          clubId: teamsByName['Parma'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Supercopa de Italia'].id,
          cantidad: 6,
          clubId: teamsByName['Juventus'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Supercopa de Italia'].id,
          cantidad: 1,
          clubId: teamsByName['Parma'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Copa de la UEFA'].id,
          cantidad: 1,
          clubId: teamsByName['Juventus'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Ligue 1'].id,
          cantidad: 1,
          clubId: teamsByName['Paris Saint-Germain'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Supercopa de Francia'].id,
          cantidad: 1,
          clubId: teamsByName['Paris Saint-Germain'].id,
        }),
      ],
      estado: Estado.RETIRADO,
      anioRetiro: 2023,
    }),
  );

  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Matthias Kessler',
      nacionalidad: 'Alemania',
      fechaNacimiento: '1995-03-12',
      posicion: Posicion.PORTERO,
      trayectoria: [trayectoriaRepo.create({ clubId: teamsByName['Bayern Múnich'].id, anioInicio: 2019 })],
      seleccionNombre: 'Alemania',
      seleccionAnioInicio: 2018,
      palmares: [
        palmaresRepo.create({
          tituloId: titlesByName['Bundesliga'].id,
          cantidad: 4,
          clubId: teamsByName['Bayern Múnich'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Copa Alemana'].id,
          cantidad: 1,
          clubId: teamsByName['Bayern Múnich'].id,
        }),
      ],
      estado: Estado.ACTIVO,
    }),
  );

  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Álvaro Duarte',
      nacionalidad: 'España',
      fechaNacimiento: '1997-06-20',
      posicion: Posicion.DEFENSA,
      trayectoria: [trayectoriaRepo.create({ clubId: teamsByName['Villarreal'].id, anioInicio: 2020 })],
      seleccionNombre: 'España',
      seleccionAnioInicio: 2021,
      palmares: [
        palmaresRepo.create({
          tituloId: titlesByName['LaLiga'].id,
          cantidad: 1,
          clubId: teamsByName['Villarreal'].id,
        }),
        palmaresRepo.create({
          tituloId: titlesByName['Copa del Rey'].id,
          cantidad: 1,
          clubId: teamsByName['Villarreal'].id,
        }),
      ],
      estado: Estado.ACTIVO,
    }),
  );

  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Thierry Aubert',
      nacionalidad: 'Francia',
      fechaNacimiento: '1985-09-02',
      posicion: Posicion.DELANTERO,
      trayectoria: [
        trayectoriaRepo.create({ clubId: teamsByName['Lyon'].id, anioInicio: 2008, anioFin: 2015 }),
      ],
      palmares: [
        palmaresRepo.create({
          tituloId: titlesByName['Ligue 1'].id,
          cantidad: 1,
          clubId: teamsByName['Lyon'].id,
        }),
      ],
      estado: Estado.RETIRADO,
      anioRetiro: 2015,
    }),
  );

  console.log('Seed completo: 4 ligas, catálogo de títulos, 2 usuarios y 4 jugadores.');
  await app.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
