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
import { LEAGUE_TITLES, TITLE_GROUPS } from './titles-data.js';

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
    { nombre: 'Premier League', pais: 'Inglaterra', equipos: ['Manchester City', 'Liverpool', 'Arsenal', 'Manchester United', 'Chelsea', 'Tottenham Hotspur', 'Newcastle United', 'Aston Villa', 'West Ham United', 'Everton', 'Wolverhampton Wanderers', 'Brighton & Hove Albion', 'Crystal Palace', 'Nottingham Forest', 'Fulham', 'Brentford', 'Bournemouth', 'Leeds United', 'Burnley', 'Sunderland'] },
    { nombre: 'LaLiga', pais: 'España', equipos: ['Real Sociedad', 'Villarreal', 'Athletic Club', 'Real Madrid', 'Barcelona', 'Atlético de Madrid', 'Real Betis', 'Sevilla', 'Valencia', 'Celta de Vigo', 'Espanyol', 'Getafe', 'Osasuna', 'Mallorca', 'Rayo Vallecano', 'Alavés', 'Girona', 'Levante', 'Elche', 'Real Oviedo'] },
    { nombre: 'Serie A', pais: 'Italia', equipos: ['Juventus', 'Parma', 'Inter', 'Milan', 'Napoli', 'Roma', 'Atalanta', 'Lazio', 'Fiorentina', 'Bologna', 'Torino', 'Genoa', 'Udinese', 'Cagliari', 'Hellas Verona', 'Como', 'Lecce', 'Sassuolo', 'Pisa', 'Cremonese'] },
    { nombre: 'Bundesliga', pais: 'Alemania', equipos: ['Bayern Múnich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt', 'VfB Stuttgart', 'Borussia Mönchengladbach', 'SC Freiburg', 'TSG Hoffenheim', 'Werder Bremen', 'Mainz 05', 'Union Berlin', 'VfL Wolfsburg', 'FC Augsburg', '1. FC Heidenheim', 'FC St. Pauli', 'Hamburger SV', '1. FC Köln'] },
    { nombre: 'Ligue 1', pais: 'Francia', equipos: ['Paris Saint-Germain', 'Marsella', 'Lyon', 'Mónaco', 'Lille', 'Lens', 'Rennes', 'Nice', 'Strasbourg', 'Toulouse', 'Nantes', 'Brest', 'Auxerre', 'Angers', 'Le Havre', 'Metz', 'Lorient', 'Paris FC'] },
    { nombre: 'Brasileirão', pais: 'Brasil', equipos: ['Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Grêmio', 'Atlético Mineiro', 'Fluminense', 'Botafogo', 'Internacional', 'Cruzeiro', 'Bahia', 'Vasco da Gama', 'Bragantino', 'Fortaleza', 'Santos', 'Vitória', 'Juventude', 'Ceará', 'Mirassol', 'Sport Recife'] },
    { nombre: 'Liga Profesional de Fútbol', pais: 'Argentina', equipos: ['River Plate', 'Boca Juniors', 'Racing Club', 'Independiente', 'San Lorenzo', 'Vélez Sarsfield', 'Argentinos Juniors', 'Talleres (Córdoba)', 'Estudiantes de La Plata', 'Gimnasia La Plata', 'Godoy Cruz', 'Huracán', 'Lanús', 'Banfield', 'Newell\'s Old Boys', 'Rosario Central', 'Instituto', 'Belgrano', 'Platense', 'Tigre', 'Barracas Central', 'Sarmiento (Junín)', 'Defensa y Justicia', 'Central Córdoba (SdE)', 'Unión (Santa Fe)', 'Independiente Rivadavia', 'Deportivo Riestra', 'Atlético Tucumán', 'San Martín (SJ)', 'Aldosivi'] },
    { nombre: 'Eredivisie', pais: 'Países Bajos', equipos: ['Ajax', 'PSV Eindhoven', 'Feyenoord', 'AZ Alkmaar', 'FC Twente', 'FC Utrecht', 'FC Groningen', 'Sparta Rotterdam', 'NEC Nijmegen', 'SC Heerenveen', 'Go Ahead Eagles', 'Fortuna Sittard', 'Heracles Almelo', 'NAC Breda', 'PEC Zwolle', 'Volendam', 'Excelsior', 'Telstar'] },
    { nombre: 'Primeira Liga', pais: 'Portugal', equipos: ['Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitória de Guimarães', 'Rio Ave', 'Estoril Praia', 'Gil Vicente', 'Arouca', 'Famalicão', 'Moreirense', 'Casa Pia', 'Santa Clara', 'Nacional', 'Estrela da Amadora', 'AVS', 'Alverca', 'Tondela'] },
    { nombre: 'Süper Lig', pais: 'Turquía', equipos: ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Başakşehir', 'Konyaspor', 'Kayserispor', 'Samsunspor', 'Antalyaspor', 'Alanyaspor', 'Göztepe', 'Gaziantep', 'Eyüpspor', 'Kasımpaşa', 'Rizespor', 'Gençlerbirliği', 'Kocaelispor', 'Fatih Karagümrük'] },
    { nombre: 'Jupiler Pro League', pais: 'Bélgica', equipos: ['Club Brugge', 'Anderlecht', 'Genk', 'Unión Saint-Gilloise', 'Standard Liège', 'Gent', 'Antwerp', 'Charleroi', 'Cercle Brugge', 'STVV', 'Westerlo', 'Mechelen', 'OH Leuven', 'Zulte Waregem', 'Dender', 'RAAL La Louvière'] },
    { nombre: 'Saudi Pro League', pais: 'Arabia Saudita', equipos: ['Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli', 'Al Qadsiah', 'Al Taawoun', 'Al Shabab', 'Al Ettifaq', 'Al Fateh', 'Al Fayha', 'Neom', 'Al Khaleej', 'Al Riyadh', 'Damac', 'Al Kholood', 'Al Hazem', 'Al Okhdood', 'Al Najma'] },
    { nombre: 'Liga MX', pais: 'México', equipos: ['América', 'Chivas Guadalajara', 'Cruz Azul', 'Monterrey', 'Tigres UANL', 'Pumas UNAM', 'Toluca', 'Santos Laguna', 'Pachuca', 'León', 'Atlas', 'Necaxa', 'Puebla', 'Tijuana', 'Mazatlán', 'Querétaro', 'Juárez', 'Atlético San Luis'] },
    { nombre: 'MLS', pais: 'Estados Unidos', equipos: ['LA Galaxy', 'LAFC', 'Inter Miami', 'Seattle Sounders', 'Atlanta United', 'Columbus Crew', 'FC Cincinnati', 'Philadelphia Union', 'New York City FC', 'New York Red Bulls', 'Orlando City', 'Nashville SC', 'Charlotte FC', 'Toronto FC', 'CF Montréal', 'D.C. United', 'Chicago Fire', 'New England Revolution', 'Real Salt Lake', 'Colorado Rapids', 'Sporting Kansas City', 'FC Dallas', 'Houston Dynamo', 'Austin FC', 'Minnesota United', 'St. Louis City SC', 'Portland Timbers', 'Vancouver Whitecaps', 'San Jose Earthquakes', 'San Diego FC'] },
    { nombre: 'Scottish Premiership', pais: 'Escocia', equipos: ['Celtic', 'Rangers', 'Aberdeen', 'Hearts', 'Hibernian', 'Dundee United', 'Motherwell', 'Kilmarnock', 'St Mirren', 'Dundee', 'Falkirk', 'Livingston'] },
    { nombre: 'Bundesliga', pais: 'Austria', equipos: ['Red Bull Salzburgo', 'Rapid Viena', 'Sturm Graz', 'Austria Viena', 'LASK', 'Wolfsberger AC', 'TSV Hartberg', 'SV Ried', 'Grazer AK', 'Blau-Weiß Linz', 'Rheindorf Altach', 'WSG Tirol'] },
    { nombre: 'Super League', pais: 'Suiza', equipos: ['Young Boys', 'Basilea', 'Servette', 'Zúrich', 'St. Gallen', 'Lugano', 'Sion', 'Lucerna', 'Lausana-Sport', 'Thun', 'Winterthur', 'Grasshopper'] },
    { nombre: 'Premier Liga', pais: 'Rusia', equipos: ['Zenit San Petersburgo', 'Spartak Moscú', 'CSKA Moscú', 'Dinamo Moscú', 'Krasnodar', 'Lokomotiv Moscú', 'Rubin Kazán', 'Rostov', 'Akhmat Grozni', 'Krylia Sovetov Samara', 'Dynamo Makhachkalá', 'Baltika Kaliningrado', 'Orenburg', 'Pari Nizhni Nóvgorod', 'Sochi', 'Akron Tolyatti'] },
    { nombre: 'Ukrainian Premier League', pais: 'Ucrania', equipos: ['Shakhtar Donetsk', 'Dinamo Kiev', 'Dnipro-1', 'Vorskla Poltava', 'Zorya Luhansk', 'Kryvbas Kryvyi Rih', 'Karpaty Lviv', 'Oleksandriya', 'Rukh Lviv', 'Kolos Kovalivka', 'Polissya Zhytomyr', 'Metalist 1925 Kharkiv', 'LNZ Cherkasy', 'Veres Rivne', 'Obolon Kiev', 'Epitsentr Kamianets-Podilskyi'] },
    { nombre: 'HNL', pais: 'Croacia', equipos: ['Dinamo Zagreb', 'Hajduk Split', 'Rijeka', 'Osijek', 'Gorica', 'Lokomotiva Zagreb', 'Varaždin', 'Slaven Belupo', 'Istra 1961', 'Vukovar 1991'] },
    { nombre: 'SuperLiga', pais: 'Serbia', equipos: ['Estrella Roja de Belgrado', 'Partizán de Belgrado', 'Vojvodina', 'Železničar Pančevo', 'Novi Pazar', 'OFK Beograd', 'Čukarički', 'Radnik Surdulica', 'IMT Novi Beograd', 'Radnički 1923', 'Javor-Matis', 'TSC Bačka Topola', 'Radnički Niš', 'Mladost Lučani', 'Spartak Subotica', 'Napredak Kruševac'] },
    { nombre: 'Ekstraklasa', pais: 'Polonia', equipos: ['Legia Varsovia', 'Lech Poznan', 'Raków Częstochowa', 'Górnik Zabrze', 'Jagiellonia Białystok', 'GKS Katowice', 'Zagłębie Lubin', 'Wisła Płock', 'Pogoń Szczecin', 'Radomiak Radom', 'Korona Kielce', 'Motor Lublin', 'Cracovia', 'Widzew Łódź', 'Piast Gliwice', 'Lechia Gdańsk', 'Arka Gdynia', 'Bruk-Bet Termalica Nieciecza'] },
    { nombre: 'Chance Liga', pais: 'República Checa', equipos: ['Slavia Praga', 'Sparta Praga', 'Viktoria Plzeň', 'Baník Ostrava', 'Sigma Olomouc', 'Slovácko', 'Bohemians 1905', 'Mladá Boleslav', 'Slovan Liberec', 'Jablonec', 'Hradec Králové', 'Zlín', 'Karviná', 'Teplice', 'Dukla Praga', 'Pardubice'] },
    { nombre: 'Niké Liga', pais: 'Eslovaquia', equipos: ['Slovan Bratislava', 'Spartak Trnava', 'Žilina', 'DAC Dunajská Streda', 'Ružomberok', 'Trenčín', 'Košice', 'Tatran Prešov', 'Podbrezová', 'Zemplín Michalovce', 'Skalica', 'Komárno'] },
    { nombre: 'SuperLiga', pais: 'Rumania', equipos: ['FCSB', 'CFR Cluj', 'Universitatea Craiova', 'Rapid Bucarest', 'Dinamo Bucarest', 'Universitatea Cluj', 'Farul Constanța', 'Petrolul Ploiești', 'Oțelul Galați', 'UTA Arad', 'Botoșani', 'Argeș Pitești', 'Hermannstadt', 'Csíkszereda Miercurea Ciuc', 'Unirea Slobozia', 'Metaloglobus Bucarest'] },
    { nombre: 'Superliga', pais: 'Dinamarca', equipos: ['FC Copenhague', 'Midtjylland', 'Brøndby', 'AGF', 'Nordsjælland', 'OB', 'Randers', 'Silkeborg', 'Viborg', 'Sønderjyske', 'Vejle', 'Fredericia'] },
    { nombre: 'Eliteserien', pais: 'Noruega', equipos: ['Bodø/Glimt', 'Molde', 'Rosenborg', 'Vålerenga', 'Brann', 'Viking', 'Lillestrøm', 'Tromsø', 'Sarpsborg 08', 'Fredrikstad', 'Start', 'Aalesund', 'Sandefjord', 'HamKam', 'Kristiansund', 'KFUM Oslo'] },
    { nombre: 'Allsvenskan', pais: 'Suecia', equipos: ['Malmö FF', 'AIK', 'Hammarby', 'Djurgården', 'IFK Göteborg', 'BK Häcken', 'IF Elfsborg', 'Mjällby AIF', 'GAIS', 'IFK Norrköping', 'Halmstads BK', 'IK Sirius', 'IF Brommapojkarna', 'Degerfors IF', 'Östers IF', 'IFK Värnamo'] },
    { nombre: 'Super League', pais: 'Grecia', equipos: ['Olympiacos', 'Panathinaikos', 'AEK Atenas', 'PAOK', 'Aris', 'AEL', 'OFI Creta', 'Asteras Tripolis', 'Panetolikos', 'Atromitos', 'Volos', 'Levadiakos', 'Panserraikos', 'AE Kifisia'] },
    { nombre: "Ligat ha'Al", pais: 'Israel', equipos: ['Maccabi Tel Aviv', 'Maccabi Haifa', 'Hapoel Beer Sheva', 'Beitar Jerusalem', 'Hapoel Tel Aviv', 'Maccabi Netanya', 'Bnei Sakhnin', 'Hapoel Haifa', 'Ironi Kiryat Shmona', 'Hapoel Jerusalem', 'Hapoel Petah Tikva', 'FC Ashdod', 'Ironi Tiberias', 'Maccabi Bnei Reineh'] },
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
  const leaguesByKey: Record<string, League> = {};
  for (const [index, liga] of leaguesData.entries()) {
    const league = await leagueRepo.save(
      leagueRepo.create({ nombre: liga.nombre, pais: liga.pais, orden: index + 1 }),
    );
    leaguesByKey[`${liga.pais}|${liga.nombre}`] = league;
    for (const teamName of liga.equipos) {
      teamsByName[teamName] = await teamRepo.save(
        teamRepo.create({ nombre: teamName, ligaId: league.id }),
      );
    }
  }

  console.log('Creando catálogo de títulos...');
  const titlesByName: Record<string, Title> = {};
  for (const [key, titulos] of Object.entries(LEAGUE_TITLES)) {
    const league = leaguesByKey[key];
    if (!league) throw new Error(`Títulos para una liga que no existe en el catálogo: ${key}`);
    for (const [orden, nombre] of titulos.entries()) {
      titlesByName[nombre] = await titleRepo.save(
        titleRepo.create({ nombre, ligaId: league.id, grupo: null, orden }),
      );
    }
  }
  for (const grupo of TITLE_GROUPS) {
    for (const [orden, nombre] of grupo.titulos.entries()) {
      titlesByName[nombre] = await titleRepo.save(
        titleRepo.create({ nombre, ligaId: null, grupo: grupo.codigo, orden }),
      );
    }
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
      posicion: Posicion.MEDIOCAMPISTA,
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
      posicion: Posicion.DEFENSA,
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
      posicion: Posicion.DELANTERO,
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

  console.log(
    `Seed completo: ${leaguesData.length} ligas, catálogo de títulos, 2 usuarios y 4 jugadores.`,
  );
}
