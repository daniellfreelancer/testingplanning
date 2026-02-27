const mongoose = require('mongoose')
mongoose.set('strictQuery', true);

let dbUri;

switch (process.env.NODE_ENV) {
    case 'development':
        dbUri = process.env.MONGO_CONNECT_DEV;
        break;
    case 'test':
        dbUri = process.env.MONGO_CONNECT_TEST;
        break;
    case 'production':
        dbUri = process.env.MONGO_CONNECT_PROD;
        break;
    default:
        dbUri = process.env.MONGO_CONNECT;
}

// Fallback: si no hay variable por entorno, usar MONGO_CONNECT (p. ej. en DO con una sola variable)
if (!dbUri || typeof dbUri !== 'string') {
    dbUri = process.env.MONGO_CONNECT;
}

if (!dbUri || typeof dbUri !== 'string') {
    const varName = process.env.NODE_ENV === 'production'
        ? 'MONGO_CONNECT_PROD'
        : process.env.NODE_ENV === 'development'
            ? 'MONGO_CONNECT_DEV'
            : process.env.NODE_ENV === 'test'
                ? 'MONGO_CONNECT_TEST'
                : 'MONGO_CONNECT';
    throw new Error(
        `MongoDB URI no configurada: define la variable de entorno "${varName}" (NODE_ENV=${process.env.NODE_ENV || 'no definido'}).`
    );
}

// Opciones de conexión robustas para producción
const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 segundos para seleccionar servidor
    socketTimeoutMS: 45000, // 45 segundos para operaciones de socket
    connectTimeoutMS: 30000, // 30 segundos para establecer conexión inicial
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    heartbeatFrequencyMS: 10000,
    directConnection: false, // Permitir conexión a replica set
};

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        // Verificar si ya está conectado
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB ya está conectado');
            return mongoose.connection;
        }

        // Conectar a MongoDB
        await mongoose.connect(dbUri, connectionOptions);
        
        console.log(`✅ Conectado a MongoDB en el ambiente ${process.env.NODE_ENV || "BD-Test"}`);
        
        // Configurar eventos de conexión
        mongoose.connection.on('connected', () => {
            console.log('MongoDB conectado exitosamente');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Error en la conexión de MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB desconectado. Intentando reconectar...');
        });

        // Manejar cierre de proceso
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Conexión de MongoDB cerrada debido a terminación de la aplicación');
            process.exit(0);
        });

        return mongoose.connection;
    } catch (error) {
        console.error('❌ Error al conectar con MongoDB:', error);
        throw error;
    }
};

module.exports = { connectDB, mongoose };