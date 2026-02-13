const mongoose = require('mongoose');
const TalleresDeportivos = require('./talleresDeportivosPteAlto');
const EspaciosDeportivos = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const ReservasPteAlto = require('../reservas-pte-alto/reservasPteAlto');
const ComplejosDeportivos = require('../complejos-deportivos/complejosDeportivosPteAlto');
const UsuariosPteAlto = require('../usuarios-pte-alto/usuariosPteAlto');
const sendEmailInscripcionTallerPteAlto = require('../email-pte-alto/mailInsripcionTallerPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client'); // helper centralizado
const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT || process.env.CLOUDFRONT_URL || `https://${bucketName}.s3.${bucketRegion}.amazonaws.com`;

// Validar que cloudfrontUrl esté definido
if (!cloudfrontUrl || cloudfrontUrl.includes('undefined')) {
  console.warn('⚠️ ADVERTENCIA: AWS_ACCESS_CLOUD_FRONT no está configurado correctamente en .env');
  console.warn('⚠️ Las URLs de imágenes podrían no funcionar correctamente');
}

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
 * funcion para calcular la edad del usuario con la fecha de nacimiento  que viene en este formato ejemplo
 * 1985-10-21T12:00:00.000+00:00
 */
const calcularEdad = (fechaNacimiento) => {
  const fechaActual = new Date();
  const fechaNacimientoDate = new Date(fechaNacimiento);
  const edad = fechaActual.getFullYear() - fechaNacimientoDate.getFullYear();
  return edad;
}
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
 * Obtiene los IDs de espacios a bloquear: espacioDeportivo + espaciosComunes (sin duplicados).
 * Si no hay ninguno y el taller tiene complejo, usa los espacios del complejo.
 * @param {Object} taller - Taller con espacioDeportivo, espaciosComunes, complejo
 * @returns {Promise<string[]>} Array de IDs de espacios
 */
const obtenerEspaciosABloquearParaTaller = async (taller) => {
  const arrEspacios = [].concat(
    Array.isArray(taller.espacioDeportivo) ? taller.espacioDeportivo : (taller.espacioDeportivo ? [taller.espacioDeportivo] : []),
    Array.isArray(taller.espaciosComunes) ? taller.espaciosComunes : (taller.espaciosComunes ? [taller.espaciosComunes] : [])
  );
  const ids = [...new Set(arrEspacios.map(id => (id && id.toString ? id.toString() : String(id))))].filter(Boolean);
  if (ids.length > 0) return ids;
  if (taller.complejo) {
    const complejo = await ComplejosDeportivos.findById(taller.complejo).lean();
    if (complejo && complejo.espaciosDeportivos && complejo.espaciosDeportivos.length) {
      return complejo.espaciosDeportivos.map(e => (e && e.toString ? e.toString() : String(e)));
    }
  }
  return [];
};

/**
 * Crea reservas internas para bloquear los espacios/sede del taller en los días y horarios enviados.
 * Usa espacioDeportivo, espaciosComunes, espacios del complejo, O la sede deportiva.
 * Una reserva por cada (día en rango, bloque horaInicio-horaFin, espacio/sede).
 * @param {Object} taller - El taller ya guardado (con _id)
 * @param {string} adminId - ID del admin que crea el taller
 * @param {Array} horariosPorDiaSemana - Opcional. Array con horarios específicos por día (unificados)
 * @param {Array} horariosPorEspacio - Opcional. Array con horarios específicos por espacio deportivo (bloques de 15 min)
 */
