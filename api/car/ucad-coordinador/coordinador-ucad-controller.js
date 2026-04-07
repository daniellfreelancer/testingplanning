const CoordinadorAsignacion = require('./coordinador-asignacion');
const UsuariosUcad = require('../ucad-usuarios/usuarios-ucad');
const AgendaUCAD = require('../ucad-agenda/agenda-ucad');
const CitasUCAD = require('../ucad-citas/citas-ucad');

// ==================== COORDINADOR ENDPOINTS ====================

/**
 * Obtener profesionales asignados al coordinador logueado
 * GET /api/coordinador/mis-profesionales
 */
exports.obtenerMisProfesionales = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId; // Asumiendo que viene del middleware de autenticación

    // Buscar asignaciones activas del coordinador
    const asignaciones = await CoordinadorAsignacion.find({
      coordinador: coordinadorId,
      activo: true
    }).populate('profesionales', 'nombre apellido email especialidad imgUrl agenda');

    if (!asignaciones || asignaciones.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No tienes profesionales asignados',
        profesionales: []
      });
    }

    // Extraer todos los profesionales únicos
    const profesionalesSet = new Set();
    asignaciones.forEach(asignacion => {
      asignacion.profesionales.forEach(prof => {
        profesionalesSet.add(JSON.stringify(prof));
      });
    });

    const profesionales = Array.from(profesionalesSet).map(p => JSON.parse(p));

    res.status(200).json({
      success: true,
      profesionales,
      totalAsignaciones: asignaciones.length
    });
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener profesionales asignados',
      error: error.message
    });
  }
};

/**
 * Obtener especialidades asignadas al coordinador
 * GET /api/coordinador/mis-especialidades
 */
exports.obtenerMisEspecialidades = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;

    // Buscar asignaciones activas del coordinador
    const asignaciones = await CoordinadorAsignacion.find({
      coordinador: coordinadorId,
      activo: true
    });

    if (!asignaciones || asignaciones.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No tienes especialidades asignadas',
        especialidades: []
      });
    }

    // Extraer todas las especialidades únicas
    const especialidadesSet = new Set();
    asignaciones.forEach(asignacion => {
      if (asignacion.especialidades && Array.isArray(asignacion.especialidades)) {
        asignacion.especialidades.forEach(esp => {
          especialidadesSet.add(esp);
        });
      }
    });

    const especialidades = Array.from(especialidadesSet);

    res.status(200).json({
      success: true,
      especialidades
    });
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener especialidades asignadas',
      error: error.message
    });
  }
};

/**
 * Coordinador se asigna profesionales (auto-asignación)
 * POST /api/coordinador/asignar-profesional
 * Body: { profesionalIds: [Array de IDs], especialidades: [Array], criterio: 'manual' }
 */
exports.autoAsignarProfesionales = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalIds, especialidades, criterio, notas } = req.body;

    // Validar que el usuario es coordinador
    const coordinador = await UsuariosUcad.findById(coordinadorId);
    if (!coordinador || (!coordinador.esCoordinador && coordinador.rol !== 'coordinador')) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos de coordinador'
      });
    }

    // Validar que los profesionales existen
    if (profesionalIds && profesionalIds.length > 0) {
      const profesionales = await UsuariosUcad.find({
        _id: { $in: profesionalIds },
        $or: [{ rol: 'profesional' }, { esProfesional: true }]
      });

      if (profesionales.length !== profesionalIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunos profesionales no son válidos'
        });
      }
    }

    // Buscar si ya existe una asignación activa para este coordinador
    let asignacion = await CoordinadorAsignacion.findOne({
      coordinador: coordinadorId,
      activo: true
    });

    if (asignacion) {
      // Actualizar asignación existente
      if (profesionalIds && profesionalIds.length > 0) {
        // Agregar nuevos profesionales sin duplicar
        profesionalIds.forEach(profId => {
          if (!asignacion.profesionales.includes(profId)) {
            asignacion.profesionales.push(profId);
          }
        });
      }

      if (especialidades && especialidades.length > 0) {
        especialidades.forEach(esp => {
          if (!asignacion.especialidades.includes(esp)) {
            asignacion.especialidades.push(esp);
          }
        });
      }

      if (criterio) asignacion.criterioAsignacion = criterio;
      if (notas) asignacion.notas = notas;

      await asignacion.save();
    } else {
      // Crear nueva asignación
      asignacion = new CoordinadorAsignacion({
        coordinador: coordinadorId,
        profesionales: profesionalIds || [],
        especialidades: especialidades || [],
        criterioAsignacion: criterio || 'manual',
        asignadoPor: coordinadorId, // Auto-asignado
        notas: notas || ''
      });

      await asignacion.save();
    }

    // Actualizar agendas de los profesionales para incluir al coordinador
    if (profesionalIds && profesionalIds.length > 0) {
      await AgendaUCAD.updateMany(
        { profesional: { $in: profesionalIds } },
        {
          $addToSet: { coordinadores: coordinadorId },
          $set: { bloqueadaParaProfesional: true }
        }
      );
    }

    const asignacionPopulada = await CoordinadorAsignacion.findById(asignacion._id)
      .populate('profesionales', 'nombre apellido email especialidad imgUrl')
      .populate('coordinador', 'nombre apellido email');

    res.status(201).json({
      success: true,
      message: 'Profesionales asignados exitosamente',
      asignacion: asignacionPopulada
    });
  } catch (error) {
    console.error('Error al auto-asignar profesionales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar profesionales',
      error: error.message
    });
  }
};

