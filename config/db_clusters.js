const mongoose = require('mongoose')
mongoose.set('strictQuery', true);

// Objeto para almacenar múltiples conexiones
const connections = {};

// Función para obtener cliente desde header
const getClientFromRequest = (req) => {
    return req.get('X-Client-ID') || null;
};

// Función para obtener conexión según cliente
const getConnection = (req) => {
    const clientId = getClientFromRequest(req);
    
    // Si no hay clientId, usar conexión por defecto
    if (!clientId) {
        return getDefaultConnection();
    }
    
    return getConnectionByClient(clientId);
};

// Función para obtener conexión por cliente específico
const getConnectionByClient = (clientId) => {
    if (!connections[clientId]) {
        const dbUri = process.env[`MONGO_CONNECT_${clientId.toUpperCase()}`];
        if (!dbUri) {
            throw new Error(`No database configuration found for client: ${clientId}`);
        }
        
        connections[clientId] = mongoose.createConnection(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`Conectado a MongoDB para cliente: ${clientId}`);
    }
    return connections[clientId];
};

// Función para obtener conexión por defecto
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

// Middleware para inyectar conexión en request
const databaseMiddleware = (req, res, next) => {
    try {
        req.db = getConnection(req);
        next();
    } catch (error) {
        console.error('Error al obtener conexión de base de datos:', error);
        res.status(500).json({ 
            error: 'Error de configuración de base de datos',
            message: error.message 
        });
    }
};

module.exports = { 
    getConnection, 
    getConnectionByClient, 
    getDefaultConnection,
    databaseMiddleware,
    mongoose // Exportar mongoose para compatibilidad
};


// Con Middleware (Recomendado):
// const { databaseMiddleware } = require('../config/database');
// // Aplicar middleware a las rutas
// router.use(databaseMiddleware);
// // En el controlador
// const getUsers = async (req, res) => {
//     try {
//         const User = req.db.model('User', userSchema);
//         const users = await User.find();
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// Sin Middleware (Manual):
// const { getConnection } = require('../config/database');

// const getUsers = async (req, res) => {
//     try {
//         const db = getConnection(req);
//         const User = db.model('User', userSchema);
//         const users = await User.find();
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// # Sin header - usa MONGO_CONNECT
// curl -X GET http://localhost:3000/api/users

// # Con header - usa MONGO_CONNECT_CLIENTA
// curl -X GET http://localhost:3000/api/users \
//   -H "X-Client-ID: clienta"