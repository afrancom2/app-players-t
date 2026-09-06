import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import type { Model } from 'mongoose';
import { AppModule } from '../app.module.js';
import { Role } from '../auth/enums/role.enum.js';
import { League } from '../catalogs/schemas/league.schema.js';
import { Team } from '../catalogs/schemas/team.schema.js';
import { Title } from '../catalogs/schemas/title.schema.js';
import { Estado } from '../players/enums/estado.enum.js';
import { Posicion } from '../players/enums/posicion.enum.js';
import { Player } from '../players/schemas/player.schema.js';
import { User } from '../users/schemas/user.schema.js';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const leagueModel = app.get<Model<any>>(getModelToken(League.name));
  const teamModel = app.get<Model<any>>(getModelToken(Team.name));
  const titleModel = app.get<Model<any>>(getModelToken(Title.name));
  const playerModel = app.get<Model<any>>(getModelToken(Player.name));
  const userModel = app.get<Model<any>>(getModelToken(User.name));

  console.log('Limpiando colecciones...');
  await Promise.all([
    leagueModel.deleteMany({}),
    teamModel.deleteMany({}),
    titleModel.deleteMany({}),
    playerModel.deleteMany({}),
    userModel.deleteMany({}),
  ]);

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

  const teamsByName: Record<string, any> = {};
  for (const liga of leaguesData) {
    const league = await leagueModel.create({ nombre: liga.nombre, pais: liga.pais });
    for (const teamName of liga.equipos) {
      teamsByName[teamName] = await teamModel.create({ nombre: teamName, ligaId: league._id });
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
  const titlesByName: Record<string, any> = {};
  for (const nombre of titleNames) {
    titlesByName[nombre] = await titleModel.create({ nombre });
  }

  console.log('Creando usuarios de prueba...');
  const adminHash = await bcrypt.hash('admin1234', 10);
  const consultaHash = await bcrypt.hash('consulta1234', 10);
  await userModel.create([
    {
      email: 'admin@jugadores.app',
      passwordHash: adminHash,
      nombre: 'Administrador',
      role: Role.ADMIN,
    },
    {
      email: 'consulta@jugadores.app',
      passwordHash: consultaHash,
      nombre: 'Usuario de Consulta',
      role: Role.CONSULTA,
    },
  ]);

  console.log('Creando jugadores de ejemplo...');
  await playerModel.create([
    {
      nombreCompleto: 'Gianluigi Buffon',
      nacionalidad: 'Italia',
      fechaNacimiento: new Date('1978-01-28'),
      posicion: Posicion.PORTERO,
      biografia:
        'Gianluigi Buffon es un exfutbolista italiano nacido en 1978. Debutó muy joven en el Parma, brilló durante muchos años en la Juventus y fue clave para que Italia ganara el Mundial de 2006. Es considerado uno de los mejores porteros de la historia y se retiró en 2023.',
      trayectoria: [
        { clubId: teamsByName['Parma']._id, anioInicio: 1995, anioFin: 2001 },
        { clubId: teamsByName['Juventus']._id, anioInicio: 2001, anioFin: 2018 },
        { clubId: teamsByName['Paris Saint-Germain']._id, anioInicio: 2018, anioFin: 2019 },
        { clubId: teamsByName['Juventus']._id, anioInicio: 2019, anioFin: 2021 },
        { clubId: teamsByName['Parma']._id, anioInicio: 2021, anioFin: 2023 },
      ],
      seleccion: { nombre: 'Italia', anioInicio: 1997, anioFin: 2018 },
      palmares: [
        { tituloId: titlesByName['Mundial']._id, cantidad: 1 },
        { tituloId: titlesByName['Serie A']._id, cantidad: 10, clubId: teamsByName['Juventus']._id },
        {
          tituloId: titlesByName['Copa Italia']._id,
          cantidad: 1,
          clubId: teamsByName['Juventus']._id,
        },
        {
          tituloId: titlesByName['Copa Italia']._id,
          cantidad: 1,
          clubId: teamsByName['Parma']._id,
        },
        {
          tituloId: titlesByName['Supercopa de Italia']._id,
          cantidad: 6,
          clubId: teamsByName['Juventus']._id,
        },
        {
          tituloId: titlesByName['Supercopa de Italia']._id,
          cantidad: 1,
          clubId: teamsByName['Parma']._id,
        },
        {
          tituloId: titlesByName['Copa de la UEFA']._id,
          cantidad: 1,
          clubId: teamsByName['Juventus']._id,
        },
        {
          tituloId: titlesByName['Ligue 1']._id,
          cantidad: 1,
          clubId: teamsByName['Paris Saint-Germain']._id,
        },
        {
          tituloId: titlesByName['Supercopa de Francia']._id,
          cantidad: 1,
          clubId: teamsByName['Paris Saint-Germain']._id,
        },
      ],
      estado: Estado.RETIRADO,
      anioRetiro: 2023,
    },
    {
      nombreCompleto: 'Matthias Kessler',
      nacionalidad: 'Alemania',
      fechaNacimiento: new Date('1995-03-12'),
      posicion: Posicion.PORTERO,
      trayectoria: [{ clubId: teamsByName['Bayern Múnich']._id, anioInicio: 2019 }],
      seleccion: { nombre: 'Alemania', anioInicio: 2018 },
      palmares: [
        {
          tituloId: titlesByName['Bundesliga']._id,
          cantidad: 4,
          clubId: teamsByName['Bayern Múnich']._id,
        },
        {
          tituloId: titlesByName['Copa Alemana']._id,
          cantidad: 1,
          clubId: teamsByName['Bayern Múnich']._id,
        },
      ],
      estado: Estado.ACTIVO,
    },
    {
      nombreCompleto: 'Álvaro Duarte',
      nacionalidad: 'España',
      fechaNacimiento: new Date('1997-06-20'),
      posicion: Posicion.DEFENSA,
      trayectoria: [{ clubId: teamsByName['Villarreal']._id, anioInicio: 2020 }],
      seleccion: { nombre: 'España', anioInicio: 2021 },
      palmares: [
        { tituloId: titlesByName['LaLiga']._id, cantidad: 1, clubId: teamsByName['Villarreal']._id },
        {
          tituloId: titlesByName['Copa del Rey']._id,
          cantidad: 1,
          clubId: teamsByName['Villarreal']._id,
        },
      ],
      estado: Estado.ACTIVO,
    },
    {
      nombreCompleto: 'Thierry Aubert',
      nacionalidad: 'Francia',
      fechaNacimiento: new Date('1985-09-02'),
      posicion: Posicion.DELANTERO,
      trayectoria: [{ clubId: teamsByName['Lyon']._id, anioInicio: 2008, anioFin: 2015 }],
      palmares: [{ tituloId: titlesByName['Ligue 1']._id, cantidad: 1, clubId: teamsByName['Lyon']._id }],
      estado: Estado.RETIRADO,
      anioRetiro: 2015,
    },
  ]);

  console.log('Seed completo: 4 ligas, catálogo de títulos, 2 usuarios y 4 jugadores.');
  await app.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