/**
 * Desasignar un profesional
 * DELETE /api/coordinador/desasignar-profesional/:profesionalId
 */
exports.desasignarProfesional = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId } = req.params;

    const asignacion = await CoordinadorAsignacion.findOne({
      coordinador: coordinadorId,
      activo: true
    });

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la asignación'
      });
    }

    // Remover profesional del array
    asignacion.profesionales = asignacion.profesionales.filter(
      p => p.toString() !== profesionalId
    );

    await asignacion.save();

    // Remover coordinador de la agenda del profesional
    await AgendaUCAD.updateOne(
      { profesional: profesionalId },
      { $pull: { coordinadores: coordinadorId } }
    );

    res.status(200).json({
      success: true,
      message: 'Profesional desasignado exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desasignar profesional',
      error: error.message
    });
  }
};

/**
 * Obtener agenda de un profesional asignado
 * GET /api/coordinador/agenda/:profesionalId
 */
exports.obtenerAgendaProfesional = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const { profesionalId } = req.params;

    // Permitir acceso si es el propio profesional viendo su agenda
    const esPropiosProfesional = usuarioId === profesionalId;

    // Si no es su propia agenda, verificar que sea coordinador con asignación
    if (!esPropiosProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: usuarioId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId })
      .populate('profesional', 'nombre apellido email especialidad')
      .populate('coordinadores', 'nombre apellido')
      .populate('ultimaModificacionPor', 'nombre apellido');

    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      agenda
    });
  } catch (error) {
    console.error('Error al obtener agenda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener agenda',
      error: error.message
    });
  }
};

/**
 * Obtener horarios de un mes específico
 * GET /api/coordinador/agenda/:profesionalId/mes/:ano/:mes
 */
exports.obtenerHorariosMes = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const { profesionalId, ano, mes } = req.params;

    console.log('\n========== OBTENER HORARIOS MES ==========');
    console.log('Usuario ID:', usuarioId);
    console.log('Profesional ID:', profesionalId);
    console.log('Año:', ano, 'Mes:', mes);

    // Permitir acceso si es el propio profesional viendo su agenda
    const esPropiosProfesional = usuarioId === profesionalId;
    console.log('Es propio profesional:', esPropiosProfesional);

    // Si no es su propia agenda, verificar que sea coordinador con asignación
    if (!esPropiosProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: usuarioId,
        profesionales: profesionalId,
        activo: true
      });

      console.log('Asignación encontrada:', asignacion ? 'SÍ' : 'NO');

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
    if (!agenda) {
      console.log('❌ Agenda no encontrada para profesional:', profesionalId);
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    console.log('✓ Agenda encontrada:', agenda._id);
    console.log('  - Bloque:', agenda.bloque);
    console.log('  - Status:', agenda.status);
    console.log('  - PlantillaBase:', JSON.stringify(agenda.plantillaBase, null, 2));
    console.log('  - HorariosPorFecha length:', (agenda.horariosPorFecha || []).length);

    // Log de fechas guardadas
    if (agenda.horariosPorFecha && agenda.horariosPorFecha.length > 0) {
      console.log('  - Fechas guardadas en horariosPorFecha:');
      agenda.horariosPorFecha.forEach((h, idx) => {
        const fechaNormalizada = h.fecha.split('T')[0];
        console.log(`    [${idx}] Fecha: ${fechaNormalizada}, Horarios: ${h.horarios ? h.horarios.length : 0}`);
      });
    }

    console.log('  - Excepciones length:', (agenda.excepciones || []).length);

    // Construir fecha inicio y fin del mes
    const fechaInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
    const fechaFin = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

    console.log('Rango de fechas:', fechaInicio, '-', fechaFin);

    // Filtrar horarios del mes (normalizar fechas para comparación)
    const horariosMes = (agenda.horariosPorFecha || [])
      .filter(h => {
        const fechaNormalizada = h.fecha.split('T')[0];
        return fechaNormalizada >= fechaInicio && fechaNormalizada <= fechaFin;
      })
      .map(h => ({
        ...h.toObject ? h.toObject() : h,
        fecha: h.fecha.split('T')[0] // Normalizar fecha sin timestamp
      }));

    console.log('Horarios del mes filtrados:', horariosMes.length);

    // Filtrar excepciones del mes
    const excepcionesMes = (agenda.excepciones || []).filter(e => {
      const fechaExcepcion = new Date(e.fecha).toISOString().split('T')[0];
      return fechaExcepcion >= fechaInicio && fechaExcepcion <= fechaFin;
    });

    console.log('Excepciones del mes filtradas:', excepcionesMes.length);

    const response = {
      success: true,
      bloque: agenda.bloque,
      plantillaBase: agenda.plantillaBase,
      horariosMes,
      excepciones: excepcionesMes
    };

    console.log('Respuesta enviada - plantillaBase:', response.plantillaBase);
    console.log('==========================================\n');

    res.status(200).json(response);
  } catch (error) {
    console.error('Error al obtener horarios del mes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios del mes',
      error: error.message
    });
  }
};

