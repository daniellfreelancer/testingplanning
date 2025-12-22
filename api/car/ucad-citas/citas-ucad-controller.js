const CitasUcad = require('./citas-ucad');
const UsuariosUcad = require('../ucad-usuarios/usuarios-ucad');
const AgendaUCAD = require('../ucad-agenda/agenda-ucad');

const citasUcadController = {
  /**
   * Crear nueva cita
   * POST /crear-cita
   * Body: { deportista, profesional, especialidad, tipoCita, fecha, duracion, notas }
   */
  crearCita: async (req, res) => {
    try {
      const { deportista, profesional, especialidad, tipoCita, fecha, duracion = 30, notas } = req.body;

      // Validar campos requeridos
      if (!deportista || !profesional || !especialidad || !tipoCita || !fecha) {
        return res.status(400).json({
          message: "Los campos deportista, profesional, especialidad, tipoCita y fecha son requeridos"
        });
      }

      // Validar que el deportista existe
      const deportistaExiste = await UsuariosUcad.findById(deportista);
      if (!deportistaExiste || deportistaExiste.rol !== 'deportista') {
        return res.status(404).json({
          message: "Deportista no encontrado o no tiene rol válido"
        });
      }

      // Validar que el profesional existe
      const profesionalExiste = await UsuariosUcad.findById(profesional);
      if (!profesionalExiste || profesionalExiste.rol !== 'profesional') {
        return res.status(404).json({
          message: "Profesional no encontrado o no tiene rol válido"
        });
      }

      // Validar que el profesional tenga la especialidad correcta
      if (profesionalExiste.especialidad !== especialidad) {
        return res.status(400).json({
          message: "El profesional no tiene la especialidad seleccionada"
        });
      }

      // Validar que el profesional esté validado
      if (profesionalExiste.estadoValidacion !== 'validado') {
        return res.status(400).json({
          message: "El profesional no está validado"
        });
      }

      // Validar fecha
      const fechaCita = new Date(fecha);
      if (isNaN(fechaCita.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido"
        });
      }

      // Validar que la fecha no sea en el pasado
      if (fechaCita < new Date()) {
        return res.status(400).json({
          message: "No se pueden crear citas en el pasado"
        });
      }

      // Obtener agenda del profesional
      const agenda = await AgendaUCAD.findOne({ profesional });
      if (!agenda || !agenda.status) {
        return res.status(400).json({
          message: "El profesional no tiene agenda configurada o está inactiva"
        });
      }

      // Validar día de la semana
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const diaSemana = diasSemana[fechaCita.getDay()];
      if (!agenda.dias.includes(diaSemana)) {
        return res.status(400).json({
          message: `El profesional no atiende los ${diaSemana}s`
        });
      }

      // Validar horario dentro del rango de disponibilidad
      const horaCita = fechaCita.getHours();
      const minutoCita = fechaCita.getMinutes();
      const [horaInicioNum, minutoInicioNum] = agenda.horaInicio.split(':').map(Number);
      const [horaFinNum, minutoFinNum] = agenda.horaFin.split(':').map(Number);

      const horaCitaTotal = horaCita * 60 + minutoCita;
      const inicioTotal = horaInicioNum * 60 + minutoInicioNum;
      const finTotal = horaFinNum * 60 + minutoFinNum;

      if (horaCitaTotal < inicioTotal || horaCitaTotal >= finTotal) {
        return res.status(400).json({
          message: `El horario debe estar entre ${agenda.horaInicio} y ${agenda.horaFin}`
        });
      }

      // Validar que el horario esté en bloques de 30 minutos
      if (minutoCita !== 0 && minutoCita !== 30) {
        return res.status(400).json({
          message: "Las citas deben agendarse en bloques de 30 minutos (ej: 09:00, 09:30, 10:00)"
        });
      }

      // Verificar que no haya conflicto con otra cita
      const fechaFinCita = new Date(fechaCita);
      fechaFinCita.setMinutes(fechaFinCita.getMinutes() + duracion);

      const citaConflictiva = await CitasUcad.findOne({
        profesional,
        fecha: {
          $gte: fechaCita,
          $lt: fechaFinCita
        },
        estado: { $nin: ['cancelada'] }
      });

      if (citaConflictiva) {
        return res.status(400).json({
          message: "Ya existe una cita agendada en este horario"
        });
      }

      // Crear la cita
      const nuevaCita = new CitasUcad({
        deportista,
        profesional,
        especialidad,
        tipoCita,
        fecha: fechaCita,
        duracion,
        notas,
        estado: 'pendiente'
      });

      await nuevaCita.save();

      // Populate para respuesta
      await nuevaCita.populate('deportista', 'nombre apellido email');
      await nuevaCita.populate('profesional', 'nombre apellido email especialidad');

      res.status(201).json({
        message: "Cita creada exitosamente",
        cita: nuevaCita
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        message: "Error al crear cita",
        error: error.message
      });
    }
  },

  /**
   * Derivar cita a otro profesional
   * POST /derivar-cita
   * Body: { deportista, profesional, especialidad, fecha, duracion, derivadaPor, motivoDerivacion, notas }
   */
  derivarCita: async (req, res) => {
    try {
      const {
        deportista,
        profesional,
        especialidad,
        fecha,
        duracion = 30,
        derivadaPor,
        motivoDerivacion,
        notas,
      } = req.body;

      // Validar campos requeridos
      if (
        !deportista ||
        !profesional ||
        !especialidad ||
        !fecha ||
        !derivadaPor
      ) {
        return res.status(400).json({
          message:
            'Los campos deportista, profesional, especialidad, fecha y derivadaPor son requeridos',
        });
      }

      // Validar que el deportista existe
      const deportistaExiste = await UsuariosUcad.findById(deportista);
      if (!deportistaExiste || deportistaExiste.rol !== 'deportista') {
        return res.status(404).json({
          message: 'Deportista no encontrado o no tiene rol válido',
        });
      }

      // Validar que el profesional destinatario existe
      const profesionalDestino = await UsuariosUcad.findById(profesional);
      if (!profesionalDestino || profesionalDestino.rol !== 'profesional') {
        return res.status(404).json({
          message: 'Profesional destinatario no encontrado o no tiene rol válido',
        });
      }

      // Validar que el profesional que deriva existe
      const profesionalOrigen = await UsuariosUcad.findById(derivadaPor);
      if (!profesionalOrigen || profesionalOrigen.rol !== 'profesional') {
        return res.status(404).json({
          message:
            'Profesional que deriva no encontrado o no tiene rol válido',
        });
      }

      // Validar que el profesional destinatario tenga la especialidad correcta
      if (profesionalDestino.especialidad !== especialidad) {
        return res.status(400).json({
          message: 'El profesional destinatario no tiene la especialidad seleccionada',
        });
      }

      // Validar que el profesional destinatario esté validado
      if (profesionalDestino.estadoValidacion !== 'validado') {
        return res.status(400).json({
          message: 'El profesional destinatario no está validado',
        });
      }

      // Validar que el profesional que deriva esté validado
      if (profesionalOrigen.estadoValidacion !== 'validado') {
        return res.status(400).json({
          message: 'El profesional que deriva no está validado',
        });
      }

      // Validar que no se derive a sí mismo
      if (profesional.toString() === derivadaPor.toString()) {
        return res.status(400).json({
          message: 'No se puede derivar una cita a sí mismo',
        });
      }

      // Validar fecha
      const fechaCita = new Date(fecha);
      if (isNaN(fechaCita.getTime())) {
        return res.status(400).json({
          message: 'Formato de fecha inválido',
        });
      }

      // Validar que la fecha no sea en el pasado
      if (fechaCita < new Date()) {
        return res.status(400).json({
          message: 'No se pueden crear citas en el pasado',
        });
      }

      // Obtener agenda del profesional destinatario
      const agenda = await AgendaUCAD.findOne({profesional});
      if (!agenda || !agenda.status) {
        return res.status(400).json({
          message:
            'El profesional destinatario no tiene agenda configurada o está inactiva',
        });
      }

      // Validar día de la semana
      const diasSemana = [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ];
      const diaSemana = diasSemana[fechaCita.getDay()];
      if (!agenda.dias.includes(diaSemana)) {
        return res.status(400).json({
          message: `El profesional destinatario no atiende los ${diaSemana}s`,
        });
      }

      // Validar horario dentro del rango de disponibilidad
      const horaCita = fechaCita.getHours();
      const minutoCita = fechaCita.getMinutes();
      const [horaInicioNum, minutoInicioNum] = agenda.horaInicio
        .split(':')
        .map(Number);
      const [horaFinNum, minutoFinNum] = agenda.horaFin.split(':').map(Number);

      const horaCitaTotal = horaCita * 60 + minutoCita;
      const inicioTotal = horaInicioNum * 60 + minutoInicioNum;
      const finTotal = horaFinNum * 60 + minutoFinNum;

      if (horaCitaTotal < inicioTotal || horaCitaTotal >= finTotal) {
        return res.status(400).json({
          message: `El horario debe estar entre ${agenda.horaInicio} y ${agenda.horaFin}`,
        });
      }

      // Validar que el horario esté en bloques de 30 minutos
      if (minutoCita !== 0 && minutoCita !== 30) {
        return res.status(400).json({
          message:
            'Las citas deben agendarse en bloques de 30 minutos (ej: 09:00, 09:30, 10:00)',
        });
      }

      // Verificar que no haya conflicto con otra cita
      const fechaFinCita = new Date(fechaCita);
      fechaFinCita.setMinutes(fechaFinCita.getMinutes() + duracion);

      const citaConflictiva = await CitasUcad.findOne({
        profesional,
        fecha: {
          $gte: fechaCita,
          $lt: fechaFinCita,
        },
        estado: {$nin: ['cancelada']},
      });

      if (citaConflictiva) {
        return res.status(400).json({
          message: 'Ya existe una cita agendada en este horario',
        });
      }

      // Crear la cita de derivación
      const nuevaCita = new CitasUcad({
        deportista,
        profesional,
        especialidad,
        tipoCita: 'derivacion',
        fecha: fechaCita,
        duracion,
        notas,
        derivadaPor,
        motivoDerivacion: motivoDerivacion || '',
        estado: 'pendiente',
      });

      await nuevaCita.save();

      // Populate para respuesta
      await nuevaCita.populate('deportista', 'nombre apellido email');
      await nuevaCita.populate('profesional', 'nombre apellido email especialidad');
      await nuevaCita.populate('derivadaPor', 'nombre apellido email especialidad');

      res.status(201).json({
        message: 'Cita derivada exitosamente',
        cita: nuevaCita,
      });
    } catch (error) {
      console.error('Error al derivar cita:', error);
      res.status(500).json({
        message: 'Error al derivar cita',
        error: error.message,
      });
    }
  },

  /**
   * Obtener citas de un deportista
   * GET /mis-citas/:deportistaId
   * Query: ?estado=pendiente (opcional)
   */
  obtenerCitasDeportista: async (req, res) => {
    try {
      const { deportistaId } = req.params;
      const { estado } = req.query;

      const query = { deportista: deportistaId };
      if (estado) {
        query.estado = estado;
      }

      const citas = await CitasUcad.find(query)
        .populate('profesional', 'nombre apellido email especialidad imgUrl')
        .sort({ fecha: 1 });

      res.status(200).json({
        citas,
        total: citas.length
      });
    } catch (error) {
      console.error('Error al obtener citas del deportista:', error);
      res.status(500).json({
        message: "Error al obtener citas",
        error: error.message
      });
    }
  },

  /**
   * Obtener citas de un profesional
   * GET /citas-profesional/:profesionalId
   * Query: ?estado=pendiente&fecha=2025-01-15 (opcional)
   */
  obtenerCitasProfesional: async (req, res) => {
    try {
      const { profesionalId } = req.params;
      const { estado, fecha } = req.query;

      const query = { profesional: profesionalId };
      if (estado) {
        query.estado = estado;
      }

      if (fecha) {
        const fechaDate = new Date(fecha);
        const inicioDia = new Date(fechaDate);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fechaDate);
        finDia.setHours(23, 59, 59, 999);
        query.fecha = { $gte: inicioDia, $lte: finDia };
      }

      const citas = await CitasUcad.find(query)
        .populate('deportista', 'nombre apellido email imgUrl')
        .populate('derivadaPor', 'nombre apellido email especialidad')
        .sort({ fecha: 1 });

      res.status(200).json({
        citas,
        total: citas.length
      });
    } catch (error) {
      console.error('Error al obtener citas del profesional:', error);
      res.status(500).json({
        message: "Error al obtener citas",
        error: error.message
      });
    }
  },

  /**
   * Obtener todas las citas (para admin)
   * GET /todas-las-citas
   */
  obtenerTodasLasCitas: async (req, res) => {
    try {
      const { estado, fecha } = req.query;

      const query = {};
      if (estado) {
        query.estado = estado;
      }

      if (fecha) {
        const fechaDate = new Date(fecha);
        const inicioDia = new Date(fechaDate);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fechaDate);
        finDia.setHours(23, 59, 59, 999);
        query.fecha = { $gte: inicioDia, $lte: finDia };
      }

      const citas = await CitasUcad.find(query)
        .populate('deportista', 'nombre apellido email imgUrl rut')
        .populate('profesional', 'nombre apellido email especialidad')
        .populate('derivadaPor', 'nombre apellido email especialidad')
        .sort({ fecha: -1 });

      res.status(200).json({
        citas,
        total: citas.length
      });
    } catch (error) {
      console.error('Error al obtener todas las citas:', error);
      res.status(500).json({
        message: "Error al obtener citas",
        error: error.message
      });
    }
  },

  /**
   * Obtener detalle de una cita
   * GET /cita/:citaId
   */
  obtenerCita: async (req, res) => {
    try {
      const { citaId } = req.params;

      const cita = await CitasUcad.findById(citaId)
        .populate('deportista', 'nombre apellido email rut telefono imgUrl')
        .populate('profesional', 'nombre apellido email especialidad telefono imgUrl');

      if (!cita) {
        return res.status(404).json({
          message: "Cita no encontrada"
        });
      }

      res.status(200).json({
        cita
      });
    } catch (error) {
      console.error('Error al obtener cita:', error);
      res.status(500).json({
        message: "Error al obtener cita",
        error: error.message
      });
    }
  },

  /**
   * Confirmar cita (profesional)
   * PUT /confirmar-cita/:citaId
   */
  confirmarCita: async (req, res) => {
    try {
      const { citaId } = req.params;

      const cita = await CitasUcad.findById(citaId);
      if (!cita) {
        return res.status(404).json({
          message: "Cita no encontrada"
        });
      }

      if (cita.estado !== 'pendiente') {
        return res.status(400).json({
          message: `La cita no puede ser confirmada. Estado actual: ${cita.estado}`
        });
      }

      cita.estado = 'confirmada';
      await cita.save();

      await cita.populate('deportista', 'nombre apellido email');
      await cita.populate('profesional', 'nombre apellido email especialidad');

      res.status(200).json({
        message: "Cita confirmada exitosamente",
        cita
      });
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      res.status(500).json({
        message: "Error al confirmar cita",
        error: error.message
      });
    }
  },

  /**
   * Cancelar cita
   * PUT /cancelar-cita/:citaId
   * Body: { motivoCancelacion, canceladoPor }
   */
  cancelarCita: async (req, res) => {
    try {
      const { citaId } = req.params;
      const { motivoCancelacion, canceladoPor } = req.body;

      if (!canceladoPor || !['deportista', 'profesional', 'admin'].includes(canceladoPor)) {
        return res.status(400).json({
          message: "El campo canceladoPor es requerido y debe ser: deportista, profesional o admin"
        });
      }

      const cita = await CitasUcad.findById(citaId);
      if (!cita) {
        return res.status(404).json({
          message: "Cita no encontrada"
        });
      }

      if (cita.estado === 'cancelada') {
        return res.status(400).json({
          message: "La cita ya está cancelada"
        });
      }

      if (cita.estado === 'completada') {
        return res.status(400).json({
          message: "No se puede cancelar una cita completada"
        });
      }

      cita.estado = 'cancelada';
      cita.motivoCancelacion = motivoCancelacion || 'Sin motivo especificado';
      cita.canceladoPor = canceladoPor;
      await cita.save();

      await cita.populate('deportista', 'nombre apellido email');
      await cita.populate('profesional', 'nombre apellido email especialidad');

      res.status(200).json({
        message: "Cita cancelada exitosamente",
        cita
      });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({
        message: "Error al cancelar cita",
        error: error.message
      });
    }
  },

  /**
   * Completar cita (profesional)
   * PUT /completar-cita/:citaId
   */
  completarCita: async (req, res) => {
    try {
      const { citaId } = req.params;
      const { notas } = req.body;

      const cita = await CitasUcad.findById(citaId);
      if (!cita) {
        return res.status(404).json({
          message: "Cita no encontrada"
        });
      }

      if (cita.estado !== 'confirmada') {
        return res.status(400).json({
          message: `La cita debe estar confirmada para completarla. Estado actual: ${cita.estado}`
        });
      }

      cita.estado = 'completada';
      cita.notas = notas || '';
      await cita.save();

      await cita.populate('deportista', 'nombre apellido email');
      await cita.populate('profesional', 'nombre apellido email especialidad');

      res.status(200).json({
        message: "Cita marcada como completada",
        cita
      });
    } catch (error) {
      console.error('Error al completar cita:', error);
      res.status(500).json({
        message: "Error al completar cita",
        error: error.message
      });
    }
  },

  /**
   * Obtener horarios disponibles para agendar
   * GET /horarios-disponibles/:profesionalId/:fecha
   * Similar a obtenerDisponibilidad de agenda pero específico para citas
   */
  obtenerHorariosDisponibles: async (req, res) => {
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

      // Obtener día de la semana
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const diaSemana = diasSemana[fechaDate.getDay()];

      // Verificar que el día esté en la agenda
      if (!agenda.dias.includes(diaSemana)) {
        return res.status(400).json({
          message: `El profesional no atiende los ${diaSemana}s`,
          horariosDisponibles: []
        });
      }

      // Generar bloques de 30 minutos
      const [horaInicioNum, minutoInicioNum] = agenda.horaInicio.split(':').map(Number);
      const [horaFinNum, minutoFinNum] = agenda.horaFin.split(':').map(Number);

      const bloquesDisponibles = [];
      let horaActual = horaInicioNum;
      let minutoActual = minutoInicioNum;

      while (horaActual < horaFinNum || (horaActual === horaFinNum && minutoActual < minutoFinNum)) {
        const horaFormato = `${String(horaActual).padStart(2, '0')}:${String(minutoActual).padStart(2, '0')}`;
        bloquesDisponibles.push(horaFormato);

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
      console.error('Error al obtener horarios disponibles:', error);
      res.status(500).json({
        message: "Error al obtener horarios disponibles",
        error: error.message
      });
    }
  },
  derivarCitaUpdate: async (req, res) => {
    
  }
};

module.exports = citasUcadController;

