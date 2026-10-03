/**
 * Catálogo de títulos para el palmarés, siempre con el nombre ACTUAL de cada
 * competición (ej. la antigua "Copa de la UEFA" es la UEFA Europa League) y
 * sin nombres de patrocinador. Las competiciones ya desaparecidas se marcan
 * con "†" en el comentario: se incluyen porque un jugador retirado pudo
 * ganarlas. Los nombres son únicos en todo el catálogo.
 */

/** Grupos de títulos que no dependen de una liga: organizadores internacionales y selecciones. */
export const TITLE_GROUPS = [
  { codigo: 'FIFA', titulos: ['Mundial de Clubes de la FIFA', 'Copa Intercontinental de la FIFA'] },
  {
    codigo: 'UEFA',
    titulos: [
      'UEFA Champions League',
      'UEFA Europa League',
      'UEFA Conference League',
      'Supercopa de la UEFA',
      'Recopa de Europa', // †
      'Copa Intertoto', // †
    ],
  },
  {
    codigo: 'CONMEBOL',
    titulos: [
      'Copa Libertadores',
      'Copa Sudamericana',
      'Recopa Sudamericana',
      'Supercopa Sudamericana', // †
      'Copa Conmebol', // †
    ],
  },
  {
    codigo: 'CONCACAF',
    titulos: [
      'Copa de Campeones de la Concacaf',
      'Leagues Cup',
      'Campeones Cup',
      'Copa Centroamericana de la Concacaf',
    ],
  },
  {
    codigo: 'AFC',
    titulos: ['Liga de Campeones de la AFC Élite', 'Liga de Campeones de la AFC 2'],
  },
  {
    codigo: 'CAF',
    titulos: ['Liga de Campeones de la CAF', 'Copa Confederación de la CAF', 'Supercopa de la CAF'],
  },
  { codigo: 'UAFA', titulos: ['Copa Árabe de Clubes Campeones'] },
  { codigo: 'OFC', titulos: ['Liga de Campeones de la OFC'] },
  {
    codigo: 'SELECCIONES',
    titulos: [
      'Copa Mundial de la FIFA',
      'Copa Confederaciones de la FIFA', // †
      'Juegos Olímpicos',
      'Eurocopa',
      'UEFA Nations League',
      'Copa América',
      'Finalissima',
      'Copa Oro de la Concacaf',
      'Liga de Naciones de la Concacaf',
      'Copa Africana de Naciones',
      'Copa Asiática de la AFC',
      'Copa de Naciones de la OFC',
      'Copa Mundial Sub-20 de la FIFA',
      'Copa Mundial Sub-17 de la FIFA',
    ],
  },
] as const;

