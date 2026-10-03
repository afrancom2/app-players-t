import type { INestApplicationContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';
import { Role } from '../auth/enums/role.enum.js';
import { Team } from '../catalogs/entities/team.entity.js';
import { Title } from '../catalogs/entities/title.entity.js';
import { Estado } from '../players/enums/estado.enum.js';
import { Posicion } from '../players/enums/posicion.enum.js';
import { Palmares } from '../players/entities/palmares.entity.js';
import { Player } from '../players/entities/player.entity.js';
import { Trayectoria } from '../players/entities/trayectoria.entity.js';
import { User } from '../users/entities/user.entity.js';

/**
 * Crea los usuarios de prueba y un puñado de jugadores reales de ejemplo.
 * Pensado para correr UNA sola vez, sobre una base de datos recién creada
 * (ver el chequeo de AUTO_SEED en main.ts) — a diferencia de `syncCatalog`,
 * esto no es idempotente ni seguro de repetir: lo vuelve a llamar solo el
 * reset completo (`npm run seed`).
 */
export async function seedDemoData(app: INestApplicationContext): Promise<void> {
  const teamRepo = app.get<Repository<Team>>(getRepositoryToken(Team));
  const titleRepo = app.get<Repository<Title>>(getRepositoryToken(Title));
  const playerRepo = app.get<Repository<Player>>(getRepositoryToken(Player));
  const trayectoriaRepo = app.get<Repository<Trayectoria>>(getRepositoryToken(Trayectoria));
  const palmaresRepo = app.get<Repository<Palmares>>(getRepositoryToken(Palmares));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

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
  // El catálogo (ligas/equipos/títulos) ya existe para este punto, lo creó
  // syncCatalog justo antes. Lo cargamos entero en memoria una vez para
  // resolver club/título por nombre, igual que hacía el seed original.
  const teamsByName: Record<string, Team> = Object.fromEntries(
    (await teamRepo.find()).map((team) => [team.nombre, team]),
  );
  const titlesByName: Record<string, Title> = Object.fromEntries(
    (await titleRepo.find()).map((title) => [title.nombre, title]),
  );

  // Datos reales verificados en Wikipedia (sección Honours e infobox) a septiembre de 2026.
  const periodo = (club: string, anioInicio: number, anioFin?: number) =>
    trayectoriaRepo.create({ clubId: teamsByName[club].id, anioInicio, anioFin });
  const titulo = (nombre: string, cantidad: number, club?: string) =>
    palmaresRepo.create({
      tituloId: titlesByName[nombre].id,
      cantidad,
      clubId: club ? teamsByName[club].id : undefined,
    });

  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Gianluigi Buffon',
      nacionalidad: 'Italia',
      fechaNacimiento: '1978-01-28',
      posicion: Posicion.PORTERO,
      biografia:
        'Gianluigi Buffon es un exfutbolista italiano nacido en 1978. Debutó muy joven en el Parma, brilló durante muchos años en la Juventus y fue clave para que Italia ganara el Mundial de 2006. Es considerado uno de los mejores porteros de la historia y se retiró en 2023.',
      trayectoria: [
        periodo('Parma', 1995, 2001),
        periodo('Juventus', 2001, 2018),
        periodo('Paris Saint-Germain', 2018, 2019),
        periodo('Juventus', 2019, 2021),
        periodo('Parma', 2021, 2023),
      ],
      seleccionNombre: 'Italia',
      seleccionAnioInicio: 1997,
      seleccionAnioFin: 2018,
      palmares: [
        titulo('Copa Mundial de la FIFA', 1),
        titulo('Serie A', 10, 'Juventus'),
        titulo('Copa Italia', 5, 'Juventus'),
        titulo('Supercopa de Italia', 6, 'Juventus'),
        titulo('Copa Italia', 1, 'Parma'),
        titulo('Supercopa de Italia', 1, 'Parma'),
        titulo('UEFA Europa League', 1, 'Parma'),
        titulo('Ligue 1', 1, 'Paris Saint-Germain'),
        titulo('Trofeo de Campeones de Francia', 1, 'Paris Saint-Germain'),
      ],
      estado: Estado.RETIRADO,
      anioRetiro: 2023,
    }),
  );

  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Toni Kroos',
      nacionalidad: 'Alemania',
      fechaNacimiento: '1990-01-04',
      posicion: Posicion.MEDIO_CENTRO_DEFENSIVO,
      fotoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG_rUWRhE83XrP8_UPr4SIa0Y2GVmj8IE_u4A-1-iF3OcLGyEHjG65R5s&s=10',
      biografia:
        'Toni Kroos es un exfutbolista alemán nacido en 1990 en Greifswald. Formado en el Bayern Múnich, jugó cedido en el Bayer Leverkusen y en 2014 fichó por el Real Madrid, donde fue pieza fija del mediocampo durante diez temporadas. Ganó seis Champions League y el Mundial de 2014 con Alemania, y se retiró en 2024 tras la Eurocopa disputada en su país.',
      trayectoria: [
        periodo('Bayern Múnich', 2007, 2009),
        periodo('Bayer Leverkusen', 2009, 2010),
        periodo('Bayern Múnich', 2010, 2014),
        periodo('Real Madrid', 2014, 2024),
      ],
      seleccionNombre: 'Alemania',
      seleccionAnioInicio: 2010,
      seleccionAnioFin: 2024,
      palmares: [
        titulo('Copa Mundial de la FIFA', 1),
        titulo('Bundesliga', 3, 'Bayern Múnich'),
        titulo('Copa de Alemania', 3, 'Bayern Múnich'),
        titulo('Supercopa de Alemania', 1, 'Bayern Múnich'),
        titulo('UEFA Champions League', 1, 'Bayern Múnich'),
        titulo('Supercopa de la UEFA', 1, 'Bayern Múnich'),
        titulo('Mundial de Clubes de la FIFA', 1, 'Bayern Múnich'),
        titulo('LaLiga', 4, 'Real Madrid'),
        titulo('Copa del Rey', 1, 'Real Madrid'),
        titulo('Supercopa de España', 4, 'Real Madrid'),
        titulo('UEFA Champions League', 5, 'Real Madrid'),
        titulo('Supercopa de la UEFA', 3, 'Real Madrid'),
        titulo('Mundial de Clubes de la FIFA', 5, 'Real Madrid'),
      ],
      estado: Estado.RETIRADO,
      anioRetiro: 2024,
    }),
  );

  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Sergio Ramos',
      nacionalidad: 'España',
      fechaNacimiento: '1986-03-30',
      posicion: Posicion.DEFENSA_CENTRAL,
      fotoUrl:
        'https://www.tudn.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2F56%2F07%2F52b41e294a94bb2892d8b66af2df%2Fgettyimages-691957402.jpg&w=1280&q=75',
      biografia:
        'Sergio Ramos es un futbolista español nacido en 1986 en Camas (Sevilla). Tras debutar en el Sevilla, jugó dieciséis temporadas en el Real Madrid, del que fue capitán, y después pasó por el Paris Saint-Germain, regresó al Sevilla y jugó en el Monterrey. Es el jugador con más partidos en la historia de la selección española, con la que ganó el Mundial de 2010 y las Eurocopas de 2008 y 2012. Desde enero de 2026 es agente libre.',
      trayectoria: [
        periodo('Sevilla', 2004, 2005),
        periodo('Real Madrid', 2005, 2021),
        periodo('Paris Saint-Germain', 2021, 2023),
        periodo('Sevilla', 2023, 2024),
        periodo('Monterrey', 2025, 2025),
      ],
      seleccionNombre: 'España',
      seleccionAnioInicio: 2005,
      seleccionAnioFin: 2021,
      palmares: [
        titulo('Copa Mundial de la FIFA', 1),
        titulo('Eurocopa', 2),
        titulo('LaLiga', 5, 'Real Madrid'),
        titulo('Copa del Rey', 2, 'Real Madrid'),
        titulo('Supercopa de España', 4, 'Real Madrid'),
        titulo('UEFA Champions League', 4, 'Real Madrid'),
        titulo('Supercopa de la UEFA', 3, 'Real Madrid'),
        titulo('Mundial de Clubes de la FIFA', 4, 'Real Madrid'),
        titulo('Ligue 1', 2, 'Paris Saint-Germain'),
        titulo('Trofeo de Campeones de Francia', 1, 'Paris Saint-Germain'),
      ],
      estado: Estado.ACTIVO,
    }),
  );

  await playerRepo.save(
    playerRepo.create({
      nombreCompleto: 'Thierry Henry',
      nacionalidad: 'Francia',
      fechaNacimiento: '1977-08-17',
      posicion: Posicion.DELANTERO_CENTRO,
      biografia:
        'Thierry Henry es un exfutbolista francés nacido en 1977 en Les Ulis. Debutó en el Mónaco, pasó brevemente por la Juventus y se convirtió en leyenda del Arsenal, del que es el máximo goleador histórico. Después ganó el triplete con el Barcelona en 2009 y cerró su carrera en los New York Red Bulls, con una breve cesión al Arsenal en 2012. Con Francia fue campeón del Mundial de 1998 y de la Eurocopa 2000, y se retiró en 2014.',
      trayectoria: [
        periodo('Mónaco', 1994, 1999),
        periodo('Juventus', 1999, 1999),
        periodo('Arsenal', 1999, 2007),
        periodo('Barcelona', 2007, 2010),
        periodo('New York Red Bulls', 2010, 2014),
        periodo('Arsenal', 2012, 2012),
      ],
      seleccionNombre: 'Francia',
      seleccionAnioInicio: 1997,
      seleccionAnioFin: 2010,
      palmares: [
        titulo('Copa Mundial de la FIFA', 1),
        titulo('Eurocopa', 1),
        titulo('Copa Confederaciones de la FIFA', 1),
        titulo('Ligue 1', 1, 'Mónaco'),
        titulo('Premier League', 2, 'Arsenal'),
        titulo('FA Cup', 2, 'Arsenal'),
        titulo('FA Community Shield', 2, 'Arsenal'),
        titulo('LaLiga', 2, 'Barcelona'),
        titulo('Copa del Rey', 1, 'Barcelona'),
        titulo('Supercopa de España', 1, 'Barcelona'),
        titulo('UEFA Champions League', 1, 'Barcelona'),
        titulo('Supercopa de la UEFA', 1, 'Barcelona'),
        titulo('Mundial de Clubes de la FIFA', 1, 'Barcelona'),
        titulo("MLS Supporters' Shield", 1, 'New York Red Bulls'),
      ],
      estado: Estado.RETIRADO,
      anioRetiro: 2014,
    }),
  );

  console.log('Usuarios y jugadores de ejemplo creados: 2 usuarios, 4 jugadores.');
}
