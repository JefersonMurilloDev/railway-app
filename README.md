# Task Manager API 🚀

API REST para gestión de tareas construida con Express, TypeScript y MongoDB.

## Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express
- **Lenguaje**: TypeScript
- **Base de datos**: MongoDB
- **Despliegue**: Railway

## Desarrollo Local

### Requisitos
- Node.js 18+
- Docker (para MongoDB)

### Configuración

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd railway-app
```

2. **Iniciar MongoDB con Docker**
```bash
docker-compose up -d
```

3. **Instalar dependencias e iniciar el backend**
```bash
cd backend
npm install
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints de la API

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
  "title": "Mi primera tarea",
  "description": "Descripción opcional",
  "priority": "high",
  "completed": false
}
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3000 |
| `MONGODB_URI` | URI de conexión a MongoDB | mongodb://localhost:27017/taskmanager |

## Despliegue en Railway

1. Conecta tu repositorio de GitHub a Railway
2. Agrega el plugin de MongoDB
3. Railway detectará automáticamente la configuración y desplegará
