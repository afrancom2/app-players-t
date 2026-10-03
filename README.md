# EJECUTAR THOMAS

- Abrir programa Docker Desktop en el escritorio (Ballena azul)
- Esperar que el programa cargue
- Abrir carpeta en el escritorio app-players-t
- En la barra de navegación borrar la url y escribir el siguiente comando:
```bash
cmd
```
dar enter
- despues ejecutar el siguiente comando en la ventana negra
```bash
docker compose up -d --build
```
dar enter
Abrir página de jugadores
```bash
localhost:4200
```

# Ejecutar cuando hayan cambios en el codigo
Desde la ventana de CMD, parado en la carpeta del proyecto, ejecutar en orden:
```bash
git pull
```
```bash
docker compose up -d --build
```

Esto reconstruye lo que haya cambiado y reinicia los contenedores. **Tus jugadores no se pierden**: cada vez que el backend arranca, actualiza solo el catálogo (ligas, equipos, títulos) si hay algo nuevo en el código, pero nunca toca jugadores ni usuarios ya cargados.

# Administración de Jugadores

Módulo de administración de jugadores de fútbol: backend en NestJS + PostgreSQL (TypeORM), frontend en Angular con el diseño visual "Cromo" (tarjetas fotográficas, ficha de detalle con línea de tiempo de clubes y medallas de palmarés).

Proyecto de uso **100% local**: no se despliega en la nube. Todo corre en tu máquina vía Docker.

## Requisitos

- Docker Desktop (o Docker Engine + Compose)
- Node.js 20.19+ (solo si quieres correr backend/frontend fuera de Docker para desarrollar con hot-reload)

## Uso rápido (todo con Docker)

```bash
docker compose up -d --build
```

Esto levanta, en orden, los tres servicios y un respaldo automático:

1. **postgres** — base de datos, con los datos guardados en el volumen `postgres-data` (persisten entre reinicios).
2. **backend** — espera a que Postgres esté sano. Cada vez que arranca:
   - sincroniza el catálogo (ligas, equipos, títulos) con lo que haya en el código — crea lo nuevo, actualiza lo existente, y limpia lo que ya no se usa. Esto **nunca toca jugadores ni usuarios**, así que una actualización de código jamás borra datos reales.
   - si la base está **vacía** (primera vez), además crea los usuarios de prueba y 4 jugadores de ejemplo. Si ya tiene datos, no los crea de nuevo.

   Queda escuchando en `http://localhost:3000`.
3. **frontend** — se sirve en `http://localhost:4200`.
4. **postgres-backup** — hace un respaldo (`pg_dump`) apenas arranca y luego uno diario, guardándolos comprimidos en la carpeta `./backups` de este repo (no se sube a git).

Para ver los logs en vivo: `docker compose logs -f`. Para apagar todo sin perder datos: `docker compose down`. Para apagar y **borrar también los datos** (usar con cuidado): `docker compose down -v`.

### Resetear todo a los datos de fábrica

Si alguna vez quieres borrar **todo** (jugadores reales incluidos) y volver a empezar con solo el catálogo y los datos de ejemplo:

```bash
docker compose exec -T backend node dist/seed/seed.js
```

⚠️ Esto es destructivo e irreversible (salvo restaurando un respaldo) — nunca se ejecuta solo, hay que correrlo a mano a propósito.

### Restaurar un respaldo

Si algo corrompe o borra la base (por ejemplo, un `down -v` sin querer), puedes restaurar el último `.sql.gz` de `./backups`:

```bash
gunzip -c backups/<archivo>.sql.gz | docker compose exec -T postgres psql -U postgres -d jugadores
```

### Usuarios de prueba (creados por el seed)

| Email                  | Contraseña   | Rol       |
|-------------------------|--------------|-----------|
| admin@jugadores.app     | admin1234    | admin     |
| consulta@jugadores.app  | consulta1234 | consulta  |

`admin` puede crear, editar y eliminar jugadores. `consulta` solo puede ver.

## Desarrollo (con hot-reload, sin reconstruir contenedores)

Para tocar código y ver los cambios al instante, corre solo Postgres en Docker y backend/frontend directo con Node:

```bash
docker compose up -d postgres
```

```bash
cd backend
npm install
cp .env.example .env
npm run seed        # solo la primera vez, o cuando quieras resetear los datos de ejemplo
npm run start:dev   # http://localhost:3000
```

```bash
cd frontend
npm install
npm start   # http://localhost:4200
```

## Estructura

```
backend/    API REST (NestJS + TypeORM + PostgreSQL)
frontend/   App Angular ("Cromo")
docker-compose.yml   Orquesta postgres + backend + frontend + respaldos, todo local
backups/    Respaldos automáticos de la base de datos (generado, no se sube a git)
```
