require('dotenv').config();
const mongoose = require('mongoose');
require('./config/database'); // inicia conexión
// const UsuariosComplejos = require('./api/usuarios-complejos/usuariosComplejosController');
const UsuariosComplejos = require('./api/usuarios-complejos/usuariosComplejos');

const { Types } = mongoose;

const INSTITUCION_ID = process.env.INSTITUCION_ID || '6894b617b8ee970213941971';

// Datos originales (tal como los tienes hoy)
const rawDocs = [
  { nombre: "juan ignacio", apellido: "fajardo", rut: "261231230", email: "juanignacio@gmail.com", rol: "USER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "Jose", lastName: "Moncada", rut: "559863314", email: "moncada@gmail.com", rol: "USER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "Raul", lastName: "Molina", rut: "256325412k", email: "molinaR@gmail.com", phone: "996633225", age: 8, weight: 20, size: 105, classroom: [], school: [], gender: "male" },
  { name: "bill", lastName: "clinton", rut: "125368950", email: "clinton@gmail.com", rol: "USER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "emiliano", lastName: "ferreira", rut: "15797946", email: "ferreriaE@gmail.com", rol: "USER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "dorada", lastName: "salazar", rut: "11326826k", email: "salazarD@gmail.com", rol: "USER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "paula", lastName: "barreiro", rut: "940442401", email: "barreiropau@gmail.com", rol: "USER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "itziar", lastName: "cuevas", rut: "87452119r", email: "cuevasitziar@gmail.com", rol: "USER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "tatiana", lastName: "solis", rut: "29901792k", email: "solistatiana@gmail.com", rol: "TRAINER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "luisa", lastName: "vera", rut: "745543679", email: "veraluisa@gmail.com", rol: "TRAINER", from: "vmForm", institucionId: INSTITUCION_ID },
  { name: "candelaria", lastName: "benito", rut: "690275478", email: "benitocande@gmail.com", rol: "TRAINER", from: "vmForm", institucionId: INSTITUCION_ID },
];

function normalize(doc) {
  const normalized = {
    nombre: doc.nombre ?? doc.name,
    apellido: doc.apellido ?? doc.lastName,
    email: doc.email,
    rut: doc.rut,
    rol: doc.rol,
    telefono: doc.telefono ?? doc.phone,
    sexo: doc.sexo ?? doc.gender,
  };

  // Relación de institución
  const instId = doc.institucion?.[0] || doc.institucionId || INSTITUCION_ID;
  if (instId) {
    try {
      normalized.institucion = [new Types.ObjectId(String(instId))];
    } catch {
      console.warn('InstitucionId inválido, se omite para:', doc.email || doc.rut);
    }
  }

  // Limpia claves undefined
  Object.keys(normalized).forEach(k => normalized[k] === undefined && delete normalized[k]);

  return normalized;
}

(async () => {
  try {
    const docs = rawDocs.map(normalize);

    // Upsert por RUT (cámbialo a email si prefieres)
    const ops = docs
      .filter(d => d.rut || d.email)
      .map(d => ({
        updateOne: {
          filter: d.rut ? { rut: d.rut } : { email: d.email },
          update: { $setOnInsert: d },
          upsert: true,
        }
      }));

    const result = await UsuariosComplejos.bulkWrite(ops, { ordered: false });
    console.log('Populate usuariosComplejos OK:', result.result || result);
  } catch (err) {
    console.error('Error en populate usuariosComplejos:', err);
  } finally {
    await mongoose.connection.close();
  }
})();