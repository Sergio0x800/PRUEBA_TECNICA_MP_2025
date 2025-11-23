# PRUEBA_TECNICA_MP_2025

Proyecto demostrativo (backend + frontend) para la prueba técnica. Contiene:

- Backend: Node.js + TypeScript + Express, Microsoft SQL Server (T-SQL) como BD.
- Frontend: React + Vite + TypeScript
- Orquestación: Docker + docker-compose para demo/local.

**Resumen rápido**

- API principal expone recursos: `expedientes`, `indicios`, `usuarios`, `expediente-estados`, `catalogs`, `reports`.
- Autenticación basada en JWT (ruta: `/api/auth/login`).
- Control de acceso por roles centralizado en middleware (`backend/src/middlewares/roles.middleware.ts`).
- Reglas de negocio (ownership, transiciones de estado) se aplican dentro de los controladores/servicios.

**Contenido del repositorio**

- `backend/` — servidor Express + TypeScript
  - `src/config/db.ts` — conexión a MSSQL (incluye reintentos)
  - `src/middlewares/roles.middleware.ts` — `permit` / `deny` para rutas
  - `src/middlewares/error.middleware.ts` — manejador central de errores
  - `src/controllers/` — controladores por recurso
  - `src/services/` — lógica de acceso a BD y SPs
- `frontend/` — app React (Vite)
  - `src/services/` — llamadas al backend (usa `import.meta.env.VITE_API_URL`)
- `init/` (o `init/init.sql`) — script de creación/seed y stored procedures para MSSQL
- `docker-compose.yml`, `Dockerfile` para backend/frontend y `db-init` helper

Stack y versiones recomendadas

- Node.js: 18.x
- npm: 8+ (la que acompaña Node 18)
- TypeScript: >=4.x
- Vite: 4.x (o la versión incluida en `frontend/package.json`)
- React: 18.x
- SQL Server: 2019/2017 compatible (imagen `mcr.microsoft.com/mssql/server` en `docker-compose`)
- Docker: 20+ y Docker Compose v2 (compatible con `docker compose` / `docker-compose`)

Instalación local (sin Docker)

1. Backend

```powershell
cd backend
npm install
npm run build        # si quieres compilar TS
npm run dev          # o el script que tengas para desarrollo (ts-node/ts-node-dev)
```

2. Frontend

```powershell
cd frontend
npm install
npm run dev          # inicia Vite en modo desarrollo
```

Variables de entorno (frontend)

- Usamos Vite env vars: todas deben comenzar con `VITE_`.
- Ejemplos:
  - `frontend/.env.development` -> `VITE_API_URL=http://localhost:3000`
  - `frontend/.env.production` -> `VITE_API_URL=http://backend:3000` (o la URL real del backend en producción)
- En el código frontend se lee con: `const API_URL = import.meta.env.VITE_API_URL` (hay fallback implementado).

Ejecución con Docker (recomendado para demo)

1. Build & up (usa `docker-compose.yml`) — desde la raíz del repo:

```powershell
docker-compose build --no-cache
docker-compose up
```

2. Notas importantes para Docker

- El contenedor de SQL Server tarda en inicializarse (aplica upgrades internos). Hay un container `db-init` que espera y ejecuta `init.sql`. Si el `db-init` falla inicialmente revisa los logs y vuelve a ejecutar `docker-compose up`.
- El frontend es una SPA estática construida por Vite y servida por nginx en la imagen. Para inyectar la URL del backend en la build puedes pasar el build-arg `VITE_API_URL` (ya soportado en el `frontend/Dockerfile`):

```powershell
docker build --build-arg VITE_API_URL=http://backend:3000 -t prueba_frontend ./frontend
```

o en `docker-compose.yml` dentro del servicio `frontend` (ejemplo):

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: "http://backend:3000"
```

Comandos útiles

- Backend tests:

```powershell
cd backend
npm test
```

- Backend dev (Windows PowerShell):

```powershell
cd backend; npm install; npm run dev
```

- Frontend dev:

```powershell
cd frontend; npm install; npm run dev
```

Enrutado y autorización (cómo está organizado)

- Rutas privadas por módulo: `backend/src/routes/private/` tiene sub-routers por módulo:
  - `expedientes.routes.ts`, `indicios.routes.ts`, `usuarios.routes.ts`, `expediente-estados.routes.ts`, `catalogs.routes.ts`, `reports.routes.ts`.
- Control de acceso: usar `roles.middleware` en las rutas (ej: `rolesMiddleware.permit('coordinador')` o `rolesMiddleware.deny('coordinador')`). Las reglas finales por endpoint están aplicadas en estos archivos.
- Lógica de negocio dependiente del recurso (ownership, valid state transitions) se aplica dentro de los controladores/servicios.

Endpoints principales (resumen)

- POST `/api/auth/login` — obtiene token JWT
- Expedientes
  - GET `/api/expedientes` — listar (normalmente coordinador)
  - GET `/api/expedientes/:id` — obtener
  - GET `/api/expedientes/por-usuario/:id` — listar por usuario
  - POST `/api/expedientes` — crear
  - PUT `/api/expedientes/:id` — actualizar
  - DELETE `/api/expedientes/:id` — eliminar (soft)
- Indicios
  - POST `/api/indicios` — crear
  - GET `/api/indicios/:id` — obtener
  - GET `/api/indicios/por-expediente/:id` — listar
  - PUT `/api/indicios/:id` — actualizar
  - DELETE `/api/indicios/:id` — eliminar
- Expediente Estados
  - POST `/api/expediente-estados` — crear transición (técnico/coordinador rules)
  - PUT/DELETE `/api/expediente-estados/:id` — editar/eliminar (normalmente coordinador)
- Catalogs
  - GET `/api/catalogs/estados` `/departamentos` `/municipios` `/tipos-indicio`
- Reports
  - GET `/api/reports/summary` — resumen por estados
  - GET `/api/reports/timeseries` — series de tiempo

Testing

- Unit tests (backend) con Jest + ts-jest. Ejecutar `npm test` desde `backend`.

Buenas prácticas y notas finales

- No poner secretos en el repo ni en `.env` versionado. Usar `.env.local` o variables CI/CD para producción.
- Vite inyecta `import.meta.env.VITE_...` en build time — si necesitas cambiar API URL sin rebuild, agrega un archivo de runtime config servido por nginx o un entrypoint que reemplace variables en `index.html`.
- Si vas a presentar en entorno con recursos limitados, incrementa timeouts/retries en `backend/src/config/db.ts` y en `db-init` para tolerar arranques lentos de SQL Server.

Contacto / Autor

- Autor de esta entrega: Sergio (repositorio local)
