const TalleresDeportivos = require('./talleresDeportivosPteAlto');
const EspaciosDeportivos = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const ReservasPteAlto = require('../reservas-pte-alto/reservasPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client'); // helper centralizado
const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

/**
 * Genera sesiones por variante para talleres con sistema de variantes
 * @param {Object} taller - El taller con variantes, fechaInicio, fechaFin, dias
 * @returns {Array} Array de variantes con sus sesiones generadas
 */
const generarSesionesPorVariante = (taller) => {
  try {
    console.log('🔵 === GENERANDO SESIONES POR VARIANTE ===');

    if (!taller.fechaInicio || !taller.fechaFin || !taller.dias || !taller.variantes || taller.variantes.length === 0) {
      console.log('⚠️ Taller sin datos suficientes para generar sesiones por variante');
      return [];
    }

    const diasTaller = Array.isArray(taller.dias) ? taller.dias : [];

    // Mapear días en español a números
    const diasMap = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
      'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
    };

    const nombresDias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    const diasNumeros = diasTaller
      .map(dia => typeof dia === 'number' ? dia : diasMap[dia.toLowerCase()])
      .filter(num => num !== undefined);

    if (diasNumeros.length === 0) {
      console.log('⚠️ No hay días válidos');
      return [];
    }

    // Generar sesiones para cada variante
    const variantesConSesiones = taller.variantes.map(variante => {
      const sesiones = [];
      const fechaActual = new Date(taller.fechaInicio);
      const fechaFinal = new Date(taller.fechaFin);

      console.log(`📅 Generando sesiones para variante: ${variante.nombre}`);

      while (fechaActual <= fechaFinal) {
        const diaSemana = fechaActual.getDay();

        if (diasNumeros.includes(diaSemana)) {
          const fechaSesion = new Date(fechaActual);
          fechaSesion.setHours(0, 0, 0, 0);

          const sesion = {
            fecha: fechaSesion,
            dia: nombresDias[diaSemana],
            usuariosInscritos: [],
            estado: 'activa',
            notas: ''
          };

          sesiones.push(sesion);
        }

        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      console.log(`✅ ${sesiones.length} sesiones generadas para variante: ${variante.nombre}`);

      return {
        ...variante,
        sesiones
      };
    });

    return variantesConSesiones;
  } catch (error) {
    console.error('❌ Error al generar sesiones por variante:', error);
    return [];
  }
};

/**
 * Genera sesiones individuales para el taller basado en días, horarios y rango de fechas
 * LEGACY - Para talleres sin variantes
 * @param {Object} taller - El taller con fechaInicio, fechaFin, dias, horaInicio, horaFin
 * @returns {Array} Array de sesiones generadas
 */
const generarSesionesTaller = (taller) => {
  try {
    console.log('🔵 === GENERANDO SESIONES DEL TALLER ===');

    if (!taller.fechaInicio || !taller.fechaFin || !taller.dias || !taller.horaInicio || !taller.horaFin) {
      console.log('⚠️ Taller sin datos suficientes para generar sesiones');
      return [];
    }

    const sesiones = [];
    const diasTaller = Array.isArray(taller.dias) ? taller.dias : [];
    const horariosInicio = Array.isArray(taller.horaInicio) ? taller.horaInicio : [];
    const horariosFin = Array.isArray(taller.horaFin) ? taller.horaFin : [];

    // Mapear días en español a números
    const diasMap = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
      'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
    };

    const nombresDias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    const diasNumeros = diasTaller
      .map(dia => typeof dia === 'number' ? dia : diasMap[dia.toLowerCase()])
      .filter(num => num !== undefined);

    if (diasNumeros.length === 0 || horariosInicio.length === 0) {
      console.log('⚠️ No hay días u horarios válidos');
      return [];
    }

    // Iterar desde fechaInicio hasta fechaFin
    const fechaActual = new Date(taller.fechaInicio);
    const fechaFinal = new Date(taller.fechaFin);

    console.log(`📅 Generando sesiones desde ${fechaActual.toISOString()} hasta ${fechaFinal.toISOString()}`);

    while (fechaActual <= fechaFinal) {
      const diaSemana = fechaActual.getDay();

      // Si el día actual coincide con uno de los días del taller
      if (diasNumeros.includes(diaSemana)) {
        // Crear una sesión por cada horario
        horariosInicio.forEach((horaInicio, idx) => {
          const horaFin = horariosFin[idx] || horariosFin[0];

          const fechaSesion = new Date(fechaActual);
          fechaSesion.setHours(0, 0, 0, 0);

          const sesion = {
            fecha: fechaSesion,
            horaInicio: horaInicio,
            horaFin: horaFin,
            dia: nombresDias[diaSemana],
            usuariosInscritos: [],
            capacidad: taller.capacidad || 20,
            estado: 'activa',
            notas: ''
          };

          sesiones.push(sesion);
        });
      }

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    console.log(`✅ ${sesiones.length} sesiones generadas`);
    return sesiones;
  } catch (error) {
    console.error('❌ Error al generar sesiones:', error);
    return [];
  }
};

