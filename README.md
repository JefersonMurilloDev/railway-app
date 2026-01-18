# Task Manager API 🚀

API REST para gestión de tareas construida con Express, TypeScript y MongoDB. Desplegada en Railway.

## 🌐 URLs

| Entorno | URL |
|---------|-----|
| **Producción** | https://cheerful-respect-production.up.railway.app/ |
| **Local** | http://localhost:3000 |

## Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express
- **Lenguaje:** TypeScript
- **Base de datos:** MongoDB
- **Despliegue:** Railway

## Desarrollo Local

### Requisitos
- Node.js 18+
- Docker Desktop

### Configuración

1. **Clonar e instalar**
```bash
git clone https://github.com/JefersonMurilloDev/railway-app.git
cd railway-app
```

2. **Configurar variables de entorno**

Crear `.env` en la raíz:
```env
MONGO_USER=tu_usuario
MONGO_PASS=tu_password
MONGO_DB_NAME=taskmanager
```

Crear `backend/.env`:
```env
PORT=3000
MONGO_URL=mongodb://tu_usuario:tu_password@localhost:27017
MONGO_DB_NAME=taskmanager?authSource=admin
NODE_ENV=development
```

3. **Levantar MongoDB con Docker**
```bash
docker-compose up -d
```

4. **Iniciar el servidor**
```bash
cd backend
npm install
npm run dev
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tasks` | Listar todas las tareas |
| GET | `/api/tasks/:id` | Obtener una tarea |
| POST | `/api/tasks` | Crear nueva tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| PATCH | `/api/tasks/:id/toggle` | Alternar completado |
| GET | `/health` | Health check |

## Ejemplo de Task

```json
{
  "title": "Mi tarea",
  "description": "Descripción opcional",
  "priority": "high",
  "completed": false
}
```

**Prioridades válidas:** `low`, `medium`, `high`

## Despliegue

Cada push a `main` despliega automáticamente en Railway:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |

## Licencia

MIT
