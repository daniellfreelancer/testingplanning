// scripts/migrateToCloudFront.js
/**
 * Script para migrar URLs de S3 directo a CloudFront
 * y reorganizar archivos en carpetas estructuradas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { convertToCloudFrontUrl, extractKeyFromUrl } = require('../utils/s3CloudFront');

// Importar todos los modelos que usan imágenes
const Noticia = require('../models/noticia');
const Evento = require('../models/evento');
const Album = require('../models/album');
const Video = require('../models/video');
// Agregar más modelos según necesites

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vitalmove';

/**
 * Conectar a MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Migrar URLs de un modelo
 */
async function migrateModel(Model, fields, folderName) {
  try {
    console.log(`\n📋 Migrando modelo: ${Model.modelName}`);

    const documents = await Model.find({});
    console.log(`   Documentos encontrados: ${documents.length}`);

    let migrated = 0;
    let errors = 0;

    for (const doc of documents) {
      try {
        let hasChanges = false;

        // Migrar cada campo especificado
        for (const field of fields) {
          if (field.includes('[].')) {
            // Campo de array (ej: "imagenes[].url")
            const [arrayField, subField] = field.split('[].');

            if (doc[arrayField] && Array.isArray(doc[arrayField])) {
              doc[arrayField].forEach(item => {
                if (item[subField] && !item[subField].includes('cloudfront.net')) {
                  item[subField] = convertToCloudFrontUrl(item[subField]);
                  hasChanges = true;
                }
              });
            }
          } else {
            // Campo simple
            if (doc[field] && !doc[field].includes('cloudfront.net')) {
              doc[field] = convertToCloudFrontUrl(doc[field]);
              hasChanges = true;
            }
          }
        }

        if (hasChanges) {
          await doc.save();
          migrated++;
        }
      } catch (error) {
        console.error(`   ❌ Error en documento ${doc._id}:`, error.message);
        errors++;
      }
    }

    console.log(`   ✅ Migrados: ${migrated}`);
    console.log(`   ❌ Errores: ${errors}`);
  } catch (error) {
    console.error(`❌ Error migrando modelo ${Model.modelName}:`, error);
  }
}

/**
 * Función principal de migración
 */
async function migrate() {
  console.log('🚀 Iniciando migración a CloudFront...\n');

  await connectDB();

  // Configuración de migración por modelo
  const migrations = [
    {
      model: Noticia,
      fields: ['imagenDestacada', 'imagenes[]'],
      folder: 'noticias',
    },
    {
      model: Evento,
      fields: ['imagen'],
      folder: 'eventos',
    },
    {
      model: Album,
      fields: ['imagenPortada', 'imagenes[].url'],
      folder: 'galeria',
    },
    {
      model: Video,
      fields: ['thumbnail'],
      folder: 'videos',
    },
    // Agregar más modelos aquí
  ];

  // Ejecutar migraciones
  for (const config of migrations) {
    await migrateModel(config.model, config.fields, config.folder);
  }

  console.log('\n✅ Migración completada');
  await mongoose.connection.close();
  process.exit(0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  migrate().catch(error => {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  });
}

module.exports = { migrate };
