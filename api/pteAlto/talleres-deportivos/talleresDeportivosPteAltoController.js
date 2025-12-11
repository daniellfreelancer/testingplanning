const TalleresDeportivos = require('./talleresDeportivosPteAlto');
const EspaciosDeportivos = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const ReservasPteAlto = require('../reservas-pte-alto/reservasPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client'); // helper centralizado
const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

/**
 * Crea reservas internas para bloquear el espacio deportivo en los días y horarios del taller
 * @param {Object} taller - El taller creado
 * @param {String} adminId - ID del admin que crea el taller
 */
const crearReservasInternasTaller = async (taller, adminId) => {
  try {
    console.log('🔵 === INICIANDO CREACIÓN DE RESERVAS INTERNAS ===');
    console.log('🔵 Taller completo:', JSON.stringify(taller, null, 2));
    console.log('🔵 AdminId:', adminId);

    if (!taller.espacioDeportivo || !taller.fechaInicio || !taller.fechaFin || !taller.dias || !taller.horaInicio || !taller.horaFin) {
      console.log('⚠️ Taller sin datos suficientes para crear reservas internas');
      console.log('⚠️ espacioDeportivo:', taller.espacioDeportivo);
      console.log('⚠️ fechaInicio:', taller.fechaInicio);
      console.log('⚠️ fechaFin:', taller.fechaFin);
      console.log('⚠️ dias:', taller.dias);
      console.log('⚠️ horaInicio:', taller.horaInicio);
      console.log('⚠️ horaFin:', taller.horaFin);
      return [];
    }

    const reservasCreadas = [];
    const diasTaller = Array.isArray(taller.dias) ? taller.dias : [];
    const horaInicio = Array.isArray(taller.horaInicio) && taller.horaInicio.length > 0 ? taller.horaInicio[0] : null;
    const horaFin = Array.isArray(taller.horaFin) && taller.horaFin.length > 0 ? taller.horaFin[0] : null;

    console.log('🔵 diasTaller:', diasTaller);
    console.log('🔵 horaInicio:', horaInicio);
    console.log('🔵 horaFin:', horaFin);

    if (!horaInicio || !horaFin) {
      console.log('⚠️ Taller sin horas de inicio/fin definidas');
      console.log('⚠️ horaInicio type:', typeof taller.horaInicio, taller.horaInicio);
      console.log('⚠️ horaFin type:', typeof taller.horaFin, taller.horaFin);
      return [];
    }

    // Mapear días en español a números de día de la semana (0 = domingo, 1 = lunes, etc.)
    const diasMap = {
      'domingo': 0,
      'lunes': 1,
      'martes': 2,
      'miércoles': 3,
      'miercoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sábado': 6,
      'sabado': 6
    };

    const diasNumeros = diasTaller
      .map(dia => diasMap[dia.toLowerCase()])
      .filter(num => num !== undefined);

    if (diasNumeros.length === 0) {
      console.log('⚠️ No se pudieron mapear los días del taller');
      return [];
    }

    // Iterar desde fechaInicio hasta fechaFin
    const fechaActual = new Date(taller.fechaInicio);
    const fechaFinal = new Date(taller.fechaFin);

    console.log(`📅 Creando reservas internas desde ${fechaActual.toISOString()} hasta ${fechaFinal.toISOString()}`);
    console.log(`📅 Días: ${diasTaller.join(', ')} (${diasNumeros.join(', ')})`);
    console.log(`⏰ Horario: ${horaInicio} - ${horaFin}`);

    while (fechaActual <= fechaFinal) {
      const diaSemana = fechaActual.getDay();

      // Si el día actual coincide con uno de los días del taller
      if (diasNumeros.includes(diaSemana)) {
        const [horaInicioNum, minutoInicioNum] = horaInicio.split(':').map(Number);
        const [horaFinNum, minutoFinNum] = horaFin.split(':').map(Number);

        const fechaInicioReserva = new Date(fechaActual);
        fechaInicioReserva.setHours(horaInicioNum, minutoInicioNum, 0, 0);

        const fechaFinReserva = new Date(fechaActual);
        fechaFinReserva.setHours(horaFinNum, minutoFinNum, 0, 0);

        // Crear reserva interna
        const reservaInterna = new ReservasPteAlto({
          espacioDeportivo: taller.espacioDeportivo,
          taller: taller._id,
          fechaInicio: fechaInicioReserva,
          fechaFin: fechaFinReserva,
          tipoReserva: 'taller',
          estado: 'activa',
          esReservaInterna: true,
          tipoReservaInterna: 'tercero', // Puedes ajustar esto según tu lógica
          reservadoPor: adminId,
          reservadoPara: `Taller: ${taller.nombre}`,
          notas: `Reserva interna automática para el taller ${taller.nombre}`
        });

        await reservaInterna.save();
        reservasCreadas.push(reservaInterna);
        console.log(`✅ Reserva interna creada: ${fechaInicioReserva.toISOString()} - ${fechaFinReserva.toISOString()}`);
      }

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    console.log(`✅ Total de reservas internas creadas: ${reservasCreadas.length}`);
    return reservasCreadas;

  } catch (error) {
    console.error('❌ Error al crear reservas internas:', error);
    throw error;
  }
};

/**
 * Elimina las reservas internas asociadas a un taller
 * @param {String} tallerId - ID del taller
 */
const eliminarReservasInternasTaller = async (tallerId) => {
  try {
    const resultado = await ReservasPteAlto.deleteMany({
      taller: tallerId,
      esReservaInterna: true
    });
    console.log(`🗑️ Eliminadas ${resultado.deletedCount} reservas internas del taller ${tallerId}`);
    return resultado;
  } catch (error) {
    console.error('❌ Error al eliminar reservas internas:', error);
    throw error;
  }
};

const talleresDeportivosPteAltoController = {
  // crear taller deportivo PTE Alto y agregarlo al espacio deportivo en caso de tenerlo
  crearTallerDeportivoPteAlto: async (req, res) => {
    try {
      console.log('🔵 CREAR TALLER - req.body:', req.body);
      console.log(
        '🔵 CREAR TALLER - req.files:',
        req.files ? `Sí (${req.files.length} archivos)` : 'No'
      );

      // Parsear arrays JSON si vienen como strings
      const bodyData = { ...req.body };
      if (typeof bodyData.horarios === 'string') {
        bodyData.horarios = JSON.parse(bodyData.horarios);
      }
      if (typeof bodyData.dias === 'string') {
        bodyData.dias = JSON.parse(bodyData.dias);
      }
      if (typeof bodyData.horaInicio === 'string') {
        bodyData.horaInicio = JSON.parse(bodyData.horaInicio);
      }
      if (typeof bodyData.horaFin === 'string') {
        bodyData.horaFin = JSON.parse(bodyData.horaFin);
      }

      // Parsear fechas si vienen como strings ISO
      if (typeof bodyData.fechaInicio === 'string') {
        bodyData.fechaInicio = new Date(bodyData.fechaInicio);
      }
      if (typeof bodyData.fechaFin === 'string') {
        bodyData.fechaFin = new Date(bodyData.fechaFin);
      }

      console.log('🔵 Body data parseado:', JSON.stringify(bodyData, null, 2));

      const nuevoTallerDeportivoPteAlto = new TalleresDeportivos(bodyData);

      // Subir una o hasta 5 imágenes al campo galeria del taller deportivo
      if (req.files && req.files.length > 0) {
        const galeria = [];
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of req.files) {
          const extension = file.originalname.split('.').pop().toLowerCase();

          // Validar extensión
          if (!allowedExtensions.includes(extension)) {
            return res.status(400).json({
              message: `Tipo de archivo no permitido: ${extension}. Solo se permiten imágenes (jpg, jpeg, png, gif, webp)`,
              success: false,
            });
          }

          // Validar tamaño
          if (file.size > maxSize) {
            return res.status(400).json({
              message: `El archivo ${file.originalname} excede el tamaño máximo de 5MB`,
              success: false,
            });
          }

          try {
            // Subir archivo a S3 usando helper
            const key = await uploadMulterFile(file);
            const fileUrl = `${cloudfrontUrl}/${key}`;
            galeria.push(fileUrl);
          } catch (uploadError) {
            console.error(`Error al subir archivo ${file.originalname}:`, uploadError);
            return res.status(500).json({
              message: `Error al subir el archivo ${file.originalname}`,
              error: uploadError.message,
              success: false,
            });
          }
        }

        nuevoTallerDeportivoPteAlto.galeria = galeria;
        console.log(`✅ ${galeria.length} imágenes subidas a la galería`);
      } else {
        console.log('⚠️ No se recibieron archivos en req.files');
      }

      // Guardar taller primero
      await nuevoTallerDeportivoPteAlto.save();

      // Si viene espacioDeportivo por query, se asocia
      if (req.query.espacioDeportivo) {
        const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(
          req.query.espacioDeportivo
        );
        if (!espacioDeportivoEncontrado) {
          return res.status(404).json({
            message: 'Espacio deportivo no encontrado',
            success: false,
          });
        }

        espacioDeportivoEncontrado.talleres.push(
          nuevoTallerDeportivoPteAlto._id
        );
        await espacioDeportivoEncontrado.save();

        nuevoTallerDeportivoPteAlto.espacioDeportivo =
          espacioDeportivoEncontrado._id;
        await nuevoTallerDeportivoPteAlto.save();
      } else {
        nuevoTallerDeportivoPteAlto.espacioDeportivo = null;
        await nuevoTallerDeportivoPteAlto.save();
      }

      // CREAR RESERVAS INTERNAS AUTOMÁTICAMENTE
      try {
        const adminId = req.user?.id || req.user?.userId || bodyData.reservadoPor || null;
        const reservasInternas = await crearReservasInternasTaller(nuevoTallerDeportivoPteAlto, adminId);
        console.log(`✅ ${reservasInternas.length} reservas internas creadas para el taller`);
      } catch (reservaError) {
        console.error('⚠️ Error al crear reservas internas (el taller se creó pero sin reservas):', reservaError);
        // No retornar error, el taller ya fue creado
      }

      console.log(
        '✅ Taller creado con galería:',
        nuevoTallerDeportivoPteAlto.galeria
      );

      res.status(201).json({
        message: 'Taller deportivo PTE Alto creado correctamente',
        response: nuevoTallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.error('❌ Error al crear taller:', error);
      res.status(500).json({
        message: 'Error al crear el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  obtenerTodosLosTalleresDeportivosPteAlto: async (req, res) => {
    try {
      const talleresDeportivosPteAlto = await TalleresDeportivos.find();
      res.status(200).json({
        message: 'Talleres deportivos PTE Alto obtenidos correctamente',
        response: talleresDeportivosPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al obtener los talleres deportivos PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  obtenerTallerDeportivoPteAltoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const tallerDeportivoPteAlto = await TalleresDeportivos.findById(id);
      res.status(200).json({
        message: 'Taller deportivo PTE Alto obtenido correctamente',
        response: tallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al obtener el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  actualizarTallerDeportivoPteAltoPorId: async (req, res) => {
    try {
      console.log('🔵 ACTUALIZAR TALLER - req.body:', req.body);
      console.log(
        '🔵 ACTUALIZAR TALLER - req.files:',
        req.files ? `Sí (${req.files.length} archivos)` : 'No'
      );

      const { id } = req.params;
      let updateData = { ...req.body };

      // Parsear arrays JSON si vienen como strings
      if (typeof updateData.horarios === 'string') {
        updateData.horarios = JSON.parse(updateData.horarios);
      }
      if (typeof updateData.dias === 'string') {
        updateData.dias = JSON.parse(updateData.dias);
      }
      if (typeof updateData.horaInicio === 'string') {
        updateData.horaInicio = JSON.parse(updateData.horaInicio);
      }
      if (typeof updateData.horaFin === 'string') {
        updateData.horaFin = JSON.parse(updateData.horaFin);
      }

      // Si se suben nuevas imágenes, procesarlas
      if (req.files && req.files.length > 0) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        // galeria puede venir como JSON string desde el front
        const galeriaExistente = updateData.galeria
          ? JSON.parse(updateData.galeria)
          : [];

        const nuevasImagenes = [];

        console.log(`📸 Procesando ${req.files.length} nuevas imágenes`);

        for (const file of req.files) {
          const extension = file.originalname.split('.').pop().toLowerCase();

          if (!allowedExtensions.includes(extension)) {
            return res.status(400).json({
              message: `Tipo de archivo no permitido: ${extension}`,
              success: false,
            });
          }

          if (file.size > maxSize) {
            return res.status(400).json({
              message: `El archivo ${file.originalname} excede 5MB`,
              success: false,
            });
          }

          try {
            const key = await uploadMulterFile(file);
            const fileUrl = `${cloudfrontUrl}/${key}`;
            nuevasImagenes.push(fileUrl);
            console.log('✅ Imagen subida:', fileUrl);
          } catch (uploadError) {
            console.error(`Error al subir ${file.originalname}:`, uploadError);
            return res.status(500).json({
              message: `Error al subir ${file.originalname}`,
              error: uploadError.message,
              success: false,
            });
          }
        }

        // Combinar galería existente con nuevas imágenes (máximo 5)
        const galeriaCompleta = [...galeriaExistente, ...nuevasImagenes].slice(
          0,
          5
        );
        updateData.galeria = galeriaCompleta;
        console.log(
          `📚 Galería actualizada con ${galeriaCompleta.length} imágenes`
        );
      }

      // Actualizar el taller
      const tallerDeportivoPteAlto =
        await TalleresDeportivos.findByIdAndUpdate(id, updateData, {
          new: true,
        });

      if (!tallerDeportivoPteAlto) {
        return res.status(404).json({
          message: 'Taller deportivo no encontrado',
          success: false,
        });
      }

      // ACTUALIZAR RESERVAS INTERNAS
      // Eliminar las reservas internas antiguas y crear nuevas
      try {
        await eliminarReservasInternasTaller(id);
        const adminId = req.user?.id || req.user?.userId || updateData.reservadoPor || null;
        const reservasInternas = await crearReservasInternasTaller(tallerDeportivoPteAlto, adminId);
        console.log(`✅ ${reservasInternas.length} reservas internas recreadas para el taller actualizado`);
      } catch (reservaError) {
        console.error('⚠️ Error al actualizar reservas internas:', reservaError);
        // No retornar error, el taller ya fue actualizado
      }

      console.log(
        '✅ Taller actualizado con galería:',
        tallerDeportivoPteAlto?.galeria
      );

      res.status(200).json({
        message: 'Taller deportivo PTE Alto actualizado correctamente',
        response: tallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al actualizar el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },

  eliminarTallerDeportivoPteAltoPorId: async (req, res) => {
    try {
      const { id } = req.params;

      // ELIMINAR RESERVAS INTERNAS PRIMERO
      try {
        await eliminarReservasInternasTaller(id);
      } catch (reservaError) {
        console.error('⚠️ Error al eliminar reservas internas:', reservaError);
        // Continuar con la eliminación del taller
      }

      const tallerDeportivoPteAlto =
        await TalleresDeportivos.findByIdAndDelete(id);

      // En caso de estar asociado a un espacio deportivo, eliminar la referencia
      if (tallerDeportivoPteAlto?.espacioDeportivo) {
        const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(
          tallerDeportivoPteAlto.espacioDeportivo
        );
        if (espacioDeportivoEncontrado) {
          espacioDeportivoEncontrado.talleres =
            espacioDeportivoEncontrado.talleres.filter(
              (taller) =>
                taller.toString() !==
                tallerDeportivoPteAlto._id.toString()
            );
          await espacioDeportivoEncontrado.save();
        }
      }

      res.status(200).json({
        message: 'Taller deportivo PTE Alto eliminado correctamente',
        response: tallerDeportivoPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al eliminar el taller deportivo PTE Alto',
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = talleresDeportivosPteAltoController;