/**
 * Crea reservas internas para talleres con sistema de variantes
 * Bloquea los espacios comunes en los horarios de cada variante
 * @param {Object} taller - El taller con variantes
 * @param {String} adminId - ID del admin que crea el taller
 */
const crearReservasInternasConVariantes = async (taller, adminId) => {
  try {
    console.log('🔵 === INICIANDO CREACIÓN DE RESERVAS INTERNAS CON VARIANTES ===');
    console.log('🔵 Taller:', taller.nombre);
    console.log('🔵 Variantes:', taller.variantes?.length || 0);
    console.log('🔵 Espacios comunes:', taller.espaciosComunes?.length || 0);

    if (!taller.espaciosComunes || taller.espaciosComunes.length === 0) {
      console.log('⚠️ Taller sin espacios comunes para reservar');
      return [];
    }

    if (!taller.variantes || taller.variantes.length === 0) {
      console.log('⚠️ Taller sin variantes definidas');
      return [];
    }

    const reservasCreadas = [];
    const diasTaller = Array.isArray(taller.dias) ? taller.dias : [];

    // Mapear días en español a números
    const diasMap = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
      'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
    };

    const diasNumeros = diasTaller
      .map(dia => typeof dia === 'number' ? dia : diasMap[dia.toLowerCase()])
      .filter(num => num !== undefined);

    if (diasNumeros.length === 0) {
      console.log('⚠️ No se pudieron mapear los días del taller');
      return [];
    }

    // Crear reservas para cada variante en cada espacio común
    for (const variante of taller.variantes) {
      console.log(`📅 Procesando variante: ${variante.nombre}`);

      const fechaActual = new Date(taller.fechaInicio);
      const fechaFinal = new Date(taller.fechaFin);

      while (fechaActual <= fechaFinal) {
        const diaSemana = fechaActual.getDay();

        if (diasNumeros.includes(diaSemana)) {
          // Crear reservas en TODOS los espacios comunes para esta variante
          for (const espacioId of taller.espaciosComunes) {
            const [horaInicioNum, minutoInicioNum] = variante.horaInicio.split(':').map(Number);
            const [horaFinNum, minutoFinNum] = variante.horaFin.split(':').map(Number);

            const fechaInicioReserva = new Date(fechaActual);
            fechaInicioReserva.setHours(horaInicioNum, minutoInicioNum, 0, 0);

            const fechaFinReserva = new Date(fechaActual);
            fechaFinReserva.setHours(horaFinNum, minutoFinNum, 0, 0);

            const reservaInterna = new ReservasPteAlto({
              espacioDeportivo: espacioId,
              taller: taller._id,
              fechaInicio: fechaInicioReserva,
              fechaFin: fechaFinReserva,
              tipoReserva: 'taller',
              estado: 'activa',
              esReservaInterna: true,
              tipoReservaInterna: 'tercero',
              reservadoPor: adminId,
              reservadoPara: `Taller: ${taller.nombre} - Variante: ${variante.nombre}`,
              notas: `Reserva interna automática para variante ${variante.nombre}`
            });

            await reservaInterna.save();
            reservasCreadas.push(reservaInterna);
          }
        }

        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      console.log(`✅ Reservas creadas para variante: ${variante.nombre}`);
    }

    console.log(`✅ Total de reservas internas creadas: ${reservasCreadas.length}`);
    return reservasCreadas;

  } catch (error) {
    console.error('❌ Error al crear reservas internas con variantes:', error);
    throw error;
  }
};

