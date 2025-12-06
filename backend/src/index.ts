import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import taskRoutes from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Construir URI de MongoDB
// Prioridad: MONGODB_URI (Railway) > MONGO_URL + MONGO_DB_NAME (local con auth)
const buildMongoUri = (): string => {
    if (process.env.MONGODB_URI) {
        return process.env.MONGODB_URI;
    }

    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB_NAME || 'taskmanager';
    return `${mongoUrl}/${dbName}`;
};

const MONGODB_URI = buildMongoUri();

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas
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

// Conexión a MongoDB e inicio del servidor
async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
}

startServer();
