# Administración de Jugadores

Módulo de administración de jugadores de fútbol: backend en NestJS + MongoDB, frontend en Angular con el diseño visual "Cromo" (tarjetas fotográficas, ficha de detalle con línea de tiempo de clubes y medallas de palmarés).

## Requisitos

- Node.js 20.19+ (probado con 20.20.2)
- Docker (para MongoDB)

## 1. Levantar MongoDB

```bash
docker compose up -d
```

Esto levanta MongoDB en `mongodb://localhost:27017`.

## 2. Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env
npm run seed        # carga catálogos (ligas/equipos/títulos), jugadores de ejemplo y usuarios
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
backend/    API REST (NestJS + Mongoose)
frontend/   App Angular ("Cromo")
docker-compose.yml   MongoDB local
```

Ver el detalle de endpoints, modelo de datos y decisiones de diseño en `backend/README.md` (si aplica) o en el plan del proyecto.
