# TaskFlow - Full Stack Application 🚀

Aplicación completa para gestión de tareas y finanzas personales. Construida con un stack moderno y escalable.

## 🌟 Características Principales

- **Gestión de Tareas:** Crear, editar, organizar y completar tareas con prioridades.
- **Finanzas Personales:** Registro de cuentas y transacciones (gastos) con soporte para múltiples monedas (USD, COP, EUR).
- **Diseño Responsive:** Interfaz moderna y adaptativa optimizada para móviles y escritorio.
- **Modo Oscuro:** Estética premium "Dark Glassmorphism".

## 🌐 URLs

| Entorno | URL |
|---------|-----|
| **Producción** | https://cheerful-respect-production.up.railway.app/ |
| **Local** | http://localhost:5173 (Frontend) |

## 🛠 Stack Tecnológico

### Frontend
- **Framework:** Vue 3 (Composition API)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express
- **Lenguaje:** TypeScript
- **Base de datos:** MongoDB
- **Despliegue:** Railway

## � Instalación y Uso

Sigue estos pasos para clonar y ejecutar el proyecto localmente.

### Prerrequisitos
- Node.js 18+
- Docker (Opcional, si quieres ejecutar la base de datos localmente)

### 1. Clonar el repositorio
```bash
git clone https://github.com/JefersonMurilloDev/railway-app.git
cd railway-app
```

### 2. Configuración Backend
```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:
```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/taskmanager  # O tu URL de MongoDB Atlas
```

Para iniciar el servidor:
```bash
npm run dev
```

### 3. Configuración Frontend
Abre una nueva terminal en la raíz del proyecto y ve a la carpeta del frontend:
```bash
cd frontend
npm install
```

Para iniciar la aplicación:
```bash
npm run dev
```

¡Listo! La aplicación debería estar corriendo en `http://localhost:5173`.

## �👨‍💻 Autor

Desarrollado con ❤️ por **Jeferson Murillo**.

- **GitHub:** [@JefersonMurilloDev](https://github.com/JefersonMurilloDev)
- **Contacto:** [murillopalacioj@gmail.com](mailto:murillopalacioj@gmail.com)

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**.
Esto significa que es **software libre** y cualquiera puede utilizarlo, modificarlo y distribuirlo, siempre y cuando se reconozca la autoría original de **Jeferson Murillo**.

Consultar el archivo `LICENSE` para más detalles.
