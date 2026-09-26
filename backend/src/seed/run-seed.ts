import type { INestApplicationContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, type Repository } from 'typeorm';
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

export async function runSeed(app: INestApplicationContext): Promise<void> {
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
  // Top ~55 ligas del mundo (aproximación a la clasificación de la IFFHS;
  // el sitio oficial no publica ahora mismo una tabla completa verificable
  // más allá de las primeras ~25 posiciones, así que el orden desde ahí es
  // una aproximación razonable, no un dato oficial exacto).
  const leaguesData = [
    { nombre: 'Premier League', pais: 'Inglaterra', equipos: ['Manchester City', 'Liverpool', 'Arsenal', 'Manchester United', 'Chelsea', 'Tottenham Hotspur', 'Newcastle United'] },
    { nombre: 'LaLiga', pais: 'España', equipos: ['Real Sociedad', 'Villarreal', 'Athletic Club', 'Real Madrid', 'Barcelona', 'Atlético de Madrid'] },
    { nombre: 'Serie A', pais: 'Italia', equipos: ['Juventus', 'Parma', 'Inter', 'Milan', 'Napoli', 'Roma'] },
    { nombre: 'Bundesliga', pais: 'Alemania', equipos: ['Bayern Múnich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt'] },
    { nombre: 'Ligue 1', pais: 'Francia', equipos: ['Paris Saint-Germain', 'Marsella', 'Lyon', 'Mónaco', 'Lille'] },
    { nombre: 'Brasileirão', pais: 'Brasil', equipos: ['Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Grêmio', 'Atlético Mineiro', 'Fluminense'] },
    { nombre: 'Liga Profesional de Fútbol', pais: 'Argentina', equipos: ['River Plate', 'Boca Juniors', 'Racing Club', 'Independiente', 'San Lorenzo', 'Vélez Sarsfield'] },
    { nombre: 'Eredivisie', pais: 'Países Bajos', equipos: ['Ajax', 'PSV Eindhoven', 'Feyenoord', 'AZ Alkmaar', 'FC Twente'] },
    { nombre: 'Primeira Liga', pais: 'Portugal', equipos: ['Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitória de Guimarães'] },
    { nombre: 'Süper Lig', pais: 'Turquía', equipos: ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor'] },
    { nombre: 'Jupiler Pro League', pais: 'Bélgica', equipos: ['Club Brugge', 'Anderlecht', 'Genk', 'Unión Saint-Gilloise'] },
    { nombre: 'Saudi Pro League', pais: 'Arabia Saudita', equipos: ['Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli'] },
    { nombre: 'Liga MX', pais: 'México', equipos: ['América', 'Chivas Guadalajara', 'Cruz Azul', 'Monterrey', 'Tigres UANL'] },
    { nombre: 'MLS', pais: 'Estados Unidos', equipos: ['LA Galaxy', 'LAFC', 'Inter Miami', 'Seattle Sounders', 'Atlanta United'] },
    { nombre: 'Scottish Premiership', pais: 'Escocia', equipos: ['Celtic', 'Rangers', 'Aberdeen', 'Hearts'] },
    { nombre: 'Bundesliga', pais: 'Austria', equipos: ['Red Bull Salzburgo', 'Rapid Viena', 'Sturm Graz', 'Austria Viena'] },
    { nombre: 'Super League', pais: 'Suiza', equipos: ['Young Boys', 'Basilea', 'Servette', 'Zúrich'] },
    { nombre: 'Premier Liga', pais: 'Rusia', equipos: ['Zenit San Petersburgo', 'Spartak Moscú', 'CSKA Moscú', 'Dinamo Moscú'] },
    { nombre: 'Ukrainian Premier League', pais: 'Ucrania', equipos: ['Shakhtar Donetsk', 'Dinamo Kiev', 'Dnipro-1', 'Vorskla Poltava'] },
    { nombre: 'HNL', pais: 'Croacia', equipos: ['Dinamo Zagreb', 'Hajduk Split', 'Rijeka', 'Osijek'] },
    { nombre: 'SuperLiga', pais: 'Serbia', equipos: ['Estrella Roja de Belgrado', 'Partizán de Belgrado', 'Vojvodina'] },
    { nombre: 'Ekstraklasa', pais: 'Polonia', equipos: ['Legia Varsovia', 'Lech Poznan', 'Raków Częstochowa'] },
    { nombre: 'Fortuna Liga', pais: 'República Checa', equipos: ['Slavia Praga', 'Sparta Praga', 'Viktoria Plzeň'] },
    { nombre: 'Fortuna Liga', pais: 'Eslovaquia', equipos: ['Slovan Bratislava', 'Spartak Trnava', 'Žilina'] },
    { nombre: 'Liga I', pais: 'Rumania', equipos: ['FCSB', 'CFR Cluj', 'Universitatea Craiova', 'Rapid Bucarest'] },
    { nombre: 'Superliga', pais: 'Dinamarca', equipos: ['FC Copenhague', 'Midtjylland', 'Brøndby'] },
    { nombre: 'Eliteserien', pais: 'Noruega', equipos: ['Bodø/Glimt', 'Molde', 'Rosenborg'] },
    { nombre: 'Allsvenskan', pais: 'Suecia', equipos: ['Malmö FF', 'AIK', 'Hammarby', 'Djurgården'] },
    { nombre: 'Super League', pais: 'Grecia', equipos: ['Olympiacos', 'Panathinaikos', 'AEK Atenas', 'PAOK'] },
    { nombre: "Ligat ha'Al", pais: 'Israel', equipos: ['Maccabi Tel Aviv', 'Maccabi Haifa', 'Hapoel Beer Sheva'] },
    { nombre: 'First Division', pais: 'Chipre', equipos: ['APOEL', 'Omonia Nicosia', 'AEK Larnaca'] },
    { nombre: 'Premier League', pais: 'Egipto', equipos: ['Al Ahly', 'Zamalek', 'Pyramids FC'] },
    { nombre: 'Botola Pro', pais: 'Marruecos', equipos: ['Raja Casablanca', 'Wydad Casablanca', 'FAR Rabat'] },
    { nombre: 'J1 League', pais: 'Japón', equipos: ['Vissel Kobe', 'Yokohama F. Marinos', 'Kawasaki Frontale', 'Urawa Red Diamonds'] },
    { nombre: 'K League 1', pais: 'Corea del Sur', equipos: ['Ulsan HD', 'Jeonbuk Hyundai Motors', 'Pohang Steelers'] },
    { nombre: 'Super League', pais: 'China', equipos: ['Shanghai Port', 'Shandong Taishan', 'Beijing Guoan'] },
    { nombre: 'A-League', pais: 'Australia', equipos: ['Melbourne City', 'Sydney FC', 'Central Coast Mariners'] },
    { nombre: 'Categoría Primera A', pais: 'Colombia', equipos: ['Atlético Nacional', 'Millonarios', 'América de Cali', 'Deportivo Cali'] },
    { nombre: 'LigaPro', pais: 'Ecuador', equipos: ['Barcelona SC', 'Emelec', 'Liga de Quito', 'Independiente del Valle'] },
    { nombre: 'Primera División', pais: 'Uruguay', equipos: ['Peñarol', 'Nacional', 'Defensor Sporting'] },
    { nombre: 'Primera División', pais: 'Paraguay', equipos: ['Olimpia', 'Cerro Porteño', 'Libertad'] },
    { nombre: 'Primera División', pais: 'Chile', equipos: ['Colo-Colo', 'Universidad de Chile', 'Universidad Católica'] },
    { nombre: 'Liga 1', pais: 'Perú', equipos: ['Universitario de Deportes', 'Alianza Lima', 'Sporting Cristal'] },
    { nombre: 'Primera División', pais: 'Costa Rica', equipos: ['Saprissa', 'Alajuelense', 'Herediano'] },
    { nombre: 'División Profesional', pais: 'Bolivia', equipos: ['Bolívar', 'The Strongest', 'Always Ready'] },
    { nombre: 'Liga FUTVE', pais: 'Venezuela', equipos: ['Deportivo Táchira', 'Caracas FC', 'Metropolitanos'] },
    { nombre: 'NB I', pais: 'Hungría', equipos: ['Ferencváros', 'Puskás Akadémia', 'Győri ETO'] },
    { nombre: 'First League', pais: 'Bulgaria', equipos: ['Ludogorets Razgrado', 'CSKA Sofía', 'Levski Sofía'] },
    { nombre: 'Veikkausliiga', pais: 'Finlandia', equipos: ['HJK Helsinki', 'KuPS Kuopio', 'Inter Turku'] },
    { nombre: 'Besta deild karla', pais: 'Islandia', equipos: ['Valur', 'KR Reykjavík', 'Breidablik'] },
    { nombre: 'Stars League', pais: 'Catar', equipos: ['Al Sadd', 'Al Duhail', 'Al Rayyan'] },
    { nombre: 'Pro League', pais: 'Emiratos Árabes Unidos', equipos: ['Al Ain', 'Shabab Al Ahli', 'Al Wasl'] },
    { nombre: 'Indian Super League', pais: 'India', equipos: ['Mohun Bagan', 'Bengaluru FC', 'Mumbai City FC'] },
    { nombre: 'Thai League 1', pais: 'Tailandia', equipos: ['Buriram United', 'Bangkok United', 'Muangthong United'] },
    { nombre: 'Premier Soccer League', pais: 'Sudáfrica', equipos: ['Mamelodi Sundowns', 'Orlando Pirates', 'Kaizer Chiefs'] },
    { nombre: 'Ligue Professionnelle 1', pais: 'Túnez', equipos: ['Espérance de Tunis', 'Étoile du Sahel', 'Club Africain'] },
  ];

  const teamsByName: Record<string, Team> = {};
  for (const [index, liga] of leaguesData.entries()) {
    const league = await leagueRepo.save(
      leagueRepo.create({ nombre: liga.nombre, pais: liga.pais, orden: index + 1 }),
    );
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

  console.log(
    `Seed completo: ${leaguesData.length} ligas, catálogo de títulos, 2 usuarios y 4 jugadores.`,
  );
}
