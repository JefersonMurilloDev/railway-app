import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Conectar a la base de datos en memoria antes de todos los tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// NO limpiamos entre tests para permitir tests que requieren persistencia
// Cada test usa emails únicos para evitar conflictos

// Desconectar y detener el servidor después de todos los tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