/**
 * Guardar/Actualizar horarios de una fecha específica
 * POST /api/coordinador/agenda/:profesionalId/fecha
 * Body: { fecha, horarios, ocupados, notas }
 */
exports.guardarHorariosFecha = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId } = req.params;
    const { fecha, horarios, bloques, ocupados, notas, slotsBloqueados } = req.body;

    console.log('\n========== GUARDAR HORARIOS FECHA ==========');
    console.log('Coordinador ID:', coordinadorId);
    console.log('Profesional ID:', profesionalId);
    console.log('Fecha:', fecha);
    console.log('Horarios:', horarios);
    console.log('Bloques:', bloques);
    console.log('Ocupados:', ocupados);
    console.log('SlotsBloqueados:', slotsBloqueados);
    console.log('Notas:', notas);

    // Verificar permisos
    // Permitir si es el mismo profesional (auto-gestión) o tiene asignación
    const esPropioProfesional = coordinadorId === profesionalId;

    console.log('Es propio profesional:', esPropioProfesional);

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      console.log('Asignación encontrada:', asignacion ? 'SÍ' : 'NO');

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    } else {
      console.log('✓ Coordinador gestionando su propia agenda (auto-gestión)');
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
    if (!agenda) {
      console.log('❌ Agenda no encontrada');
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    console.log('✓ Agenda encontrada:', agenda._id);

    if (!agenda.horariosPorFecha) {
      agenda.horariosPorFecha = [];
    }

    // Normalizar fecha (solo YYYY-MM-DD sin hora)
    const fechaNormalizada = fecha.split('T')[0];
    console.log('Fecha normalizada:', fechaNormalizada);

    // Buscar si ya existe configuración para esta fecha
    const indiceExistente = agenda.horariosPorFecha.findIndex(
      h => h.fecha.split('T')[0] === fechaNormalizada
    );

    console.log('Índice existente:', indiceExistente);

    const configuracionFecha = {
      fecha: fechaNormalizada,
      horarios: horarios || [],
      bloques: bloques || [],
      ocupados: ocupados || [],
      slotsBloqueados: slotsBloqueados || [],
      notas: notas || ''
    };

    console.log('Configuración a guardar:', configuracionFecha);

    // Solo guardar si tiene horarios (no guardar días vacíos)
    if (horarios && horarios.length > 0) {
      if (indiceExistente >= 0) {
        // Actualizar existente
        console.log('Actualizando configuración existente');
        agenda.horariosPorFecha[indiceExistente] = configuracionFecha;
      } else {
        // Agregar nuevo
        console.log('Agregando nueva configuración');
        agenda.horariosPorFecha.push(configuracionFecha);
      }
    } else if (indiceExistente >= 0) {
      // Si no tiene horarios y existía, eliminarlo
      console.log('Eliminando configuración sin horarios');
      agenda.horariosPorFecha.splice(indiceExistente, 1);
    }

    agenda.ultimaModificacionPor = coordinadorId;
    agenda.ultimaModificacion = new Date();
    await agenda.save();

    console.log('✓ Agenda guardada correctamente');
    console.log('Total de fechas configuradas:', agenda.horariosPorFecha.length);
    console.log('==========================================\n');

    res.status(200).json({
      success: true,
      message: 'Horarios guardados correctamente',
      horariosPorFecha: agenda.horariosPorFecha
    });
  } catch (error) {
    console.error('Error al guardar horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar horarios',
      error: error.message
    });
  }
};

/**
 * Copiar horarios de una fecha a otra(s)
 * POST /api/coordinador/agenda/:profesionalId/copiar-horarios
 * Body: { fechaOrigen, fechasDestino: [] }
 */
