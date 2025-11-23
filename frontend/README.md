# Frontend (React + Vite)

Pequeña app React para el login contra `POST /api/auth/login` del backend.

Instrucciones:

1. Instalar dependencias

```powershell
cd frontend
npm install
```

2. Variables de entorno (opcional)

Crear un archivo `.env` en la carpeta `frontend` con la URL de la API si no es `http://localhost:3000`:

```
VITE_API_URL=http://localhost:3000
```

3. Ejecutar en modo desarrollo

```powershell
npm run dev
```

La app muestra un formulario de login que guarda el `token` en `localStorage` al autenticarse correctamente.
