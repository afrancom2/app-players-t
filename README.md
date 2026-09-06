# Administración de Jugadores

Módulo de administración de jugadores de fútbol: backend en NestJS + PostgreSQL (TypeORM), frontend en Angular con el diseño visual "Cromo" (tarjetas fotográficas, ficha de detalle con línea de tiempo de clubes y medallas de palmarés).

## Requisitos

- Node.js 20.19+ (probado con 20.20.2)
- Docker (para PostgreSQL)

## 1. Levantar PostgreSQL

```bash
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` (usuario/clave `postgres`/`postgres`, base `jugadores`).

## 2. Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env
npm run seed        # crea las tablas (TypeORM synchronize) y carga catálogos, jugadores y usuarios de ejemplo
npm run start:dev   # http://localhost:3000
```

### Usuarios de prueba (creados por el seed)

| Email                  | Contraseña   | Rol       |
|-------------------------|--------------|-----------|
| admin@jugadores.app     | admin1234    | admin     |
| consulta@jugadores.app  | consulta1234 | consulta  |

`admin` puede crear, editar y eliminar jugadores. `consulta` solo puede ver.

## 3. Frontend (Angular)

```bash
cd frontend
npm install
npm start   # http://localhost:4200
```

## Estructura

```
backend/    API REST (NestJS + TypeORM + PostgreSQL)
frontend/   App Angular ("Cromo")
docker-compose.yml   PostgreSQL local
```

## Despliegue

Ver la guía de despliegue (backend en Docker/Render, frontend en GitHub Pages) más abajo en el historial del proyecto, o pide que se vuelva a generar.

Ver el detalle de endpoints, modelo de datos y decisiones de diseño en `backend/README.md` (si aplica) o en el plan del proyecto.