exports.copiarHorarios = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId } = req.params;
    const { fechaOrigen, fechasDestino } = req.body;

    // Verificar permisos - Permitir auto-gestión
    const esPropioProfesional = coordinadorId === profesionalId;

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    if (!agenda.horariosPorFecha) {
      agenda.horariosPorFecha = [];
    }

    // Buscar configuración origen
    const configOrigen = agenda.horariosPorFecha.find(h => h.fecha === fechaOrigen);
    if (!configOrigen) {
      return res.status(404).json({
        success: false,
        message: 'No hay configuración en la fecha origen'
      });
    }

    // Copiar a cada fecha destino
    fechasDestino.forEach(fechaDestino => {
      const indiceExistente = agenda.horariosPorFecha.findIndex(
        h => h.fecha === fechaDestino
      );

      const nuevaConfig = {
        fecha: fechaDestino,
        horarios: [...configOrigen.horarios],
        ocupados: [...(configOrigen.ocupados || [])],
        notas: configOrigen.notas || ''
      };

      if (indiceExistente >= 0) {
        agenda.horariosPorFecha[indiceExistente] = nuevaConfig;
      } else {
        agenda.horariosPorFecha.push(nuevaConfig);
      }
    });

    agenda.ultimaModificacionPor = coordinadorId;
    agenda.ultimaModificacion = new Date();
    await agenda.save();

    res.status(200).json({
      success: true,
      message: `Horarios copiados a ${fechasDestino.length} fecha(s)`,
      horariosPorFecha: agenda.horariosPorFecha
    });
  } catch (error) {
    console.error('Error al copiar horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al copiar horarios',
      error: error.message
    });
  }
};

/**
 * Aplicar plantilla base a múltiples fechas
 * POST /api/coordinador/agenda/:profesionalId/aplicar-plantilla
 * Body: { fechas: [], plantilla: { horarios, ocupados } }
 */
exports.aplicarPlantillaAFechas = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId } = req.params;
    const { fechas, plantilla } = req.body;

    // Verificar permisos - Permitir auto-gestión
    const esPropioProfesional = coordinadorId === profesionalId;

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    if (!agenda.horariosPorFecha) {
      agenda.horariosPorFecha = [];
    }

    // Aplicar plantilla a cada fecha
    fechas.forEach(fecha => {
      const indiceExistente = agenda.horariosPorFecha.findIndex(
        h => h.fecha === fecha
      );

      const nuevaConfig = {
        fecha,
        horarios: [...(plantilla.horarios || [])],
        ocupados: [...(plantilla.ocupados || [])],
        notas: ''
      };

      if (indiceExistente >= 0) {
        agenda.horariosPorFecha[indiceExistente] = nuevaConfig;
      } else {
        agenda.horariosPorFecha.push(nuevaConfig);
      }
    });

    agenda.ultimaModificacionPor = coordinadorId;
    agenda.ultimaModificacion = new Date();
    await agenda.save();

    res.status(200).json({
      success: true,
      message: `Plantilla aplicada a ${fechas.length} fecha(s)`,
      horariosPorFecha: agenda.horariosPorFecha
    });
  } catch (error) {
    console.error('Error al aplicar plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aplicar plantilla',
      error: error.message
    });
  }
};

/**
 * Editar agenda de un profesional asignado por período
 * PUT /api/coordinador/agenda/:profesionalId/periodo
 * Body: { periodo: 'dia'|'semana'|'mes'|'trimestre', fechaInicio, configuracion, motivo }
 *
 * IMPORTANTE: Esta función cancela automáticamente las citas que queden fuera del nuevo horario
 */
