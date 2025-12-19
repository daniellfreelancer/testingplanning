const AgendaUCAD = require('./agenda-ucad');
const UsuariosUcad = require('../ucad-usuarios/usuarios-ucad');
const CitasUcad = require('../ucad-citas/citas-ucad');

const agendaUcadController = {
  /**
   * Crear agenda para un profesional
   * POST /crear-agenda
   * Body: { profesional, dias, horaInicio, horaFin, status }
   */
  crearAgenda: async (req, res) => {
    try {
      const { profesional, dias, horaInicio, horaFin, status = true } = req.body;

      // Validar campos requeridos
      if (!profesional || !dias || !horaInicio || !horaFin) {
        return res.status(400).json({
          message: "Los campos profesional, dias, horaInicio y horaFin son requeridos"
        });
      }

      // Validar que el profesional existe y tiene rol 'profesional'
      const profesionalExiste = await UsuariosUcad.findById(profesional);
      if (!profesionalExiste) {
        return res.status(404).json({
          message: "Profesional no encontrado"
        });
      }

      if (profesionalExiste.rol !== 'profesional') {
        return res.status(400).json({
          message: "El usuario debe tener rol 'profesional'"
        });
      }

      // Validar formato de horas (HH:mm)
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
        return res.status(400).json({
          message: "Formato de hora inválido. Use HH:mm (ej: 09:00, 17:00)"
        });
      }

      // Validar que horaInicio < horaFin
      const [horaInicioNum, minutoInicioNum] = horaInicio.split(':').map(Number);
      const [horaFinNum, minutoFinNum] = horaFin.split(':').map(Number);
      const inicioTotal = horaInicioNum * 60 + minutoInicioNum;
      const finTotal = horaFinNum * 60 + minutoFinNum;

      if (inicioTotal >= finTotal) {
        return res.status(400).json({
          message: "La hora de inicio debe ser menor que la hora de fin"
        });
      }

      // Validar días de la semana
      const diasValidos = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
      const diasNormalizados = dias.map(dia => {
        const diaLower = dia.toLowerCase();
        if (diaLower === 'miercoles') return 'miércoles';
        if (diaLower === 'sabado') return 'sábado';
        return diaLower;
      });

      const diasInvalidos = diasNormalizados.filter(dia => !diasValidos.includes(dia));
      if (diasInvalidos.length > 0) {
        return res.status(400).json({
          message: `Días inválidos: ${diasInvalidos.join(', ')}`
        });
      }

      // Verificar si ya existe una agenda para este profesional
      const agendaExistente = await AgendaUCAD.findOne({ profesional });
      if (agendaExistente) {
        return res.status(400).json({
          message: "Ya existe una agenda para este profesional. Use actualizar-agenda para modificarla"
        });
      }

      // Crear nueva agenda
      const nuevaAgenda = new AgendaUCAD({
        profesional,
        dias: diasNormalizados,
        horaInicio,
        horaFin,
        status
      });

      await nuevaAgenda.save();

      // Actualizar referencia en el usuario
      profesionalExiste.agenda = nuevaAgenda._id;
      await profesionalExiste.save();

      res.status(201).json({
        message: "Agenda creada exitosamente",
        agenda: nuevaAgenda
      });
    } catch (error) {
      console.error('Error al crear agenda:', error);
      res.status(500).json({
        message: "Error al crear agenda",
        error: error.message
      });
    }
  },

  /**
   * Actualizar agenda existente
   * PUT /actualizar-agenda/:id
   */
  actualizarAgenda: async (req, res) => {
    try {
      const { id } = req.params;
      const { dias, horaInicio, horaFin, status } = req.body;

      const agenda = await AgendaUCAD.findById(id);
      if (!agenda) {
        return res.status(404).json({
          message: "Agenda no encontrada"
        });
      }

      // Validar formato de horas si se proporcionan
      if (horaInicio || horaFin) {
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const horaInicioFinal = horaInicio || agenda.horaInicio;
        const horaFinFinal = horaFin || agenda.horaFin;

        if (horaInicio && !horaRegex.test(horaInicio)) {
          return res.status(400).json({
            message: "Formato de horaInicio inválido. Use HH:mm"
          });
        }

        if (horaFin && !horaRegex.test(horaFin)) {
          return res.status(400).json({
            message: "Formato de horaFin inválido. Use HH:mm"
          });
        }

        // Validar que horaInicio < horaFin
        const [horaInicioNum, minutoInicioNum] = horaInicioFinal.split(':').map(Number);
        const [horaFinNum, minutoFinNum] = horaFinFinal.split(':').map(Number);
        const inicioTotal = horaInicioNum * 60 + minutoInicioNum;
        const finTotal = horaFinNum * 60 + minutoFinNum;

        if (inicioTotal >= finTotal) {
          return res.status(400).json({
            message: "La hora de inicio debe ser menor que la hora de fin"
          });
        }
      }

      // Actualizar campos
      if (dias) {
        const diasValidos = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
        const diasNormalizados = dias.map(dia => {
          const diaLower = dia.toLowerCase();
          if (diaLower === 'miercoles') return 'miércoles';
          if (diaLower === 'sabado') return 'sábado';
          return diaLower;
        });

        const diasInvalidos = diasNormalizados.filter(dia => !diasValidos.includes(dia));
        if (diasInvalidos.length > 0) {
          return res.status(400).json({
            message: `Días inválidos: ${diasInvalidos.join(', ')}`
          });
        }

        agenda.dias = diasNormalizados;
      }

      if (horaInicio) agenda.horaInicio = horaInicio;
      if (horaFin) agenda.horaFin = horaFin;
      if (status !== undefined) agenda.status = status;

      await agenda.save();

      res.status(200).json({
        message: "Agenda actualizada exitosamente",
        agenda
      });
    } catch (error) {
      console.error('Error al actualizar agenda:', error);
      res.status(500).json({
        message: "Error al actualizar agenda",
        error: error.message
      });
    }
  },

  /**
   * Obtener agenda de un profesional
   * GET /agenda-profesional/:profesionalId
   */
  obtenerAgendaProfesional: async (req, res) => {
    try {
      const { profesionalId } = req.params;

      const agenda = await AgendaUCAD.findOne({ profesional: profesionalId })
        .populate('profesional', 'nombre apellido email especialidad');

      if (!agenda) {
        return res.status(404).json({
          message: "No se encontró agenda para este profesional"
        });
      }

      res.status(200).json({
        agenda
      });
    } catch (error) {
      console.error('Error al obtener agenda:', error);
      res.status(500).json({
        message: "Error al obtener agenda",
        error: error.message
      });
    }
  },

  /**
   * Obtener horarios disponibles de un profesional en una fecha específica
   * GET /disponibilidad/:profesionalId/:fecha
   * fecha formato: YYYY-MM-DD
   */
  obtenerDisponibilidad: async (req, res) => {
    try {
      const { profesionalId, fecha } = req.params;

      // Validar que el profesional existe
      const profesional = await UsuariosUcad.findById(profesionalId);
      if (!profesional || profesional.rol !== 'profesional') {
        return res.status(404).json({
          message: "Profesional no encontrado"
        });
      }

      // Obtener agenda del profesional
      const agenda = await AgendaUCAD.findOne({ profesional: profesionalId });
      if (!agenda || !agenda.status) {
        return res.status(404).json({
          message: "El profesional no tiene agenda configurada o está inactiva"
        });
      }

      // Validar fecha
      const fechaDate = new Date(fecha);
      if (isNaN(fechaDate.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido. Use YYYY-MM-DD"
        });
      }

      // Obtener día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const diaSemana = diasSemana[fechaDate.getDay()];

      // Verificar que el día esté en la agenda
      if (!agenda.dias.includes(diaSemana)) {
        return res.status(400).json({
          message: `El profesional no atiende los ${diaSemana}s`
        });
      }

      // Generar bloques de 30 minutos desde horaInicio hasta horaFin
      const [horaInicioNum, minutoInicioNum] = agenda.horaInicio.split(':').map(Number);
      const [horaFinNum, minutoFinNum] = agenda.horaFin.split(':').map(Number);

      const bloquesDisponibles = [];
      let horaActual = horaInicioNum;
      let minutoActual = minutoInicioNum;

      while (horaActual < horaFinNum || (horaActual === horaFinNum && minutoActual < minutoFinNum)) {
        const horaFormato = `${String(horaActual).padStart(2, '0')}:${String(minutoActual).padStart(2, '0')}`;
        bloquesDisponibles.push(horaFormato);

        // Avanzar 30 minutos
        minutoActual += 30;
        if (minutoActual >= 60) {
          horaActual += 1;
          minutoActual = 0;
        }
      }

      // Obtener citas existentes para esta fecha
      const inicioDia = new Date(fechaDate);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fechaDate);
      finDia.setHours(23, 59, 59, 999);

      const citasExistentes = await CitasUcad.find({
        profesional: profesionalId,
        fecha: {
          $gte: inicioDia,
          $lte: finDia
        },
        estado: { $nin: ['cancelada'] }
      }).select('fecha duracion');

      // Marcar bloques ocupados
      const bloquesOcupados = new Set();
      citasExistentes.forEach(cita => {
        const fechaCita = new Date(cita.fecha);
        const horaCita = `${String(fechaCita.getHours()).padStart(2, '0')}:${String(fechaCita.getMinutes()).padStart(2, '0')}`;
        bloquesOcupados.add(horaCita);
      });

      // Filtrar bloques disponibles
      const horariosDisponibles = bloquesDisponibles.filter(bloque => !bloquesOcupados.has(bloque));

      res.status(200).json({
        profesional: {
          id: profesional._id,
          nombre: `${profesional.nombre} ${profesional.apellido}`,
          especialidad: profesional.especialidad
        },
        fecha: fecha,
        diaSemana: diaSemana,
        horariosDisponibles: horariosDisponibles,
        horariosOcupados: Array.from(bloquesOcupados),
        totalDisponibles: horariosDisponibles.length,
        totalOcupados: bloquesOcupados.size
      });
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      res.status(500).json({
        message: "Error al obtener disponibilidad",
        error: error.message
      });
    }
  }
};

module.exports = agendaUcadController;