/** Títulos nacionales de clubes por liga, con llave "pais|nombre" igual al catálogo de ligas. */
export const LEAGUE_TITLES: Record<string, string[]> = {
  // Europa
  'Inglaterra|Premier League': ['Premier League', 'FA Cup', 'EFL Cup', 'FA Community Shield'],
  'España|LaLiga': ['LaLiga', 'Copa del Rey', 'Supercopa de España'],
  'Italia|Serie A': ['Serie A', 'Copa Italia', 'Supercopa de Italia'],
  'Alemania|Bundesliga': ['Bundesliga', 'Copa de Alemania', 'Supercopa de Alemania'],
  'Francia|Ligue 1': [
    'Ligue 1',
    'Copa de Francia',
    'Trofeo de Campeones de Francia',
    'Copa de la Liga de Francia', // †
  ],
  'Países Bajos|Eredivisie': ['Eredivisie', 'Copa de los Países Bajos', 'Supercopa Johan Cruyff'],
  'Portugal|Primeira Liga': [
    'Primeira Liga',
    'Taça de Portugal',
    'Taça da Liga',
    'Supertaça Cândido de Oliveira',
  ],
  'Turquía|Süper Lig': ['Süper Lig', 'Copa de Turquía', 'Supercopa de Turquía'],
  'Bélgica|Jupiler Pro League': ['Pro League de Bélgica', 'Copa de Bélgica', 'Supercopa de Bélgica'],
  'Escocia|Scottish Premiership': [
    'Scottish Premiership',
    'Copa de Escocia',
    'Copa de la Liga de Escocia',
  ],
  'Austria|Bundesliga': ['Bundesliga de Austria', 'Copa de Austria'],
  'Suiza|Super League': ['Super League de Suiza', 'Copa de Suiza'],
  'Rusia|Premier Liga': ['Premier Liga', 'Copa de Rusia', 'Supercopa de Rusia'],
  'Ucrania|Ukrainian Premier League': [
    'Premier League de Ucrania',
    'Copa de Ucrania',
    'Supercopa de Ucrania',
  ],
  'Croacia|HNL': ['HNL', 'Copa de Croacia', 'Supercopa de Croacia'],
  'Serbia|SuperLiga': ['SuperLiga de Serbia', 'Copa de Serbia'],
  'Polonia|Ekstraklasa': ['Ekstraklasa', 'Copa de Polonia', 'Supercopa de Polonia'],
  'República Checa|Chance Liga': ['Chance Liga', 'Copa de la República Checa'],
  'Eslovaquia|Niké Liga': ['Niké Liga', 'Copa de Eslovaquia'],
  'Rumania|SuperLiga': ['SuperLiga de Rumania', 'Copa de Rumania', 'Supercopa de Rumania'],
  'Dinamarca|Superliga': ['Superliga de Dinamarca', 'Copa de Dinamarca'],
  'Noruega|Eliteserien': ['Eliteserien', 'Copa de Noruega'],
  'Suecia|Allsvenskan': ['Allsvenskan', 'Copa de Suecia'],
  'Grecia|Super League': ['Super League de Grecia', 'Copa de Grecia'],
  "Israel|Ligat ha'Al": ["Ligat ha'Al", 'Copa de Israel', 'Supercopa de Israel'],
  'Chipre|First Division': ['First Division de Chipre', 'Copa de Chipre', 'Supercopa de Chipre'],
  'Hungría|NB I': ['NB I', 'Copa de Hungría'],
  'Bulgaria|First League': ['First League de Bulgaria', 'Copa de Bulgaria', 'Supercopa de Bulgaria'],
  'Finlandia|Veikkausliiga': ['Veikkausliiga', 'Copa de Finlandia', 'Copa de la Liga de Finlandia'],
  'Islandia|Besta deild karla': ['Besta deild karla', 'Copa de Islandia'],

  // América
  'Brasil|Brasileirão': ['Brasileirão', 'Copa de Brasil', 'Supercopa de Brasil'],
  'Argentina|Liga Profesional de Fútbol': [
    'Liga Profesional Argentina',
    'Copa Argentina',
    'Copa de la Liga Profesional', // †
    'Trofeo de Campeones de Argentina',
    'Supercopa Argentina',
  ],
  'México|Liga MX': [
    'Liga MX',
    'Campeón de Campeones',
    'Copa MX', // †
    'Supercopa MX', // †
  ],
  'Estados Unidos|MLS': ['MLS Cup', "MLS Supporters' Shield", 'U.S. Open Cup'],
  'Colombia|Categoría Primera A': ['Primera A de Colombia', 'Copa Colombia', 'Superliga de Colombia'],
  'Ecuador|LigaPro': ['LigaPro', 'Copa Ecuador', 'Supercopa de Ecuador'],
  'Uruguay|Primera División': ['Primera División de Uruguay', 'Copa AUF Uruguay', 'Supercopa Uruguaya'],
  'Paraguay|Primera División': ['Primera División de Paraguay', 'Copa Paraguay', 'Supercopa Paraguay'],
  'Chile|Primera División': ['Primera División de Chile', 'Copa Chile', 'Supercopa de Chile'],
  'Perú|Liga 1': ['Liga 1 de Perú'],
  'Costa Rica|Primera División': [
    'Primera División de Costa Rica',
    'Torneo de Copa de Costa Rica',
    'Supercopa de Costa Rica',
  ],
  'Bolivia|División Profesional': ['División Profesional de Bolivia'],
  'Venezuela|Liga FUTVE': ['Liga FUTVE', 'Copa Venezuela'],

  // Asia, África y Oceanía
  'Arabia Saudita|Saudi Pro League': [
    'Saudi Pro League',
    'Copa del Rey de Campeones',
    'Supercopa de Arabia Saudita',
  ],
  'Japón|J1 League': ['J1 League', 'Copa del Emperador', 'Copa J.League', 'Supercopa de Japón'],
  'Corea del Sur|K League 1': ['K League 1', 'Copa de Corea'],
  'China|Super League': ['Super League de China', 'Copa de China', 'Supercopa de China'],
  'Australia|A-League': ['A-League', 'A-League Premiership', 'Copa de Australia'],
  'Catar|Stars League': ['Stars League', 'Copa del Emir de Catar', 'Copa de Catar'],
  'Emiratos Árabes Unidos|Pro League': [
    'Pro League de EAU',
    'Copa del Presidente de EAU',
    'Copa de la Liga de EAU',
    'Supercopa de EAU',
  ],
  'India|Indian Super League': ['Indian Super League', 'ISL League Shield', 'Super Cup de India', 'Durand Cup'],
  'Tailandia|Thai League 1': ['Thai League 1', 'Copa FA de Tailandia', 'Copa de la Liga de Tailandia'],
  'Egipto|Premier League': ['Premier League de Egipto', 'Copa de Egipto', 'Supercopa de Egipto'],
  'Marruecos|Botola Pro': ['Botola Pro', 'Copa del Trono'],
  'Túnez|Ligue Professionnelle 1': ['Ligue Professionnelle 1', 'Copa de Túnez', 'Supercopa de Túnez'],
  'Sudáfrica|Premier Soccer League': ['Premiership de Sudáfrica', 'Nedbank Cup', 'MTN 8', 'Carling Knockout'],
};
