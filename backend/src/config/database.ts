import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        // Prioridad: MONGODB_URI (Railway) > MONGO_URL + MONGO_DB_NAME (local)
        const mongoUri = buildMongoUri();

        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

const buildMongoUri = (): string => {
    if (process.env.MONGODB_URI) {
        return process.env.MONGODB_URI;
    }

    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB_NAME || 'taskmanager';
    return `${mongoUrl}/${dbName}`;
};

export default connectDB;
