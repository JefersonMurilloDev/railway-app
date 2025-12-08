import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Config & Utils
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Routes
import taskRoutes from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(generalLimiter); // Rate limiting global

// Rutas API
app.use('/api/tasks', taskRoutes);

// Health check para Railway
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta raíz
app.get('/', (_req, res) => {
    res.json({
        message: 'Task Manager API 🚀',
        version: '1.0.0',
        endpoints: {
            tasks: '/api/tasks',
            health: '/health'
        }
    });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer();
