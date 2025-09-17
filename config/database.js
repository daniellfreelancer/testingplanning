const mongoose = require('mongoose')
mongoose.set('strictQuery', true);

// let dbUri;

// switch (process.env.NODE_ENV) {
//     case 'development':
//         dbUri = process.env.MONGO_CONNECT_DEV;
//         break;
//     case 'test':
//         dbUri = process.env.MONGO_CONNECT_TEST;
//         break;
//     case 'production':
//         dbUri = process.env.MONGO_CONNECT_PROD;
//         break;
//     default:
//         dbUri = process.env.MONGO_CONNECT;
// }

// mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log(`Conectado a MongoDB en el ambiente ${process.env.NODE_ENV ? process.env.NODE_ENV : "BD-Test" }`))
//   .catch(err => console.error('Error al conectar con MongoDB', err));

// Objeto para almacenar múltiples conexiones
const connections = {};

// Función para obtener cliente desde header


// Función para obtener conexión según cliente


// Función para obtener conexión por cliente específico
// const getConnectionByClient = (clientId) => {
//     if (!connections[clientId]) {
//         const dbUri = process.env[`MONGO_CONNECT_${clientId.toUpperCase()}`];
//         if (!dbUri) {
//             throw new Error(`No database configuration found for client: ${clientId}`);
//         }
        
//         connections[clientId] = mongoose.createConnection(dbUri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
        
//         console.log(`Conectado a MongoDB para cliente: ${clientId}`);
//     }
//     return connections[clientId];
// };
// Agregar manejo de eventos de conexión

const getClientFromRequest = (req) => {
    return req.get('X-Client-ID') || null;
};
const getConnection = (req) => {
    const clientId = getClientFromRequest(req);
    
    // Si no hay clientId, usar conexión por defecto
    if (!clientId) {
        return getDefaultConnection();
    }
    
    return getConnectionByClient(clientId);
};
const getConnectionByClient = (clientId) => {
    if (!connections[clientId]) {
        const dbUri = process.env[`MONGO_CONNECT_${clientId.toUpperCase()}`];
        if (!dbUri) {
            throw new Error(`No database configuration found for client: ${clientId}`);
        }
        
        const connection = mongoose.createConnection(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Limitar pool
            serverSelectionTimeoutMS: 5000,
            heartbeatFrequencyMS: 10000
        });

        // Event listeners
        connection.on('connected', () => {
            console.log(`✅ MongoDB conectado para cliente: ${clientId}`);
        });
        
        connection.on('error', (err) => {
            console.error(`❌ Error MongoDB cliente ${clientId}:`, err);
        });
        
        connection.on('disconnected', () => {
            console.log(`⚠️ MongoDB desconectado para cliente: ${clientId}`);
            delete connections[clientId]; // Limpiar conexión rota
        });

        connections[clientId] = connection;
    }
    return connections[clientId];
};

const getDefaultConnection = () => {
    if (!connections['default']) {
        const dbUri = process.env.MONGO_CONNECT;
        if (!dbUri) {
            throw new Error('No default database configuration found');
        }
        
        connections['default'] = mongoose.createConnection(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Conectado a MongoDB por defecto');
    }
    return connections['default'];
};

const databaseMiddleware = (req, res, next) => {
    try {
        req.db = getConnection(req);
        console.log('Conexión de base de datos asignada al request');
        next();
    } catch (error) {
        console.error('Error al obtener conexión de base de datos:', error);
        res.status(500).json({ 
            error: 'Error de configuración de base de datos',
            message: error.message 
        });
    }
};

const closeAllConnections = async () => {
    const promises = Object.values(connections).map(conn => conn.close());
    await Promise.all(promises);
    console.log('Todas las conexiones MongoDB cerradas');
};

// Para usar en process.exit
process.on('SIGINT', async () => {
    await closeAllConnections();
    process.exit(0);
});

module.exports = { 
    getConnection, 
    getConnectionByClient, 
    getDefaultConnection,
    databaseMiddleware,
    mongoose // Exportar mongoose para compatibilidad
};