const crearReservasInternasTaller = async (taller, adminId, horariosPorDiaSemana = null, horariosPorEspacio = null) => {
  try {
    console.log('🔵 === CREACIÓN DE RESERVAS INTERNAS POR DÍAS Y HORARIOS ===');
    console.log('🔵 Taller:', taller.nombre, '| AdminId:', adminId);
    console.log('🔵 horariosPorDiaSemana recibido:', horariosPorDiaSemana ? 'SÍ' : 'NO');
    console.log('🔵 horariosPorEspacio recibido:', horariosPorEspacio ? `SÍ (${horariosPorEspacio.length} espacios)` : 'NO');

    if (!taller.fechaInicio || !taller.fechaFin || !taller.dias) {
      console.log('⚠️ Taller sin fechaInicio, fechaFin o dias');
      return [];
    }

    // Si no hay horarios definidos de ninguna forma, verificar horaInicio/horaFin
    if (!horariosPorEspacio && !horariosPorDiaSemana && (!taller.horaInicio || !taller.horaFin)) {
      console.log('⚠️ Taller sin horarios definidos');
      return [];
    }

    // Determinar si es un taller en sede o en complejo/espacios
    const esTallerEnSede = taller.sede && !taller.complejo && !taller.espacioDeportivo?.length && !taller.espaciosComunes?.length;
    
    const reservasCreadas = [];
    const diasTaller = Array.isArray(taller.dias) ? taller.dias : [];

    const diasMap = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
      'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6
    };
    const diasNumeros = diasTaller
      .map(dia => (typeof dia === 'number' ? dia : diasMap[String(dia).toLowerCase()]))
      .filter(num => num !== undefined);

    if (diasNumeros.length === 0) {
      console.log('⚠️ No se pudieron mapear los días del taller');
      return [];
    }

    const fechaInicio = new Date(taller.fechaInicio);
    const fechaFinal = new Date(taller.fechaFin);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFinal.setHours(23, 59, 59, 999);

    // ========== MODO: HORARIOS POR ESPACIO (bloques de 15 min) ==========
    if (horariosPorEspacio && Array.isArray(horariosPorEspacio) && horariosPorEspacio.length > 0) {
      console.log('🟢 Usando modo HORARIOS POR ESPACIO (bloques de 15 minutos)');
      
      for (const espacioConfig of horariosPorEspacio) {
        const espacioId = espacioConfig.espacioId;
        console.log(`📍 Procesando espacio: ${espacioConfig.espacioNombre} (${espacioId})`);
        
        for (const diaConfig of espacioConfig.horariosPorDia) {
          if (!diaConfig.horarios || diaConfig.horarios.length === 0) continue;
          
          // Iterar por cada fecha en el rango
          const fechaActual = new Date(fechaInicio);
          while (fechaActual <= fechaFinal) {
            const diaSemana = fechaActual.getDay();
            
            if (diaSemana === diaConfig.dia) {
              // Crear una reserva por cada bloque horario
              for (const horario of diaConfig.horarios) {
                const [hI, mI] = String(horario.horaInicio).split(':').map(Number);
                const [hF, mF] = String(horario.horaFin).split(':').map(Number);

                const fechaInicioReserva = new Date(fechaActual);
                fechaInicioReserva.setHours(hI || 0, mI || 0, 0, 0);
                const fechaFinReserva = new Date(fechaActual);
                fechaFinReserva.setHours(hF || 0, mF || 0, 0, 0);

                const reservaInterna = new ReservasPteAlto({
                  espacioDeportivo: espacioId,
                  taller: taller._id,
                  fechaInicio: fechaInicioReserva,
                  fechaFin: fechaFinReserva,
                  tipoReserva: 'taller',
                  estado: 'activa',
                  esReservaInterna: true,
                  tipoReservaInterna: 'tercero',
                  reservadoPor: adminId || undefined,
                  reservadoPara: `Taller: ${taller.nombre}`,
                  notas: `Reserva interna automática para el taller ${taller.nombre}`
                });
                await reservaInterna.save();
                reservasCreadas.push(reservaInterna);
              }
            }
            fechaActual.setDate(fechaActual.getDate() + 1);
          }
        }
      }
      
      console.log(`✅ Reservas internas creadas (por espacio): ${reservasCreadas.length}`);
      return reservasCreadas;
    }

    // ========== MODO LEGACY: HORARIOS POR DÍA (para todos los espacios) ==========
    let idsEspacios = [];
    if (!esTallerEnSede) {
      idsEspacios = await obtenerEspaciosABloquearParaTaller(taller);
      if (idsEspacios.length === 0) {
        console.log('⚠️ No hay espacios a bloquear (espacioDeportivo, espaciosComunes ni complejo con espacios)');
        return [];
      }
    }

    // Crear mapa de horarios por día si viene horariosPorDiaSemana
    const mapaHorariosPorDia = {};
    if (horariosPorDiaSemana && Array.isArray(horariosPorDiaSemana)) {
      horariosPorDiaSemana.forEach(diaInfo => {
        mapaHorariosPorDia[diaInfo.dia] = diaInfo.horarios || [];
      });
      console.log('📅 Mapa de horarios por día:', Object.keys(mapaHorariosPorDia).map(d => `día ${d}: ${mapaHorariosPorDia[d].length} bloques`).join(', '));
    }

    // Horarios legacy (cuando no hay horariosPorDiaSemana)
    const horariosInicio = Array.isArray(taller.horaInicio) ? taller.horaInicio : [taller.horaInicio].filter(Boolean);
    const horariosFin = Array.isArray(taller.horaFin) ? taller.horaFin : [taller.horaFin].filter(Boolean);

    if (esTallerEnSede) {
      console.log(`📅 SEDE: ${taller.sede} | Días: ${diasTaller.join(', ')}`);
    } else {
      console.log(`📅 COMPLEJO/ESPACIOS | Días: ${diasTaller.join(', ')} | Espacios: ${idsEspacios.length}`);
    }

    const fechaActual = new Date(fechaInicio);
    while (fechaActual <= fechaFinal) {
      const diaSemana = fechaActual.getDay();
      if (!diasNumeros.includes(diaSemana)) {
        fechaActual.setDate(fechaActual.getDate() + 1);
        continue;
      }

      // Obtener horarios para este día específico
      let horariosDelDia = [];
      
      if (horariosPorDiaSemana && mapaHorariosPorDia[diaSemana]) {
        horariosDelDia = mapaHorariosPorDia[diaSemana];
      } else {
        for (let i = 0; i < Math.max(horariosInicio.length, horariosFin.length); i++) {
          horariosDelDia.push({
            horaInicio: horariosInicio[i] || horariosInicio[0],
            horaFin: horariosFin[i] || horariosFin[0]
          });
        }
      }

      // Crear una reserva por cada bloque horario del día
      for (const horario of horariosDelDia) {
        const [hI, mI] = String(horario.horaInicio).split(':').map(Number);
        const [hF, mF] = String(horario.horaFin).split(':').map(Number);

        const fechaInicioReserva = new Date(fechaActual);
        fechaInicioReserva.setHours(hI || 0, mI || 0, 0, 0);
        const fechaFinReserva = new Date(fechaActual);
        fechaFinReserva.setHours(hF || 0, mF || 0, 0, 0);

        if (esTallerEnSede) {
          const reservaInterna = new ReservasPteAlto({
            sede: taller.sede,
            taller: taller._id,
            fechaInicio: fechaInicioReserva,
            fechaFin: fechaFinReserva,
            tipoReserva: 'taller',
            estado: 'activa',
            esReservaInterna: true,
            tipoReservaInterna: 'tercero',
            reservadoPor: adminId || undefined,
            reservadoPara: `Taller: ${taller.nombre}`,
            notas: `Reserva interna automática para el taller ${taller.nombre} en sede`
          });
          await reservaInterna.save();
          reservasCreadas.push(reservaInterna);
        } else {
          for (const espacioId of idsEspacios) {
            const reservaInterna = new ReservasPteAlto({
              espacioDeportivo: espacioId,
              taller: taller._id,
              fechaInicio: fechaInicioReserva,
              fechaFin: fechaFinReserva,
              tipoReserva: 'taller',
              estado: 'activa',
              esReservaInterna: true,
              tipoReservaInterna: 'tercero',
              reservadoPor: adminId || undefined,
              reservadoPara: `Taller: ${taller.nombre}`,
              notas: `Reserva interna automática para el taller ${taller.nombre}`
            });
            await reservaInterna.save();
            reservasCreadas.push(reservaInterna);
          }
        }
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    console.log(`✅ Reservas internas creadas: ${reservasCreadas.length}`);
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

const queryTalleresPopulate = [
  {
    path: 'espacioDeportivo',
    select: 'nombre deporte',
  },
  {
    path: 'complejo',
    select: 'nombre direccion',

  },
  {
    path: 'sede',
    select: 'nombre direccion',

  },
  {
    path: 'profesores',
    select: 'nombre apellido email telefono rut direccion fechaNacimiento sexo comuna',

  },
  {
    path: 'coordinadores',
    select: 'nombre apellido email telefono rut direccion fechaNacimiento sexo comuna',
  },
  {
    path:'usuarios',
    select: 'nombre apellido email telefono rut direccion fechaNacimiento sexo comuna',
  },
  {
    path:'usuariosBaja',
    select: 'nombre apellido email telefono rut direccion fechaNacimiento sexo comuna',
  },
  {
    path:'creadoPor',
    select: 'nombre apellido email rut rol',
  }
]

const talleresDeportivosPteAltoController = {
  // crear taller deportivo PTE Alto y agregarlo al espacio deportivo en caso de tenerlo
  crearTallerDeportivoPteAlto: async (req, res) => {
    try {
      console.log('🔵 CREAR TALLER - req.body:', req.body);
      console.log(
        '🔵 CREAR TALLER - req.files:',
        req.files ? `Sí (${req.files.length} archivos)` : 'No'
      );

      const bodyData = { ...req.body };

      // Parsear según modelo: dias, horaInicio, horaFin (arrays)
      if (typeof bodyData.dias === 'string') {
        try {
          bodyData.dias = JSON.parse(bodyData.dias);
        } catch {
          bodyData.dias = bodyData.dias ? [bodyData.dias] : [];
        }
      }
      if (typeof bodyData.horaInicio === 'string') {
        try {
          bodyData.horaInicio = JSON.parse(bodyData.horaInicio);
        } catch {
          bodyData.horaInicio = bodyData.horaInicio ? [bodyData.horaInicio] : [];
        }
      }
      if (typeof bodyData.horaFin === 'string') {
        try {
          bodyData.horaFin = JSON.parse(bodyData.horaFin);
        } catch {
          bodyData.horaFin = bodyData.horaFin ? [bodyData.horaFin] : [];
        }
      }

      // Parsear espacioDeportivo y espaciosComunes (arrays de ObjectId)
      if (typeof bodyData.espacioDeportivo === 'string') {
        try {
          const parsed = JSON.parse(bodyData.espacioDeportivo);
          bodyData.espacioDeportivo = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          bodyData.espacioDeportivo = bodyData.espacioDeportivo ? [bodyData.espacioDeportivo] : [];
        }
      }
      if (typeof bodyData.espaciosComunes === 'string') {
        try {
          const parsed = JSON.parse(bodyData.espaciosComunes);
          bodyData.espaciosComunes = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          bodyData.espaciosComunes = bodyData.espaciosComunes ? [bodyData.espaciosComunes] : [];
        }
      }

      // Parsear profesores y coordinadores (arrays de ObjectId)
      if (typeof bodyData.profesores === 'string') {
        try {
          const parsed = JSON.parse(bodyData.profesores);
          bodyData.profesores = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          bodyData.profesores = bodyData.profesores ? [bodyData.profesores] : [];
        }
      } else if (!Array.isArray(bodyData.profesores)) {
        bodyData.profesores = [];
      }
      if (typeof bodyData.coordinadores === 'string') {
        try {
          const parsed = JSON.parse(bodyData.coordinadores);
          bodyData.coordinadores = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          bodyData.coordinadores = bodyData.coordinadores ? [bodyData.coordinadores] : [];
        }
      } else if (!Array.isArray(bodyData.coordinadores)) {
        bodyData.coordinadores = [];
      }

      // Parsear fechas
      if (typeof bodyData.fechaInicio === 'string') {
        bodyData.fechaInicio = new Date(bodyData.fechaInicio);
      }
      if (typeof bodyData.fechaFin === 'string') {
        bodyData.fechaFin = new Date(bodyData.fechaFin);
      }

      // Parsear horariosPorDiaSemana si viene del frontend (para reservas internas por día)
      let horariosPorDiaSemana = null;
      if (typeof bodyData.horariosPorDiaSemana === 'string') {
        try {
          horariosPorDiaSemana = JSON.parse(bodyData.horariosPorDiaSemana);
          console.log('🔵 horariosPorDiaSemana parseado:', horariosPorDiaSemana);
        } catch {
          console.log('⚠️ Error parseando horariosPorDiaSemana');
        }
        // No guardar en el modelo, solo usar para reservas
        delete bodyData.horariosPorDiaSemana;
      }

      // Parsear horariosPorEspacio si viene del frontend (para reservas internas por espacio con bloques de 15 min)
      let horariosPorEspacio = null;
      if (typeof bodyData.horariosPorEspacio === 'string') {
        try {
          horariosPorEspacio = JSON.parse(bodyData.horariosPorEspacio);
          console.log('🔵 horariosPorEspacio parseado:', horariosPorEspacio?.length, 'espacios');
        } catch {
          console.log('⚠️ Error parseando horariosPorEspacio');
        }
        // No guardar en el modelo, solo usar para reservas
        delete bodyData.horariosPorEspacio;
      }

      // Parsear informacionHorarios (días y horarios seleccionados para el taller; se guarda en el modelo)
      if (typeof bodyData.informacionHorarios === 'string') {
        try {
          bodyData.informacionHorarios = JSON.parse(bodyData.informacionHorarios);
          console.log('🔵 informacionHorarios parseado:', Array.isArray(bodyData.informacionHorarios) ? bodyData.informacionHorarios.length : 0, 'entradas');
        } catch {
          console.log('⚠️ Error parseando informacionHorarios');
          bodyData.informacionHorarios = [];
        }
      }

      // Campos del modelo: nombre, descripcion, imgUrl, video, link, categoria, complejo, sede, deporte,
      // espaciosComunes, precioCompleto, capacidadTotal, fechaInicio, fechaFin, horaInicio, horaFin, dias,
      // fechaPublicacion, espacioDeportivo, capacidad, valor, pago, usuarios, sesiones, profesores, status
      const nuevoTallerDeportivoPteAlto = new TalleresDeportivos(bodyData);

      // Subir imágenes al campo imgUrl del modelo (req.files desde multer con campo "galeria")
if (req.file) {
  try {
    const key = await uploadMulterFile(req.file);
    const fileUrl = `${cloudfrontUrl}/${key}`;
    nuevoTallerDeportivoPteAlto.imgUrl = fileUrl;
  } catch (uploadError) {
    console.error('❌ Error al subir imagen:', uploadError);
    return res.status(500).json({
      message: 'Error al subir imagen',
      error: uploadError.message,
      success: false,
    });
  }
}

      await nuevoTallerDeportivoPteAlto.save();

      // Crear reservas internas por días, horarios y espacios (o complejo si no hay espacios)
      let reservasInternas = [];
      try {
        const adminId = req.user?.id || req.user?.userId || bodyData.reservadoPor || bodyData.creadoPor || null;
        reservasInternas = await crearReservasInternasTaller(nuevoTallerDeportivoPteAlto, adminId, horariosPorDiaSemana, horariosPorEspacio);
        console.log(`✅ ${reservasInternas.length} reservas internas creadas para el taller`);
      } catch (reservaError) {
        console.error('⚠️ Error al crear reservas (el taller ya se guardó):', reservaError);
      }

      res.status(201).json({
        message: 'Taller deportivo PTE Alto creado correctamente',
        response: nuevoTallerDeportivoPteAlto,
        reservasInternasCreadas: reservasInternas.length,
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
      const talleresDeportivosPteAlto = await TalleresDeportivos.find()
        .populate('espacioDeportivo', 'nombre deporte')
        .populate('complejo', 'nombre direccion')
        .populate('sede', 'nombre direccion')
        .populate('profesores', 'nombre apellido email')
        .populate('coordinadores', 'nombre apellido email');

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
      const tallerDeportivoPteAlto = await TalleresDeportivos.findById(id).populate(queryTalleresPopulate);
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
      // Parsear profesores y coordinadores si vienen como strings JSON
      if (typeof updateData.profesores === 'string') {
        try {
          updateData.profesores = JSON.parse(updateData.profesores);
        } catch {
          updateData.profesores = [];
        }
      }
      if (typeof updateData.coordinadores === 'string') {
        try {
          updateData.coordinadores = JSON.parse(updateData.coordinadores);
        } catch {
          updateData.coordinadores = [];
        }
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

      // Parsear horariosPorEspacio e informacionHorarios (para reservas y persistencia)
      let horariosPorEspacioUpdate = null;
      let horariosPorDiaSemanaUpdate = null;
      if (typeof updateData.horariosPorEspacio === 'string') {
        try {
          horariosPorEspacioUpdate = JSON.parse(updateData.horariosPorEspacio);
        } catch {
          // ignore
        }
        delete updateData.horariosPorEspacio;
      }
      if (typeof updateData.horariosPorDiaSemana === 'string') {
        try {
          horariosPorDiaSemanaUpdate = JSON.parse(updateData.horariosPorDiaSemana);
        } catch {
          // ignore
        }
        delete updateData.horariosPorDiaSemana;
      }
      if (typeof updateData.informacionHorarios === 'string') {
        try {
          updateData.informacionHorarios = JSON.parse(updateData.informacionHorarios);
        } catch {
          updateData.informacionHorarios = [];
        }
      }

      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          const fileUrl = `${cloudfrontUrl}/${key}`;
          updateData.imgUrl = fileUrl;
        } catch (uploadError) {
          console.error('❌ Error al subir imagen:', uploadError);
          return res.status(500).json({
            message: 'Error al subir imagen',
            error: uploadError.message,
            success: false,
          });
        } 
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

      // ACTUALIZAR RESERVAS INTERNAS: borrar todas desde fechaInicio hasta fechaFin y crear nuevas
      const esVariantes = tallerDeportivoPteAlto?.variantes && Array.isArray(tallerDeportivoPteAlto.variantes) && tallerDeportivoPteAlto.variantes.length > 0;
      try {
        await eliminarReservasInternasTaller(id);
        const adminId = req.user?.id || req.user?.userId || updateData.reservadoPor || null;
        let reservasInternas = [];

        if (esVariantes) {
          // Nuevo sistema: crear reservas por variante en espacios comunes
          console.log('🟢 Recreando reservas internas con sistema de variantes');
          reservasInternas = await crearReservasInternasConVariantes(tallerDeportivoPteAlto, adminId);
        } else {
          // Legacy o horarios por espacio: pasar horariosPorEspacio/horariosPorDiaSemana si vinieron en el body
          console.log('🟡 Recreando reservas internas (legacy o por espacio)');
          reservasInternas = await crearReservasInternasTaller(
            tallerDeportivoPteAlto,
            adminId,
            horariosPorDiaSemanaUpdate,
            horariosPorEspacioUpdate
          );
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
  inscribirseATaller: async (req, res) => {

    /**
     * El controlador debe recibir el id del taller y el id del usuario
     * El controlador debe verificar que el taller existe, que el usuario este activo, validado y que su comuna sea Puente Alto
     * El controlador debe verificar que el taller tenga fechaInicio y fechaFin
     * El controlador debe verificar que el taller tenga capacidad
     * El controlador debe verificar que el taller tenga cupos disponibles
     * El controlador debe validar que el usuario tenga el sexo correcto para el taller
     */

    try {
      const { tallerId, usuarioId } = req.params;

      const taller = await TalleresDeportivos.findById(tallerId);
      if (!taller) {
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false,
        });
      }
      
      const usuario = await UsuariosPteAlto.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado',
          success: false,
        });
      }
      
      /**
       * Las validaciones deben ser independientes
       */
      
      if (usuario.status !== true) {
        return res.status(400).json({
          message: 'su cuenta no esta activa, debe ser activa para inscribirse a este taller',
          success: false,
        });
      }

      if (usuario.comuna !== 'Puente Alto' ) {
        return res.status(400).json({
          message: 'El usuario no pertenece a la comuna de Puente Alto, no puede inscribirse a este taller',
          success: false,
        });
      }

      if (usuario.estadoValidacion !== 'validado' ) {
        return res.status(400).json({
          message: 'El usuario no esta validado, debe ser validado para inscribirse a este taller',
          success: false,
        });
      }

      if (taller.sexo !== 'ambos' && taller.sexo !== usuario.sexo) {
        return res.status(400).json({
          message: 'El taller solo acepta inscripciones para el sexo indicado, no puede inscribirse a este taller',
          success: false,
        });
      }



      //validacion de edad calcular la edad del usuario con la fecha de nacimiento completa tomando en cuenta el dia, mes y año
      const edadUsuario = calcularEdad(usuario.fechaNacimiento);
      if (edadUsuario < taller.edadMin || edadUsuario > taller.edadMax) {
        return res.status(400).json({
          message: 'El usuario no cumple con la edad requerida para inscribirse a este taller',
          success: false,
        });
      }

      
      if (taller.capacidad <= taller.usuarios.length) {
        return res.status(400).json({
          message: 'El taller ha alcanzado su capacidad máxima, no hay cupos disponibles para inscribirse a este taller',
          success: false,
        });
      }
      if (taller.usuarios.some(id => id.toString() === usuarioId.toString())) {
        return res.status(400).json({
          message: 'Ya estás inscrito a este taller o has dado de baja de este taller, comunica con el administrador para que te inscriba nuevamente',
          success: false,
        });
      }

      if (taller.usuariosBaja.some(id => id.toString() === usuarioId.toString())) {
        return res.status(400).json({
          message: 'Ya has dado de baja de este taller, no puedes inscribirte nuevamente',
          success: false,
        });
      }
      
      // Inscribir el usuario al taller
      taller.usuarios.push(usuarioId);
      await taller.save();
      // agregar el taller al usuario
      usuario.talleresInscritos.push(tallerId);
      await usuario.save();

      // Enviar email de confirmación de inscripción (resumen + link para darse de baja)
      try {
        await taller.populate([
          { path: 'complejo', select: 'nombre direccion' },
          { path: 'sede', select: 'nombre direccion' },
          { path: 'espacioDeportivo', select: 'nombre direccion' },
        ]);
        const nombreUsuario = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Usuario';
        await sendEmailInscripcionTallerPteAlto(
          usuario.email,
          nombreUsuario,
          taller,
          usuarioId
        );
      } catch (emailError) {
        console.error('Error al enviar email de confirmación de inscripción al taller (no crítico):', emailError);
      }

      return res.status(200).json({
        message: 'Te has inscrito correctamente a este taller, recibiras un email de confirmacion de inscripcion',
        success: true,
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Error al inscribirse al taller',
        error: error.message,
        success: false,
      });
    }

  },
  desinscribirseATaller: async (req, res) => {
    try {
      const { tallerId, usuarioId } = req.params;
      const taller = await TalleresDeportivos.findById(tallerId);
      if (!taller) {
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false,
        });
      }
      const usuario = await UsuariosPteAlto.findById(usuarioId);
      if (!usuario){
        return res.status(404).json({
          message: 'Usuario no encontrado',
          success: false,
        });
      }

      // Verificar que el usuario esté inscrito al taller
      if (!usuario.talleresInscritos.some(id => id.toString() === tallerId.toString())) {
        return res.status(400).json({
          message: 'No estás inscrito a este taller, no puedes desinscribirte',
          success: false,
        });
      }

      // Mover el usuario de usuarios (activos) a usuariosBaja (historial)
      taller.usuarios = taller.usuarios.filter(id => id.toString() !== usuarioId.toString());
      if (!taller.usuariosBaja) taller.usuariosBaja = [];
      taller.usuariosBaja.push(usuarioId);
      await taller.save();

      // Quitar el taller de la lista de inscritos del usuario
      usuario.talleresInscritos = usuario.talleresInscritos.filter(id => id.toString() !== tallerId.toString());
      await usuario.save();

      return res.status(200).json({
        message: 'Te has dado de baja correctamente de este taller',
        success: true,
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Error al desinscribirse al taller',
        error: error.message,
        success: false,
      });
    }
  },
  /**
   * Reactivar en el taller: mueve un usuario de usuariosBaja a usuarios (solo admin).
   */
  reactivarEnTaller: async (req, res) => {
    try {
      const { tallerId, usuarioId } = req.params;
      const taller = await TalleresDeportivos.findById(tallerId);
      if (!taller) {
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false,
        });
      }
      const usuario = await UsuariosPteAlto.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({
          message: 'Usuario no encontrado',
          success: false,
        });
      }
      if (!taller.usuariosBaja || !taller.usuariosBaja.some(id => id.toString() === usuarioId.toString())) {
        return res.status(400).json({
          message: 'El usuario no está dado de baja en este taller',
          success: false,
        })
      }

      if (taller.capacidad <= taller.usuarios.length) {
        return res.status(400).json({
          message: 'El taller ha alcanzado su capacidad máxima',
          success: false,
        });
      }
      // Quitar de usuariosBaja y agregar a usuarios
      taller.usuariosBaja = taller.usuariosBaja.filter(id => id.toString() !== usuarioId.toString());
      taller.usuarios.push(usuarioId);
      await taller.save();
      // Asegurar que el taller esté en talleresInscritos del usuario
      if (!usuario.talleresInscritos.some(id => id.toString() === tallerId.toString())) {
        usuario.talleresInscritos.push(tallerId);
        await usuario.save();
      }
      return res.status(200).json({
        message: 'Usuario reactivado en el taller correctamente',
        success: true,
      });
    } catch (error) {
      console.error('Error al reactivar en taller:', error);
      return res.status(500).json({
        message: 'Error al reactivar en el taller',
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
   * Soporta tanto sistema legacy (sesiones globales) como nuevo sistema (sesiones por variante)
   */
  obtenerSesionesTaller: async (req, res) => {
    try {
      const { tallerId } = req.params;

      const taller = await TalleresDeportivos.findById(tallerId)
        .populate('sesiones.usuariosInscritos', 'nombre apellido email')
        .populate('variantes.sesiones.usuariosInscritos', 'nombre apellido email')
        .populate('variantes.usuariosInscritos', 'nombre apellido email')
        .populate('espacioDeportivo', 'nombre deporte')
        .populate('complejo', 'nombre')
        .populate('espaciosComunes', 'nombre deporte');

      if (!taller) {
        return res.status(404).json({
          message: 'Taller no encontrado',
          success: false,
        });
      }

      // Detectar si es sistema con variantes o legacy
      const tieneVariantes = taller.variantes && Array.isArray(taller.variantes) && taller.variantes.length > 0;

      let sesionesFormateadas = [];

      if (tieneVariantes) {
        // NUEVO SISTEMA: Extraer sesiones de todas las variantes
        console.log('🟢 Obteniendo sesiones de taller con variantes');

        taller.variantes.forEach((variante, idx) => {
          if (variante.sesiones && Array.isArray(variante.sesiones)) {
            variante.sesiones.forEach(sesion => {
              const usuariosInscritos = sesion.usuariosInscritos?.length || 0;
              const cuposDisponibles = variante.capacidad - usuariosInscritos;

              sesionesFormateadas.push({
                _id: sesion._id,
                fecha: sesion.fecha,
                horaInicio: variante.horaInicio,
                horaFin: variante.horaFin,
                dia: sesion.dia,
                capacidad: variante.capacidad,
                usuariosInscritos: usuariosInscritos,
                cuposDisponibles: cuposDisponibles,
                estado: sesion.estado,
                notas: sesion.notas,
                usuariosDetalle: sesion.usuariosInscritos || [],
                // Información adicional de la variante
                varianteId: variante._id,
                varianteNombre: variante.nombre,
                varianteDescripcion: variante.descripcion,
                edadMin: variante.edadMin,
                edadMax: variante.edadMax,
                genero: variante.genero,
                precioIndividual: variante.precioIndividual
              });
            });
          }
        });

        // Ordenar sesiones por fecha
        sesionesFormateadas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      } else {
        // LEGACY: Sesiones globales del taller
        console.log('🟡 Obteniendo sesiones de taller legacy');

        sesionesFormateadas = taller.sesiones.map(sesion => {
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
      }

      res.status(200).json({
        message: 'Sesiones del taller obtenidas correctamente',
        taller: {
          _id: taller._id,
          nombre: taller.nombre,
          descripcion: taller.descripcion,
          espacioDeportivo: taller.espacioDeportivo,
          complejo: taller.complejo,
          capacidadGeneral: taller.capacidad,
          capacidadTotal: taller.capacidadTotal,
          valor: taller.valor,
          precioCompleto: taller.precioCompleto,
          pago: taller.pago,
          tipoInscripcion: taller.tipoInscripcion,
          tieneVariantes: tieneVariantes,
          variantes: taller.variantes || []
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
