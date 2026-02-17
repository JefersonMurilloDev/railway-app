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
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import expenseRoutes from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Confiar en el proxy de Railway para obtener IP real del cliente
// Necesario para que express-rate-limit funcione correctamente
app.set('trust proxy', 1);

// Configuración de CORS - orígenes permitidos
const allowedOrigins = [
    'https://cheerful-respect-production.up.railway.app',
    'http://localhost:5173', // Desarrollo frontend
    'http://localhost:3000'  // Desarrollo local
];

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (Postman, apps móviles, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(generalLimiter); // Rate limiting global

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/expenses', expenseRoutes);

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