exports.editarAgendaPorPeriodo = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId } = req.params;
    const { periodo, fechaInicio, dias, horaInicio, horaFin, bloque, horariosDisponibles, horariosOcupados, motivo } = req.body;

    // Verificar permisos - Permitir auto-gestión
    const esPropioProfesional = coordinadorId === profesionalId;

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId })
      .populate('profesional', 'nombre apellido email especialidad');

    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    const profesional = agenda.profesional;
    const coordinador = await UsuariosUcad.findById(coordinadorId);

    // PASO 1: Detectar qué horarios se eliminan o bloquean
    const horariosAnteriores = new Set();
    const horariosNuevos = new Set();

    // Construir set de horarios anteriores disponibles
    if (agenda.horariosDisponibles && Array.isArray(agenda.horariosDisponibles)) {
      agenda.horariosDisponibles.forEach(diaConfig => {
        if (diaConfig.horarios && Array.isArray(diaConfig.horarios)) {
          diaConfig.horarios.forEach(hora => {
            horariosAnteriores.add(`${diaConfig.dia}-${hora}`);
          });
        }
      });
    }

    // Construir set de horarios nuevos disponibles
    if (horariosDisponibles && Array.isArray(horariosDisponibles)) {
      horariosDisponibles.forEach(diaConfig => {
        if (diaConfig.horarios && Array.isArray(diaConfig.horarios)) {
          diaConfig.horarios.forEach(hora => {
            horariosNuevos.add(`${diaConfig.dia}-${hora}`);
          });
        }
      });
    }

    // Detectar horarios que se eliminaron
    const horariosEliminados = [...horariosAnteriores].filter(h => !horariosNuevos.has(h));

    // PASO 2: Buscar citas futuras afectadas por los cambios
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const citasFuturas = await CitasUCAD.find({
      profesional: profesionalId,
      fecha: { $gte: hoy },
      estado: { $in: ['pendiente', 'confirmada'] }
    }).populate('deportista', 'nombre apellido email');

    const citasAfectadas = [];
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

    citasFuturas.forEach(cita => {
      const fechaCita = new Date(cita.fecha);
      const diaSemana = diasSemana[fechaCita.getDay()].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const horaCita = `${String(fechaCita.getHours()).padStart(2, '0')}:${String(fechaCita.getMinutes()).padStart(2, '0')}`;
      const keyHorario = `${diaSemana}-${horaCita}`;

      // Verificar si el horario fue eliminado
      if (horariosEliminados.includes(keyHorario)) {
        citasAfectadas.push(cita);
      }
    });

    // PASO 3: Cancelar citas afectadas y notificar a deportistas
    const citasCanceladas = [];
    const motivoCancelacion = motivo || `El profesional ${profesional.nombre} ${profesional.apellido} ha modificado su disponibilidad de agenda.`;

    for (const cita of citasAfectadas) {
      try {
        // Actualizar estado de la cita
        cita.estado = 'cancelada';
        cita.motivoCancelacion = motivoCancelacion;
        cita.canceladaPor = coordinadorId;
        cita.fechaCancelacion = new Date();
        await cita.save();

        citasCanceladas.push({
          _id: cita._id,
          deportista: cita.deportista,
          fecha: cita.fecha,
          especialidad: cita.especialidad
        });

        // TODO: Crear notificación para el deportista
        // const NotificacionUCAD = require('../ucad-notificaciones/notificaciones-ucad');
        // await NotificacionUCAD.create({
        //   usuario: cita.deportista._id,
        //   tipo: 'cita_cancelada',
        //   titulo: 'Cita Cancelada',
        //   mensaje: `Tu cita con ${profesional.nombre} ${profesional.apellido} ha sido cancelada por cambios en la agenda. Por favor, reagenda tu cita.`,
        //   metadata: { citaId: cita._id, profesionalId: profesionalId }
        // });

        // TODO: Enviar email al deportista
        // const emailService = require('../../../email/emailService');
        // await emailService.enviarEmailCitaCancelada({
        //   deportista: cita.deportista,
        //   profesional: profesional,
        //   cita: cita,
        //   motivo: motivoCancelacion
        // });

      } catch (errorCita) {
        console.error(`Error al cancelar cita ${cita._id}:`, errorCita);
      }
    }

    // PASO 4: Actualizar agenda
    const actualizaciones = {
      ultimaModificacionPor: coordinadorId,
      ultimaModificacion: new Date(),
      bloqueadaParaProfesional: true
    };

    if (dias) actualizaciones.dias = dias;
    if (horaInicio) actualizaciones.horaInicio = horaInicio;
    if (horaFin) actualizaciones.horaFin = horaFin;
    if (bloque) actualizaciones.bloque = bloque;
    if (horariosDisponibles) actualizaciones.horariosDisponibles = horariosDisponibles;
    if (horariosOcupados) actualizaciones.horariosOcupados = horariosOcupados;

    Object.assign(agenda, actualizaciones);
    await agenda.save();

    const agendaActualizada = await AgendaUCAD.findById(agenda._id)
      .populate('profesional', 'nombre apellido email especialidad')
      .populate('coordinadores', 'nombre apellido')
      .populate('ultimaModificacionPor', 'nombre apellido');

    res.status(200).json({
      success: true,
      message: `Agenda actualizada para el período: ${periodo}`,
      agenda: agendaActualizada,
      citasCanceladas: citasCanceladas.length,
      citasAfectadas: citasCanceladas.map(c => ({
        id: c._id,
        deportista: `${c.deportista.nombre} ${c.deportista.apellido}`,
        fecha: c.fecha,
        especialidad: c.especialidad
      })),
      advertencia: citasCanceladas.length > 0
        ? `Se cancelaron ${citasCanceladas.length} cita(s) que quedaron fuera del nuevo horario. Los deportistas deben reagendar.`
        : null
    });
  } catch (error) {
    console.error('Error al editar agenda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al editar agenda',
      error: error.message
    });
  }
};

