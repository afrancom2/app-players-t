import type { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedDemoData } from './seed-demo-data.js';
import { syncCatalog } from './sync-catalog.js';

/**
 * Reset completo "de fábrica": borra TODO (usuarios, jugadores, catálogo) y
 * vuelve a crear el catálogo más los datos de ejemplo desde cero.
 *
 * Es destructivo a propósito — pensado para `npm run seed` manual, nunca se
 * ejecuta solo. Para mantener el catálogo al día sin perder jugadores reales,
 * usa `syncCatalog` (se ejecuta automáticamente en cada arranque del backend,
 * ver main.ts) en vez de esto.
 */
export async function runSeed(app: INestApplicationContext): Promise<void> {
  console.log('Limpiando tablas...');
  const dataSource = app.get(DataSource);
  await dataSource.query(
    'TRUNCATE TABLE player_palmares, player_trayectoria, players, users, teams, leagues, titles RESTART IDENTITY CASCADE',
  );

  await syncCatalog(app);
  await seedDemoData(app);

  console.log('Reset completo.');
}
