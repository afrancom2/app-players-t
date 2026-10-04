import { DataSource } from 'typeorm';
import { Posicion } from '../players/enums/posicion.enum.js';

/**
 * Migraciones de datos que deben correr ANTES de `synchronize`.
 *
 * `synchronize` sabe cambiar el esquema, pero no convertir datos: si un enum
 * nativo de Postgres cambia sus valores y hay filas con un valor viejo, el
 * ALTER falla y el backend no arranca (ni el seed, que usa el mismo módulo).
 * Aquí se dejan los datos y el tipo exactamente como los espera la entidad,
 * de modo que `synchronize` ya no tenga nada que cambiar. Cada migración es
 * idempotente: detecta si hace falta y, si no, no hace nada.
 */
export async function runPreSyncMigrations(databaseUrl: string | undefined): Promise<void> {
  if (!databaseUrl) return;

  const dataSource = new DataSource({ type: 'postgres', url: databaseUrl, synchronize: false });
  try {
    await dataSource.initialize();
  } catch {
    // Si la base aún no acepta conexiones, TypeORM lo reintentará al arrancar;
    // la migración se aplicará en el siguiente arranque que sí conecte.
    return;
  }

  try {
    await migratePosicionesGenericas(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

/**
 * Las 4 posiciones genéricas pasaron a 11 específicas (commit c82b214). Se
 * usa la misma correspondencia que se aplicó a mano en su momento.
 */
const POSICION_ANTERIOR: Record<string, Posicion> = {
  Portero: Posicion.PORTERO,
  Defensa: Posicion.DEFENSA_CENTRAL,
  Mediocampista: Posicion.MEDIO_CENTRO_DEFENSIVO,
  Delantero: Posicion.DELANTERO_CENTRO,
};

async function migratePosicionesGenericas(dataSource: DataSource): Promise<void> {
  const labels: { enumlabel: string }[] = await dataSource.query(
    `SELECT e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
     WHERE t.typname = 'players_posicion_enum'`,
  );
  const tieneValoresViejos = labels.some((row) => row.enumlabel in POSICION_ANTERIOR);
  if (!tieneValoresViejos) return;

  const nuevos = Object.values(Posicion)
    .map((value) => `'${value}'`)
    .join(', ');
  const casos = Object.entries(POSICION_ANTERIOR)
    .map(([viejo, nuevo]) => `WHEN '${viejo}' THEN '${nuevo}'`)
    .join(' ');

  console.log('Migrando posiciones de jugadores al nuevo formato (POR, DFC, MCD, DC…)...');
  await dataSource.transaction(async (manager) => {
    await manager.query(`ALTER TYPE players_posicion_enum RENAME TO players_posicion_enum_old`);
    await manager.query(`CREATE TYPE players_posicion_enum AS ENUM (${nuevos})`);
    await manager.query(
      `ALTER TABLE players ALTER COLUMN posicion TYPE players_posicion_enum
       USING (CASE posicion::text ${casos} ELSE posicion::text END)::players_posicion_enum`,
    );
    await manager.query(`DROP TYPE players_posicion_enum_old`);
  });
}
