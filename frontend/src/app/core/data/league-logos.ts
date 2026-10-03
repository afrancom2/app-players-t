/**
 * Mapa de "pais|nombre" de liga (tal como esta en el catalogo del backend)
 * al archivo de logo bajo public/leagues/. Se usa la combinacion de pais y
 * nombre como llave porque varios paises comparten nombre de liga (ej.
 * "Bundesliga" en Alemania y Austria, "Premier League" en Inglaterra y
 * Egipto). Las ligas que no aparecen aca muestran un distintivo con sus
 * iniciales en vez de logo.
 */
export const LEAGUE_LOGOS: Record<string, string> = {
  'Inglaterra|Premier League': 'premier-league-eng.svg',
  'España|LaLiga': 'laliga-esp.svg',
  'Italia|Serie A': 'serie-a-ita.svg',
  'Alemania|Bundesliga': 'bundesliga-ger.svg',
  'Francia|Ligue 1': 'ligue-1-fra.svg',
  'Brasil|Brasileirão': 'brasileirao.svg',
  'Argentina|Liga Profesional de Fútbol': 'liga-profesional-arg.svg',
  'Países Bajos|Eredivisie': 'eredivisie-ned.svg',
  'Portugal|Primeira Liga': 'primeira-liga-por.svg',
  'Turquía|Süper Lig': 'super-lig-tur.svg',
  'Bélgica|Jupiler Pro League': 'jupiler-pro-league-bel.svg',
  'Arabia Saudita|Saudi Pro League': 'saudi-pro-league.svg',
  'México|Liga MX': 'liga-mx.svg',
  'Estados Unidos|MLS': 'mls-usa.svg',
  'Austria|Bundesliga': 'bundesliga-aut.svg',
  'Ucrania|Ukrainian Premier League': 'premier-liha-ukr.svg',
  'Croacia|HNL': 'hnl-cro.png',
  'Polonia|Ekstraklasa': 'ekstraklasa-pol.png',
  'República Checa|Chance Liga': 'fortuna-liga-cze.png',
  'Eslovaquia|Niké Liga': 'fortuna-liga-svk.png',
  'Dinamarca|Superliga': 'superliga-den.svg',
  'Grecia|Super League': 'super-league-gre.svg',
  'Egipto|Premier League': 'premier-league-egy.png',
  'Japón|J1 League': 'j1-league-jpn.svg',
  'Australia|A-League': 'a-league-aus.png',
  'Colombia|Categoría Primera A': 'primera-a-col.svg',
  'Ecuador|LigaPro': 'ligapro-ecu.svg',
  'Uruguay|Primera División': 'primera-division-uru.png',
  'Perú|Liga 1': 'liga-1-per.svg',
  'Costa Rica|Primera División': 'primera-division-crc.svg',
  'Sudáfrica|Premier Soccer League': 'premier-league-rsa.png',
};