/**
 * Agregar ajuste por rango de fechas
 * POST /api/coordinador/agenda/:profesionalId/ajuste-rango
 * Body: { fechaInicio, fechaFin, dias, horaInicio, horaFin, horariosDisponibles, horariosOcupados }
 */
exports.gestionarAjusteRango = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId } = req.params;
    const { fechaInicio, fechaFin, dias, horaInicio, horaFin, horariosDisponibles, horariosOcupados } = req.body;

    // Verificar permisos - Permitir auto-gestión
    const esPropioProfesional = coordinadorId === profesionalId;

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    const nuevoAjuste = {
      fechaInicio,
      fechaFin,
      dias: dias || [],
      horaInicio,
      horaFin,
      horariosDisponibles: horariosDisponibles || [],
      horariosOcupados: horariosOcupados || []
    };

    // Inicializar array si no existe
    if (!agenda.ajustesPorRango) {
      agenda.ajustesPorRango = [];
    }
    agenda.ajustesPorRango.push(nuevoAjuste);

    agenda.ultimaModificacionPor = coordinadorId;
    agenda.ultimaModificacion = new Date();
    await agenda.save();

    res.status(200).json({
      success: true,
      message: 'Ajuste por rango guardado correctamente',
      ajustesPorRango: agenda.ajustesPorRango
    });
  } catch (error) {
    console.error('Error al gestionar ajuste por rango:', error);
    res.status(500).json({
      success: false,
      message: 'Error al gestionar ajuste por rango',
      error: error.message
    });
  }
};

/**
 * Eliminar ajuste por rango
 * DELETE /api/coordinador/agenda/:profesionalId/ajuste-rango/:ajusteId
 */
exports.eliminarAjusteRango = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId, ajusteId } = req.params;

    // Verificar permisos - Permitir auto-gestión
    const esPropioProfesional = coordinadorId === profesionalId;

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    if (!agenda.ajustesPorRango) {
      agenda.ajustesPorRango = [];
    }

    agenda.ajustesPorRango = agenda.ajustesPorRango.filter(
      a => a._id.toString() !== ajusteId
    );

    agenda.ultimaModificacionPor = coordinadorId;
    agenda.ultimaModificacion = new Date();
    await agenda.save();

    res.status(200).json({
      success: true,
      message: 'Ajuste por rango eliminado',
      ajustesPorRango: agenda.ajustesPorRango
    });
  } catch (error) {
    console.error('Error al eliminar ajuste por rango:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar ajuste por rango',
      error: error.message
    });
  }
};

/**
 * Crear excepción (bloqueo por fecha específica)
 * POST /api/coordinador/agenda/:profesionalId/excepcion
 * Body: { fecha, tipo, motivo, descripcion, horaInicio?, horaFin?, horariosDisponibles?, horariosOcupados? }
 */
exports.crearExcepcion = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId } = req.params;
    const { fecha, tipo, motivo, descripcion, horaInicio, horaFin, horariosDisponibles, horariosOcupados } = req.body;

    // Verificar permisos - Permitir auto-gestión
    const esPropioProfesional = coordinadorId === profesionalId;

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId })
      .populate('profesional', 'nombre apellido email');

    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    const profesional = agenda.profesional;

    // Crear la excepción
    const excepcion = {
      fecha,
      tipo,
      motivo,
      descripcion,
      creadaPor: coordinadorId,
      fechaCreacion: new Date()
    };

    if (tipo === 'bloqueo_parcial') {
      excepcion.horaInicio = horaInicio;
      excepcion.horaFin = horaFin;
    } else if (tipo === 'cambio_horario') {
      excepcion.horariosDisponibles = horariosDisponibles || [];
      excepcion.horariosOcupados = horariosOcupados || [];
    }

    // Agregar la excepción
    agenda.excepciones.push(excepcion);

    // CANCELAR CITAS AFECTADAS POR LA EXCEPCIÓN
    const fechaExcepcion = new Date(fecha);
    fechaExcepcion.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const citasDelDia = await CitasUCAD.find({
      profesional: profesionalId,
      fecha: { $gte: fechaExcepcion, $lte: fechaFin },
      estado: { $in: ['pendiente', 'confirmada'] }
    }).populate('deportista', 'nombre apellido email');

    const citasCanceladas = [];
    const motivoCancelacion = descripcion || `${motivo} - ${profesional.nombre} ${profesional.apellido}`;

    for (const cita of citasDelDia) {
      let debeCancelar = false;

      if (tipo === 'bloqueo_completo') {
        debeCancelar = true;
      } else if (tipo === 'bloqueo_parcial') {
        const fechaCita = new Date(cita.fecha);
        const horaCita = `${String(fechaCita.getHours()).padStart(2, '0')}:${String(fechaCita.getMinutes()).padStart(2, '0')}`;

        // Verificar si la cita cae dentro del rango bloqueado
        if (horaCita >= horaInicio && horaCita < horaFin) {
          debeCancelar = true;
        }
      } else if (tipo === 'cambio_horario') {
        const fechaCita = new Date(cita.fecha);
        const horaCita = `${String(fechaCita.getHours()).padStart(2, '0')}:${String(fechaCita.getMinutes()).padStart(2, '0')}`;

        // Verificar si la hora de la cita está en los nuevos horarios disponibles
        const estaDisponible = horariosDisponibles && horariosDisponibles.includes(horaCita);
        if (!estaDisponible) {
          debeCancelar = true;
        }
      }

      if (debeCancelar) {
        cita.estado = 'cancelada';
        cita.motivoCancelacion = motivoCancelacion;
        cita.canceladaPor = coordinadorId;
        cita.fechaCancelacion = new Date();
        await cita.save();

        citasCanceladas.push({
          _id: cita._id,
          deportista: cita.deportista,
          fecha: cita.fecha,
          especialidad: cita.especialidad
        });
      }
    }

    agenda.ultimaModificacionPor = coordinadorId;
    agenda.ultimaModificacion = new Date();
    await agenda.save();

    res.status(200).json({
      success: true,
      message: 'Excepción creada correctamente',
      excepcion,
      excepciones: agenda.excepciones,
      citasCanceladas: citasCanceladas.length,
      citasAfectadas: citasCanceladas.map(c => ({
        id: c._id,
        deportista: `${c.deportista.nombre} ${c.deportista.apellido}`,
        fecha: c.fecha,
        especialidad: c.especialidad
      })),
      advertencia: citasCanceladas.length > 0
        ? `Se cancelaron ${citasCanceladas.length} cita(s) por esta excepción.`
        : null
    });
  } catch (error) {
    console.error('Error al crear excepción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear excepción',
      error: error.message
    });
  }
};