/**
 * LEGACY: Crea reservas internas para bloquear el espacio deportivo en los días y horarios del taller
 * Mantener para compatibilidad con talleres antiguos sin variantes
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

      // Parsear variantes si vienen como string (NUEVO SISTEMA)
      if (typeof bodyData.variantes === 'string') {
        bodyData.variantes = JSON.parse(bodyData.variantes);
      }

      // Parsear espaciosComunes si vienen como string (NUEVO SISTEMA)
      if (typeof bodyData.espaciosComunes === 'string') {
        bodyData.espaciosComunes = JSON.parse(bodyData.espaciosComunes);
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

      // Detectar si es taller con variantes (nuevo sistema) o legacy
      const esVariantes = bodyData.variantes && Array.isArray(bodyData.variantes) && bodyData.variantes.length > 0;

      if (esVariantes) {
        console.log('🟢 SISTEMA NUEVO: Taller con variantes');
        // Generar sesiones por variante
        const variantesConSesiones = generarSesionesPorVariante(nuevoTallerDeportivoPteAlto);
        nuevoTallerDeportivoPteAlto.variantes = variantesConSesiones;
      } else {
        console.log('🟡 SISTEMA LEGACY: Taller sin variantes');
        // Generar sesiones globales (legacy)
        const sesionesGeneradas = generarSesionesTaller(nuevoTallerDeportivoPteAlto);
        nuevoTallerDeportivoPteAlto.sesiones = sesionesGeneradas;
      }

      // Guardar taller con sesiones
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
        let reservasInternas = [];

        if (esVariantes) {
          // Nuevo sistema: crear reservas por variante en espacios comunes
          console.log('🟢 Creando reservas internas con sistema de variantes');
          reservasInternas = await crearReservasInternasConVariantes(nuevoTallerDeportivoPteAlto, adminId);
        } else {
          // Legacy: crear reservas en espacio único
          console.log('🟡 Creando reservas internas con sistema legacy');
          reservasInternas = await crearReservasInternasTaller(nuevoTallerDeportivoPteAlto, adminId);
        }

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

      // Parsear variantes si vienen como string (NUEVO SISTEMA)
      if (typeof updateData.variantes === 'string') {
        updateData.variantes = JSON.parse(updateData.variantes);
      }

      // Parsear espaciosComunes si vienen como string (NUEVO SISTEMA)
      if (typeof updateData.espaciosComunes === 'string') {
        updateData.espaciosComunes = JSON.parse(updateData.espaciosComunes);
      }

      // Parsear fechas si vienen como strings ISO
      if (typeof updateData.fechaInicio === 'string') {
        updateData.fechaInicio = new Date(updateData.fechaInicio);
      }
      if (typeof updateData.fechaFin === 'string') {
        updateData.fechaFin = new Date(updateData.fechaFin);
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

      // Detectar si es taller con variantes (nuevo sistema) o legacy
      const esVariantes = updateData.variantes && Array.isArray(updateData.variantes) && updateData.variantes.length > 0;

      // Si es nuevo sistema con variantes, regenerar sesiones por variante antes de actualizar
      if (esVariantes) {
        console.log('🟢 SISTEMA NUEVO: Regenerando sesiones por variante');
        // Crear objeto temporal con los datos actualizados para generar sesiones
        const tallerTemp = {
          ...updateData,
          fechaInicio: updateData.fechaInicio || (await TalleresDeportivos.findById(id)).fechaInicio,
          fechaFin: updateData.fechaFin || (await TalleresDeportivos.findById(id)).fechaFin,
          dias: updateData.dias || (await TalleresDeportivos.findById(id)).dias,
        };
        const variantesConSesiones = generarSesionesPorVariante(tallerTemp);
        updateData.variantes = variantesConSesiones;
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
        let reservasInternas = [];

        if (esVariantes) {
          // Nuevo sistema: crear reservas por variante en espacios comunes
          console.log('🟢 Recreando reservas internas con sistema de variantes');
          reservasInternas = await crearReservasInternasConVariantes(tallerDeportivoPteAlto, adminId);
        } else {
          // Legacy: crear reservas en espacio único
          console.log('🟡 Recreando reservas internas con sistema legacy');
          reservasInternas = await crearReservasInternasTaller(tallerDeportivoPteAlto, adminId);
        }

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

  // ============================================
  // GESTIÓN DE SESIONES DE TALLERES
  // ============================================

  /**
   * Obtener todas las sesiones de un taller con información de cupos disponibles
   */
  obtenerSesionesTaller: async (req, res) => {
    try {
      const { tallerId } = req.params;

      const taller = await TalleresDeportivos.findById(tallerId)
        .populate('sesiones.usuariosInscritos', 'nombre apellido email')
        .populate('espacioDeportivo', 'nombre deporte');

      if (!taller) {
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false,
        });
      }

      // Formatear sesiones con información de cupos
      const sesionesFormateadas = taller.sesiones.map(sesion => {
        const capacidadSesion = sesion.capacidad || taller.capacidad || 20;
        const usuariosInscritos = sesion.usuariosInscritos?.length || 0;
        const cuposDisponibles = capacidadSesion - usuariosInscritos;

        return {
          _id: sesion._id,
          fecha: sesion.fecha,
          horaInicio: sesion.horaInicio,
          horaFin: sesion.horaFin,
          dia: sesion.dia,
          capacidad: capacidadSesion,
          usuariosInscritos: usuariosInscritos,
          cuposDisponibles: cuposDisponibles,
          estado: sesion.estado,
          notas: sesion.notas,
          usuariosDetalle: sesion.usuariosInscritos || []
        };
      });

      res.status(200).json({
        message: 'Sesiones del taller obtenidas correctamente',
        taller: {
          _id: taller._id,
          nombre: taller.nombre,
          descripcion: taller.descripcion,
          espacioDeportivo: taller.espacioDeportivo,
          capacidadGeneral: taller.capacidad,
          valor: taller.valor,
          pago: taller.pago
        },
        sesiones: sesionesFormateadas,
        totalSesiones: sesionesFormateadas.length,
        success: true,
      });
    } catch (error) {
      console.error('Error al obtener sesiones del taller:', error);
      res.status(500).json({
        message: 'Error al obtener las sesiones del taller',
        error: error.message,
        success: false,
      });
    }
  },

  /**
   * Inscribir un usuario a una sesión específica del taller
   */
  inscribirUsuarioASesion: async (req, res) => {
    try {
      const { tallerId, sesionId } = req.params;
      const { usuarioId } = req.body;

      if (!usuarioId) {
        return res.status(400).json({
          message: 'El ID del usuario es requerido',
          success: false,
        });
      }

      const taller = await TalleresDeportivos.findById(tallerId);
      if (!taller) {
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false,
        });
      }

      const sesion = taller.sesiones.id(sesionId);
      if (!sesion) {
        return res.status(404).json({
          message: 'Sesión no encontrada',
          success: false,
        });
      }

      // Verificar que la sesión esté activa
      if (sesion.estado !== 'activa') {
        return res.status(400).json({
          message: `No se puede inscribir a una sesión ${sesion.estado}`,
          success: false,
        });
      }

      // Verificar si el usuario ya está inscrito
      const yaInscrito = sesion.usuariosInscritos.some(
        id => id.toString() === usuarioId.toString()
      );

      if (yaInscrito) {
        return res.status(400).json({
          message: 'El usuario ya está inscrito en esta sesión',
          success: false,
        });
      }

      // Verificar cupos disponibles
      const capacidadSesion = sesion.capacidad || taller.capacidad || 20;
      const usuariosActuales = sesion.usuariosInscritos.length;

      if (usuariosActuales >= capacidadSesion) {
        return res.status(400).json({
          message: 'No hay cupos disponibles en esta sesión',
          cuposDisponibles: 0,
          success: false,
        });
      }

      // Inscribir usuario a la sesión
      sesion.usuariosInscritos.push(usuarioId);

      // También agregar al array general del taller si no está
      if (!taller.usuarios.some(id => id.toString() === usuarioId.toString())) {
        taller.usuarios.push(usuarioId);
      }

      await taller.save();

      // Populate para la respuesta
      await taller.populate('sesiones.usuariosInscritos', 'nombre apellido email');

      const sesionActualizada = taller.sesiones.id(sesionId);
      const cuposDisponibles = capacidadSesion - sesionActualizada.usuariosInscritos.length;

      res.status(200).json({
        message: 'Usuario inscrito correctamente a la sesión',
        sesion: {
          _id: sesionActualizada._id,
          fecha: sesionActualizada.fecha,
          horaInicio: sesionActualizada.horaInicio,
          horaFin: sesionActualizada.horaFin,
          dia: sesionActualizada.dia,
          capacidad: capacidadSesion,
          usuariosInscritos: sesionActualizada.usuariosInscritos.length,
          cuposDisponibles: cuposDisponibles,
          estado: sesionActualizada.estado
        },
        success: true,
      });
    } catch (error) {
      console.error('Error al inscribir usuario a sesión:', error);
      res.status(500).json({
        message: 'Error al inscribir al usuario en la sesión',
        error: error.message,
        success: false,
      });
    }
  },

  /**
   * Desinscribir un usuario de una sesión específica del taller
   */
  desinscribirUsuarioDeSesion: async (req, res) => {
    try {
      const { tallerId, sesionId } = req.params;
      const { usuarioId } = req.body;

      if (!usuarioId) {
        return res.status(400).json({
          message: 'El ID del usuario es requerido',
          success: false,
        });
      }

      const taller = await TalleresDeportivos.findById(tallerId);
      if (!taller) {
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false,
        });
      }

      const sesion = taller.sesiones.id(sesionId);
      if (!sesion) {
        return res.status(404).json({
          message: 'Sesión no encontrada',
          success: false,
        });
      }

      // Verificar si el usuario está inscrito
      const indiceUsuario = sesion.usuariosInscritos.findIndex(
        id => id.toString() === usuarioId.toString()
      );

      if (indiceUsuario === -1) {
        return res.status(400).json({
          message: 'El usuario no está inscrito en esta sesión',
          success: false,
        });
      }

      // Remover usuario de la sesión
      sesion.usuariosInscritos.splice(indiceUsuario, 1);

      // Verificar si el usuario está en otras sesiones antes de removerlo del array general
      const enOtrasSesiones = taller.sesiones.some(s =>
        s._id.toString() !== sesionId.toString() &&
        s.usuariosInscritos.some(id => id.toString() === usuarioId.toString())
      );

      // Si no está en otras sesiones, removerlo del array general
      if (!enOtrasSesiones) {
        const indiceGeneral = taller.usuarios.findIndex(
          id => id.toString() === usuarioId.toString()
        );
        if (indiceGeneral !== -1) {
          taller.usuarios.splice(indiceGeneral, 1);
        }
      }

      await taller.save();

      const capacidadSesion = sesion.capacidad || taller.capacidad || 20;
      const cuposDisponibles = capacidadSesion - sesion.usuariosInscritos.length;

      res.status(200).json({
        message: 'Usuario desinscrito correctamente de la sesión',
        sesion: {
          _id: sesion._id,
          fecha: sesion.fecha,
          horaInicio: sesion.horaInicio,
          horaFin: sesion.horaFin,
          dia: sesion.dia,
          capacidad: capacidadSesion,
          usuariosInscritos: sesion.usuariosInscritos.length,
          cuposDisponibles: cuposDisponibles,
          estado: sesion.estado
        },
        success: true,
      });
    } catch (error) {
      console.error('Error al desinscribir usuario de sesión:', error);
      res.status(500).json({
        message: 'Error al desinscribir al usuario de la sesión',
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = talleresDeportivosPteAltoController;
