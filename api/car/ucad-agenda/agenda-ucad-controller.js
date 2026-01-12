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
      const { profesional, dias, horaInicio, horaFin, bloque, status = true } = req.body;

      // Validar campos requeridos
      if (!profesional || !dias || !horaInicio || !horaFin || bloque === undefined) {
        return res.status(400).json({
          message: "Los campos profesional, dias, horaInicio, horaFin y bloque son requeridos"
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

      // Validar que dias sea un array
      if (!Array.isArray(dias) || dias.length === 0) {
        return res.status(400).json({
          message: "El campo 'dias' debe ser un array no vacío"
        });
      }

      // Validar que bloque sea un número válido
      if (typeof bloque !== 'number' || bloque <= 0 || bloque > 1440) {
        return res.status(400).json({
          message: "El campo 'bloque' debe ser un número positivo válido (en minutos, máximo 1440)"
        });
      }

      // Validar formato de horas (HH:mm o H:mm)
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

      // Validar días de la semana y estructura
      const diasValidos = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
      const diasNormalizados = [];
      const diasUnicos = new Set();

      for (const diaObj of dias) {
        // Validar que sea un objeto
        if (typeof diaObj !== 'object' || Array.isArray(diaObj) || diaObj === null) {
          return res.status(400).json({
            message: "Cada elemento de 'dias' debe ser un objeto con propiedades: dia, horarios, status"
          });
        }

        // Validar propiedades requeridas
        if (!diaObj.dia || !diaObj.horarios || diaObj.status === undefined) {
          return res.status(400).json({
            message: "Cada día debe tener las propiedades: dia, horarios (array), y status (boolean)"
          });
        }

        // Validar que horarios sea un array
        if (!Array.isArray(diaObj.horarios)) {
          return res.status(400).json({
            message: "La propiedad 'horarios' debe ser un array"
          });
        }

        // Normalizar día
        const diaLower = diaObj.dia.toLowerCase();
        let diaNormalizado;
        if (diaLower === 'miercoles') {
          diaNormalizado = 'miércoles';
        } else if (diaLower === 'sabado') {
          diaNormalizado = 'sábado';
        } else {
          diaNormalizado = diaLower;
        }

        // Validar que el día sea válido
        if (!diasValidos.includes(diaNormalizado)) {
          return res.status(400).json({
            message: `Día inválido: ${diaObj.dia}. Días válidos: lunes, martes, miércoles, jueves, viernes, sábado, domingo`
          });
        }

        // Validar que no haya días duplicados
        if (diasUnicos.has(diaNormalizado)) {
          return res.status(400).json({
            message: `El día '${diaNormalizado}' está duplicado en el array de días`
          });
        }
        diasUnicos.add(diaNormalizado);

        // Validar formato y rango de horarios
        const horariosNormalizados = [];
        for (const horario of diaObj.horarios) {
          // Validar formato de hora
          if (!horaRegex.test(horario)) {
            return res.status(400).json({
              message: `Formato de horario inválido: ${horario}. Use HH:mm (ej: 09:00)`
            });
          }

          // Convertir a minutos totales
          const [horaNum, minutoNum] = horario.split(':').map(Number);
          const horarioTotal = horaNum * 60 + minutoNum;

          // Validar que esté dentro del rango horaInicio - horaFin
          if (horarioTotal < inicioTotal || horarioTotal >= finTotal) {
            return res.status(400).json({
              message: `El horario ${horario} está fuera del rango permitido (${horaInicio} - ${horaFin})`
            });
          }

          // Normalizar formato (asegurar HH:mm)
          const horarioFormateado = `${String(horaNum).padStart(2, '0')}:${String(minutoNum).padStart(2, '0')}`;
          horariosNormalizados.push(horarioFormateado);
        }

        // Validar que los horarios sigan el patrón del bloque
        if (horariosNormalizados.length > 1) {
          horariosNormalizados.sort((a, b) => {
            const [horaA, minA] = a.split(':').map(Number);
            const [horaB, minB] = b.split(':').map(Number);
            return (horaA * 60 + minA) - (horaB * 60 + minB);
          });

          for (let i = 1; i < horariosNormalizados.length; i++) {
            const [horaAnterior, minAnterior] = horariosNormalizados[i - 1].split(':').map(Number);
            const [horaActual, minActual] = horariosNormalizados[i].split(':').map(Number);
            const diferencia = (horaActual * 60 + minActual) - (horaAnterior * 60 + minAnterior);

            if (diferencia !== bloque) {
              return res.status(400).json({
                message: `Los horarios deben estar separados por ${bloque} minutos. El horario ${horariosNormalizados[i]} no sigue el patrón después de ${horariosNormalizados[i - 1]}`
              });
            }
          }
        }

        // Validar que status sea boolean
        if (typeof diaObj.status !== 'boolean') {
          return res.status(400).json({
            message: `El campo 'status' del día '${diaNormalizado}' debe ser un valor booleano`
          });
        }

        diasNormalizados.push({
          dia: diaNormalizado,
          horarios: horariosNormalizados,
          status: diaObj.status
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
        bloque,
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
      const { dias, horaInicio, horaFin, bloque, status } = req.body;

      const agenda = await AgendaUCAD.findById(id);
      if (!agenda) {
        return res.status(404).json({
          message: "Agenda no encontrada"
        });
      }

      // Validar formato de horas si se proporcionan
      const horaInicioFinal = horaInicio || agenda.horaInicio;
      const horaFinFinal = horaFin || agenda.horaFin;
      const bloqueFinal = bloque !== undefined ? bloque : agenda.bloque;

      // Detectar si cambió el bloque, horaInicio o horaFin
      const bloqueCambio = bloque !== undefined && bloque !== agenda.bloque;
      const horaInicioCambio = horaInicio && horaInicio !== agenda.horaInicio;
      const horaFinCambio = horaFin && horaFin !== agenda.horaFin;
      const debeRegenerarHorarios = (bloqueCambio || horaInicioCambio || horaFinCambio) && !dias;

      if (horaInicio || horaFin) {
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

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

      // Validar bloque si se proporciona
      if (bloque !== undefined) {
        if (typeof bloque !== 'number' || bloque <= 0 || bloque > 1440) {
          return res.status(400).json({
            message: "El campo 'bloque' debe ser un número positivo válido (en minutos, máximo 1440)"
          });
        }
      }

      // Función auxiliar para generar horarios basados en bloque y rango
      const generarHorarios = (horaInicioStr, horaFinStr, bloqueMinutos) => {
        const [horaInicioNum, minutoInicioNum] = horaInicioStr.split(':').map(Number);
        const [horaFinNum, minutoFinNum] = horaFinStr.split(':').map(Number);
        
        const horarios = [];
        let horaActual = horaInicioNum;
        let minutoActual = minutoInicioNum;

        while (horaActual < horaFinNum || (horaActual === horaFinNum && minutoActual < minutoFinNum)) {
          const horaFormato = `${String(horaActual).padStart(2, '0')}:${String(minutoActual).padStart(2, '0')}`;
          horarios.push(horaFormato);

          // Avanzar según el bloque
          minutoActual += bloqueMinutos;
          if (minutoActual >= 60) {
            horaActual += 1;
            minutoActual = minutoActual % 60;
          }
        }

        return horarios;
      };

      // Si debe regenerar horarios (cambió bloque/horaInicio/horaFin y no se proporcionaron días)
      if (debeRegenerarHorarios) {
        // Verificar que haya un bloque configurado para regenerar horarios
        if (!bloqueFinal) {
          return res.status(400).json({
            message: "No se puede regenerar horarios automáticamente: el campo 'bloque' es requerido. Proporcione el bloque o actualice los días manualmente."
          });
        }

        // Verificar que la agenda tenga días configurados
        if (!agenda.dias || !Array.isArray(agenda.dias) || agenda.dias.length === 0) {
          return res.status(400).json({
            message: "No se pueden regenerar horarios: la agenda no tiene días configurados"
          });
        }

        // Verificar si la estructura es nueva (array de objetos) o antigua (array de strings)
        const esEstructuraNueva = typeof agenda.dias[0] === 'object' && agenda.dias[0] !== null;

        if (esEstructuraNueva) {
          // Regenerar horarios para cada día manteniendo su status
          const diasActualizados = agenda.dias.map(diaObj => {
            const horariosRegenerados = generarHorarios(horaInicioFinal, horaFinFinal, bloqueFinal);
            return {
              dia: diaObj.dia,
              horarios: horariosRegenerados,
              status: diaObj.status
            };
          });
          agenda.dias = diasActualizados;
        } else {
          // Estructura antigua: convertir a nueva estructura
          const diasActualizados = agenda.dias.map(diaStr => {
            const horariosRegenerados = generarHorarios(horaInicioFinal, horaFinFinal, bloqueFinal);
            return {
              dia: diaStr,
              horarios: horariosRegenerados,
              status: true
            };
          });
          agenda.dias = diasActualizados;
        }
      }

      // Actualizar campos de días si se proporcionan
      if (dias) {
        if (!Array.isArray(dias) || dias.length === 0) {
          return res.status(400).json({
            message: "El campo 'dias' debe ser un array no vacío"
          });
        }

        const diasValidos = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
        const diasNormalizados = [];
        const diasUnicos = new Set();
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        const [horaInicioNum, minutoInicioNum] = horaInicioFinal.split(':').map(Number);
        const [horaFinNum, minutoFinNum] = horaFinFinal.split(':').map(Number);
        const inicioTotal = horaInicioNum * 60 + minutoInicioNum;
        const finTotal = horaFinNum * 60 + minutoFinNum;

        for (const diaObj of dias) {
          // Validar que sea un objeto
          if (typeof diaObj !== 'object' || Array.isArray(diaObj) || diaObj === null) {
            return res.status(400).json({
              message: "Cada elemento de 'dias' debe ser un objeto con propiedades: dia, horarios, status"
            });
          }

          // Validar propiedades requeridas
          if (!diaObj.dia || !diaObj.horarios || diaObj.status === undefined) {
            return res.status(400).json({
              message: "Cada día debe tener las propiedades: dia, horarios (array), y status (boolean)"
            });
          }

          // Validar que horarios sea un array
          if (!Array.isArray(diaObj.horarios)) {
            return res.status(400).json({
              message: "La propiedad 'horarios' debe ser un array"
            });
          }

          // Normalizar día
          const diaLower = diaObj.dia.toLowerCase();
          let diaNormalizado;
          if (diaLower === 'miercoles') {
            diaNormalizado = 'miércoles';
          } else if (diaLower === 'sabado') {
            diaNormalizado = 'sábado';
          } else {
            diaNormalizado = diaLower;
          }

          // Validar que el día sea válido
          if (!diasValidos.includes(diaNormalizado)) {
            return res.status(400).json({
              message: `Día inválido: ${diaObj.dia}. Días válidos: lunes, martes, miércoles, jueves, viernes, sábado, domingo`
            });
          }

          // Validar que no haya días duplicados
          if (diasUnicos.has(diaNormalizado)) {
            return res.status(400).json({
              message: `El día '${diaNormalizado}' está duplicado en el array de días`
            });
          }
          diasUnicos.add(diaNormalizado);

          // Validar formato y rango de horarios
          const horariosNormalizados = [];
          for (const horario of diaObj.horarios) {
            // Validar formato de hora
            if (!horaRegex.test(horario)) {
              return res.status(400).json({
                message: `Formato de horario inválido: ${horario}. Use HH:mm (ej: 09:00)`
              });
            }

            // Convertir a minutos totales
            const [horaNum, minutoNum] = horario.split(':').map(Number);
            const horarioTotal = horaNum * 60 + minutoNum;

            // Validar que esté dentro del rango horaInicio - horaFin
            if (horarioTotal < inicioTotal || horarioTotal >= finTotal) {
              return res.status(400).json({
                message: `El horario ${horario} está fuera del rango permitido (${horaInicioFinal} - ${horaFinFinal})`
              });
            }

            // Normalizar formato (asegurar HH:mm)
            const horarioFormateado = `${String(horaNum).padStart(2, '0')}:${String(minutoNum).padStart(2, '0')}`;
            horariosNormalizados.push(horarioFormateado);
          }

          // Validar que los horarios sigan el patrón del bloque
          if (horariosNormalizados.length > 1 && bloqueFinal) {
            horariosNormalizados.sort((a, b) => {
              const [horaA, minA] = a.split(':').map(Number);
              const [horaB, minB] = b.split(':').map(Number);
              return (horaA * 60 + minA) - (horaB * 60 + minB);
            });

            for (let i = 1; i < horariosNormalizados.length; i++) {
              const [horaAnterior, minAnterior] = horariosNormalizados[i - 1].split(':').map(Number);
              const [horaActual, minActual] = horariosNormalizados[i].split(':').map(Number);
              const diferencia = (horaActual * 60 + minActual) - (horaAnterior * 60 + minAnterior);

              if (diferencia !== bloqueFinal) {
                return res.status(400).json({
                  message: `Los horarios deben estar separados por ${bloqueFinal} minutos. El horario ${horariosNormalizados[i]} no sigue el patrón después de ${horariosNormalizados[i - 1]}`
                });
              }
            }
          }

          // Validar que status sea boolean
          if (typeof diaObj.status !== 'boolean') {
            return res.status(400).json({
              message: `El campo 'status' del día '${diaNormalizado}' debe ser un valor booleano`
            });
          }

          diasNormalizados.push({
            dia: diaNormalizado,
            horarios: horariosNormalizados,
            status: diaObj.status
          });
        }

        agenda.dias = diasNormalizados;
      }

      if (horaInicio) agenda.horaInicio = horaInicio;
      if (horaFin) agenda.horaFin = horaFin;
      if (bloque !== undefined) agenda.bloque = bloque;
      if (status !== undefined) agenda.status = status;

      await agenda.save();

      // Mensaje personalizado si se regeneraron horarios
      let mensaje = "Agenda actualizada exitosamente";
      if (debeRegenerarHorarios) {
        const cambios = [];
        if (bloqueCambio) cambios.push(`bloque a ${bloqueFinal} minutos`);
        if (horaInicioCambio) cambios.push(`hora de inicio a ${horaInicioFinal}`);
        if (horaFinCambio) cambios.push(`hora de fin a ${horaFinFinal}`);
        mensaje = `Agenda actualizada exitosamente. Se regeneraron automáticamente los horarios de todos los días debido al cambio de ${cambios.join(', ')}.`;
      }

      res.status(200).json({
        message: mensaje,
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

      // Buscar el día en la agenda (ahora es un array de objetos)
      const diaAgenda = Array.isArray(agenda.dias) && agenda.dias.length > 0 && typeof agenda.dias[0] === 'object'
        ? agenda.dias.find(d => d.dia === diaSemana)
        : null;

      // Si la estructura es antigua (array de strings), mantener compatibilidad
      if (!diaAgenda) {
        const diasArray = Array.isArray(agenda.dias) ? agenda.dias : [];
        const esEstructuraAntigua = diasArray.length > 0 && typeof diasArray[0] === 'string';
        
        if (esEstructuraAntigua && !diasArray.includes(diaSemana)) {
          return res.status(400).json({
            message: `El profesional no atiende los ${diaSemana}s`
          });
        }

        // Si es estructura antigua, generar bloques automáticamente
        if (esEstructuraAntigua) {
          const [horaInicioNum, minutoInicioNum] = agenda.horaInicio.split(':').map(Number);
          const [horaFinNum, minutoFinNum] = agenda.horaFin.split(':').map(Number);
          const bloqueMinutos = agenda.bloque || 30;

          const bloquesDisponibles = [];
          let horaActual = horaInicioNum;
          let minutoActual = minutoInicioNum;

          while (horaActual < horaFinNum || (horaActual === horaFinNum && minutoActual < minutoFinNum)) {
            const horaFormato = `${String(horaActual).padStart(2, '0')}:${String(minutoActual).padStart(2, '0')}`;
            bloquesDisponibles.push(horaFormato);

            // Avanzar según el bloque
            minutoActual += bloqueMinutos;
            if (minutoActual >= 60) {
              horaActual += 1;
              minutoActual = minutoActual % 60;
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

          return res.status(200).json({
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
        } else {
          return res.status(400).json({
            message: `El profesional no atiende los ${diaSemana}s`
          });
        }
      }

      // Verificar que el día esté activo (status = true)
      if (!diaAgenda.status) {
        return res.status(400).json({
          message: `El profesional no está disponible los ${diaSemana}s (día inactivo)`
        });
      }

      // Usar los horarios específicos del día (normalizar formato HH:mm)
      const bloquesDisponibles = (diaAgenda.horarios || []).map(horario => {
        const [hora, minuto] = horario.split(':').map(Number);
        return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
      });

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