/**
 * Eliminar excepción
 * DELETE /api/coordinador/agenda/:profesionalId/excepcion/:excepcionId
 */
exports.eliminarExcepcion = async (req, res) => {
  try {
    const coordinadorId = req.usuarioId;
    const { profesionalId, excepcionId } = req.params;

    // Verificar permisos - Permitir auto-gestión
    const esPropioProfesional = coordinadorId === profesionalId;

    if (!esPropioProfesional) {
      const asignacion = await CoordinadorAsignacion.findOne({
        coordinador: coordinadorId,
        profesionales: profesionalId,
        activo: true
      });

      if (!asignacion) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar esta agenda'
        });
      }
    }

    const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda no encontrada'
      });
    }

    agenda.excepciones = agenda.excepciones.filter(
      e => e._id.toString() !== excepcionId
    );

    agenda.ultimaModificacionPor = coordinadorId;
    agenda.ultimaModificacion = new Date();
    await agenda.save();

    res.status(200).json({
      success: true,
      message: 'Excepción eliminada',
      excepciones: agenda.excepciones
    });
  } catch (error) {
    console.error('Error al eliminar excepción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar excepción',
      error: error.message
    });
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Admin obtiene todos los coordinadores
 * GET /api/admin/coordinadores
 */
exports.obtenerTodosCoordinadores = async (req, res) => {
  try {
    const coordinadores = await UsuariosUcad.find({
      $or: [{ rol: 'coordinador' }, { esCoordinador: true }]
    }).select('-password');

    // Agregar conteo de profesionales asignados para cada coordinador
    const coordinadoresConConteo = await Promise.all(
      coordinadores.map(async (coord) => {
        const asignaciones = await CoordinadorAsignacion.find({
          coordinador: coord._id,
          activo: true
        });

        // Contar profesionales únicos
        const profesionalesSet = new Set();
        asignaciones.forEach(asignacion => {
          asignacion.profesionales.forEach(profId => {
            profesionalesSet.add(profId.toString());
          });
        });

        return {
          ...coord.toObject(),
          profesionalesAsignados: profesionalesSet.size
        };
      })
    );

    res.status(200).json({
      success: true,
      coordinadores: coordinadoresConConteo
    });
  } catch (error) {
    console.error('Error al obtener coordinadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener coordinadores',
      error: error.message
    });
  }
};

/**
 * Admin asigna profesionales a un coordinador
 * POST /api/admin/coordinador/asignar
 * Body: { coordinadorId, profesionalIds, especialidades, criterio }
 */
