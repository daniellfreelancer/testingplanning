const mongoose = require('mongoose')
mongoose.set('strictQuery', true);


// mongoose.connect(
//     process.env.MONGO_CONNECT,
//     {
//         useUnifiedTopology: true, 
//         useNewUrlParser: true
//     }
// )
// .then( () => console.log('Connected to database successfully')) 
// .catch( error => console.log(error)) 


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

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Conectado a MongoDB en el ambiente ${process.env.NODE_ENV}`))
  .catch(err => console.error('Error al conectar con MongoDB', err));