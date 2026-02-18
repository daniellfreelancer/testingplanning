const UsuariosComplejos = require('../api/usuarios-complejos/usuariosComplejos');
const mongoose = require('mongoose');

const metricasPiscinaController = {
  getmetricacomuna: async (req, res) => {
    try {
      const institutionId = '6877f7f9c1f4bd360cce0496';

      // Validar que el ID de institución sea válido
      if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({
          message: 'ID de institución inválido',
          success: false,
        });
      }

      const institutionObjectId = new mongoose.Types.ObjectId(institutionId);

      // Agregación para contar usuarios por comuna
      // Como institucion es un array, usamos $in para buscar si el ObjectId está en el array
      const metricasPorComuna = await UsuariosComplejos.aggregate([
        {
          $match: {
            institucion: { $in: [institutionObjectId] }
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: {
                  $or: [
                    { $eq: [{ $ifNull: ['$comuna', null] }, null] },
                    { $eq: ['$comuna', ''] },
                    { $eq: ['$comuna', '*'] }
                  ]
                },
                then: 'Sin comuna registrada',
                else: '$comuna'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            comuna: '$_id',
            cantidad: '$count'
          }
        },
        {
          $sort: { cantidad: -1 }
        }
      ]);

      res.status(200).json({
        message: 'Métricas por comuna obtenidas exitosamente',
        success: true,
        data: metricasPorComuna,
        total: metricasPorComuna.reduce((sum, item) => sum + item.cantidad, 0)
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
  beneficioAplicado: async (req, res) => {
    try {
      const institutionId = '6877f7f9c1f4bd360cce0496';

      // Validar que el ID de institución sea válido
      if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({
          message: 'ID de institución inválido',
          success: false,
        });
      }

      const institutionObjectId = new mongoose.Types.ObjectId(institutionId);

      // Contar usuarios con beneficioPiscina aplicado (true)
      const cantidadBeneficioAplicado = await UsuariosComplejos.countDocuments({
        institucion: { $in: [institutionObjectId] },
        beneficioPiscina: true
      });

      res.status(200).json({
        message: 'Cantidad de beneficios aplicados obtenida exitosamente',
        success: true,
        cantidad: cantidadBeneficioAplicado
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
  rangoEtario: async (req, res) => {
    try {
      const institutionId = '6877f7f9c1f4bd360cce0496';

      // Validar que el ID de institución sea válido
      if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        return res.status(400).json({
          message: 'ID de institución inválido',
          success: false,
        });
      }

      const institutionObjectId = new mongoose.Types.ObjectId(institutionId);
      const fechaActual = new Date();

      // Agregación para calcular edad y agrupar por edad individual
      const edadesIndividuales = await UsuariosComplejos.aggregate([
        {
          $match: {
            institucion: { $in: [institutionObjectId] },
            fechaNacimiento: { $exists: true, $ne: null }
          }
        },
        {
          $addFields: {
            edad: {
              $floor: {
                $divide: [
                  {
                    $subtract: [
                      fechaActual,
                      '$fechaNacimiento'
                    ]
                  },
                  365.25 * 24 * 60 * 60 * 1000 // milisegundos en un año
                ]
              }
            }
          }
        },
        {
          $match: {
            edad: { $gte: 0 } // Filtrar edades válidas (mayores o iguales a 0)
          }
        },
        {
          $group: {
            _id: '$edad',
            cantidad: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            edad: '$_id',
            cantidad: 1
          }
        },
        {
          $sort: {
            edad: 1 // Ordenar por edad ascendente
          }
        }
      ]);

      // Contar usuarios sin fecha de nacimiento
      const sinFechaNacimiento = await UsuariosComplejos.countDocuments({
        institucion: { $in: [institutionObjectId] },
        $or: [
          { fechaNacimiento: { $exists: false } },
          { fechaNacimiento: null }
        ]
      });

      // Agregar el conteo de sin fecha si hay registros
      if (sinFechaNacimiento > 0) {
        edadesIndividuales.push({
          edad: 'Sin fecha de nacimiento',
          cantidad: sinFechaNacimiento
        });
      }

      const total = edadesIndividuales.reduce((sum, item) => sum + item.cantidad, 0);

      res.status(200).json({
        message: 'Edades individuales obtenidas exitosamente',
        success: true,
        data: edadesIndividuales,
        total: total
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
};

module.exports = metricasPiscinaController;