exports.adminAsignarProfesionales = async (req, res) => {
  try {
    const adminId = req.usuarioId;
    const { coordinadorId, profesionalIds, especialidades, criterio, notas } = req.body;

    // Validar que el coordinador existe
    const coordinador = await UsuariosUcad.findById(coordinadorId);
    if (!coordinador || (!coordinador.esCoordinador && coordinador.rol !== 'coordinador')) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no es coordinador'
      });
    }

    // Construir lista de profesionales a asignar
    let profesionalesAAsignar = [];

    // 1. Validar y agregar profesionales seleccionados manualmente
    if (profesionalIds && profesionalIds.length > 0) {
      const profesionales = await UsuariosUcad.find({
        _id: { $in: profesionalIds },
        $or: [{ rol: 'profesional' }, { esProfesional: true }]
      });

      if (profesionales.length !== profesionalIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunos profesionales no son válidos'
        });
      }

      profesionalesAAsignar = profesionales.map(p => p._id.toString());
    }

    // 2. Buscar y agregar profesionales por especialidad
    if (especialidades && especialidades.length > 0) {
      const profesionalesPorEspecialidad = await UsuariosUcad.find({
        especialidad: { $in: especialidades },
        $or: [{ rol: 'profesional' }, { esProfesional: true }]
      });

      profesionalesPorEspecialidad.forEach(prof => {
        const profId = prof._id.toString();
        if (!profesionalesAAsignar.includes(profId)) {
          profesionalesAAsignar.push(profId);
        }
      });
    }

    // Buscar o crear asignación
    let asignacion = await CoordinadorAsignacion.findOne({
      coordinador: coordinadorId,
      activo: true
    });

    if (asignacion) {
      // Actualizar asignación existente
      if (profesionalesAAsignar.length > 0) {
        profesionalesAAsignar.forEach(profId => {
          if (!asignacion.profesionales.some(p => p.toString() === profId)) {
            asignacion.profesionales.push(profId);
          }
        });
      }

      if (especialidades && especialidades.length > 0) {
        especialidades.forEach(esp => {
          if (!asignacion.especialidades.includes(esp)) {
            asignacion.especialidades.push(esp);
          }
        });
      }

      if (criterio) asignacion.criterioAsignacion = criterio;
      if (notas) asignacion.notas = notas;
      asignacion.asignadoPor = adminId;

      await asignacion.save();
    } else {
      asignacion = new CoordinadorAsignacion({
        coordinador: coordinadorId,
        profesionales: profesionalesAAsignar,
        especialidades: especialidades || [],
        criterioAsignacion: criterio || 'manual',
        asignadoPor: adminId,
        notas: notas || ''
      });

      await asignacion.save();
    }

    // Actualizar agendas de todos los profesionales asignados
    if (profesionalesAAsignar.length > 0) {
      await AgendaUCAD.updateMany(
        { profesional: { $in: profesionalesAAsignar } },
        {
          $addToSet: { coordinadores: coordinadorId },
          $set: { bloqueadaParaProfesional: true }
        }
      );
    }

    const asignacionPopulada = await CoordinadorAsignacion.findById(asignacion._id)
      .populate('profesionales', 'nombre apellido email especialidad imgUrl')
      .populate('coordinador', 'nombre apellido email')
      .populate('asignadoPor', 'nombre apellido');

    res.status(201).json({
      success: true,
      message: 'Profesionales asignados exitosamente por admin',
      asignacion: asignacionPopulada
    });
  } catch (error) {
    console.error('Error al asignar profesionales (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar profesionales',
      error: error.message
    });
  }
};

/**
 * Admin obtiene todas las asignaciones
 * GET /api/admin/asignaciones
 */
exports.obtenerTodasAsignaciones = async (req, res) => {
  try {
    const asignaciones = await CoordinadorAsignacion.find({ activo: true })
      .populate('coordinador', 'nombre apellido email especialidad')
      .populate('profesionales', 'nombre apellido email especialidad')
      .populate('asignadoPor', 'nombre apellido');

    res.status(200).json({
      success: true,
      asignaciones
    });
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asignaciones',
      error: error.message
    });
  }
};

/**
 * Admin modifica permisos de un coordinador
 * PUT /api/admin/coordinador/:id/permisos
 * Body: { esCoordinador, esProfesional }
 */
exports.modificarPermisosCoordinador = async (req, res) => {
  try {
    const { id } = req.params;
    const { esCoordinador, esProfesional, rol } = req.body;

    const usuario = await UsuariosUcad.findById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (typeof esCoordinador !== 'undefined') usuario.esCoordinador = esCoordinador;
    if (typeof esProfesional !== 'undefined') usuario.esProfesional = esProfesional;
    if (rol) usuario.rol = rol;

    await usuario.save();

    res.status(200).json({
      success: true,
      message: 'Permisos actualizados exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        esCoordinador: usuario.esCoordinador,
        esProfesional: usuario.esProfesional
      }
    });
  } catch (error) {
    console.error('Error al modificar permisos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al modificar permisos',
      error: error.message
    });
  }
};

module.exports = exports;
