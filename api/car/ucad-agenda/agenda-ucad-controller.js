const AgendaUCAD = require('./agenda-ucad');
const UsuariosUcad = require('../ucad-usuarios/usuarios-ucad');
const CitasUcad = require('../ucad-citas/citas-ucad');

/**
 * Función auxiliar para generar todos los slots de horarios posibles
 * basado en horaInicio, horaFin y bloqueMinutos
 */
const generarSlotsHorarios = (horaInicio, horaFin, bloqueMinutos) => {
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFn, minFn] = horaFin.split(':').map(Number);
  const slots = [];
  let horaActual = horaIni;
  let minutoActual = minIni;
  const finTotal = horaFn * 60 + minFn;

  while (horaActual * 60 + minutoActual < finTotal) {
    const horaFormato = `${String(horaActual).padStart(2, '0')}:${String(minutoActual).padStart(2, '0')}`;
    slots.push(horaFormato);
    minutoActual += bloqueMinutos;
    if (minutoActual >= 60) {
      horaActual += 1;
      minutoActual = minutoActual % 60;
    }
  }
  return slots;
};

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
        if (!diaObj.dia || diaObj.status === undefined) {
          return res.status(400).json({
            message: "Cada día debe tener las propiedades: dia y status (boolean). Opcionalmente: horarios (array), horaInicio, horaFin"
          });
        }

        // Validar que horarios sea un array si se proporciona
        if (diaObj.horarios && !Array.isArray(diaObj.horarios)) {
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

        // Determinar rango horario para este día (puede ser específico del día o global)
        const horaInicioDia = diaObj.horaInicio || horaInicio;
        const horaFinDia = diaObj.horaFin || horaFin;

        // Validar formato de horas específicas del día si existen
        if (diaObj.horaInicio && !horaRegex.test(diaObj.horaInicio)) {
          return res.status(400).json({
            message: `Formato de horaInicio inválido para ${diaNormalizado}: ${diaObj.horaInicio}. Use HH:mm`
          });
        }
        if (diaObj.horaFin && !horaRegex.test(diaObj.horaFin)) {
          return res.status(400).json({
            message: `Formato de horaFin inválido para ${diaNormalizado}: ${diaObj.horaFin}. Use HH:mm`
          });
        }

        const [horaInicioDiaNum, minutoInicioDiaNum] = horaInicioDia.split(':').map(Number);
        const [horaFinDiaNum, minutoFinDiaNum] = horaFinDia.split(':').map(Number);
        const inicioDiaTotal = horaInicioDiaNum * 60 + minutoInicioDiaNum;
        const finDiaTotal = horaFinDiaNum * 60 + minutoFinDiaNum;

        // Validar que horaInicio < horaFin del día
        if (inicioDiaTotal >= finDiaTotal) {
          return res.status(400).json({
            message: `La hora de inicio debe ser menor que la hora de fin para ${diaNormalizado} (${horaInicioDia} - ${horaFinDia})`
          });
        }

        // Validar formato y rango de horarios
        const horariosNormalizados = [];
        if (diaObj.horarios && diaObj.horarios.length > 0) {
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

            // Validar que esté dentro del rango horaInicio - horaFin del día
            if (horarioTotal < inicioDiaTotal || horarioTotal >= finDiaTotal) {
              return res.status(400).json({
                message: `El horario ${horario} está fuera del rango permitido para ${diaNormalizado} (${horaInicioDia} - ${horaFinDia})`
              });
            }

            // Normalizar formato (asegurar HH:mm)
            const horarioFormateado = `${String(horaNum).padStart(2, '0')}:${String(minutoNum).padStart(2, '0')}`;
            horariosNormalizados.push(horarioFormateado);
          }
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

        const diaFinal = {
          dia: diaNormalizado,
          horarios: horariosNormalizados,
          status: diaObj.status
        };

        // Agregar horaInicio y horaFin específicos del día si existen
        if (diaObj.horaInicio) diaFinal.horaInicio = diaObj.horaInicio;
        if (diaObj.horaFin) diaFinal.horaFin = diaObj.horaFin;

        diasNormalizados.push(diaFinal);
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

        // Detectar si el array contiene strings (formato nuevo simplificado) u objetos (formato completo)
        const esFormatoSimplificado = typeof dias[0] === 'string';

        if (esFormatoSimplificado) {
          // Formato simplificado: array de strings ["lunes", "martes"]
          // Usado cuando el admin edita la configuración base
          for (const diaStr of dias) {
            if (typeof diaStr !== 'string') {
              return res.status(400).json({
                message: "En formato simplificado, cada elemento de 'dias' debe ser un string (nombre del día)"
              });
            }

            const diaNormalizado = diaStr.toLowerCase().trim()
              .replace(/á/g, 'a')
              .replace(/é/g, 'e')
              .replace(/í/g, 'i')
              .replace(/ó/g, 'o')
              .replace(/ú/g, 'u');

            if (!diasValidos.includes(diaNormalizado) && !diasValidos.includes(diaStr.toLowerCase().trim())) {
              return res.status(400).json({
                message: `Día inválido: ${diaStr}. Días válidos: lunes, martes, miércoles, jueves, viernes, sábado, domingo`
              });
            }

            if (diasUnicos.has(diaNormalizado)) {
              return res.status(400).json({
                message: `El día '${diaStr}' está duplicado`
              });
            }
            diasUnicos.add(diaNormalizado);
            diasNormalizados.push(diaNormalizado);
          }

          // En formato simplificado, solo actualizamos el array de días
          // Los horariosDisponibles se mantienen y serán gestionados por el profesional
          agenda.dias = diasNormalizados;
        } else {
          // Formato completo: array de objetos con estructura {dia, horarios, status}
          for (const diaObj of dias) {
            // Validar que sea un objeto
            if (typeof diaObj !== 'object' || Array.isArray(diaObj) || diaObj === null) {
              return res.status(400).json({
                message: "Cada elemento de 'dias' debe ser un objeto con propiedades: dia, horarios, status"
              });
            }

          // Validar propiedades requeridas
          if (!diaObj.dia || diaObj.status === undefined) {
            return res.status(400).json({
              message: "Cada día debe tener las propiedades: dia y status (boolean). Opcionalmente: horarios (array), horaInicio, horaFin"
            });
          }

          // Validar que horarios sea un array si se proporciona
          if (diaObj.horarios && !Array.isArray(diaObj.horarios)) {
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

          // Determinar rango horario para este día (puede ser específico del día o global)
          const horaInicioDia = diaObj.horaInicio || horaInicioFinal;
          const horaFinDia = diaObj.horaFin || horaFinFinal;

          // Validar formato de horas específicas del día si existen
          if (diaObj.horaInicio && !horaRegex.test(diaObj.horaInicio)) {
            return res.status(400).json({
              message: `Formato de horaInicio inválido para ${diaNormalizado}: ${diaObj.horaInicio}. Use HH:mm`
            });
          }
          if (diaObj.horaFin && !horaRegex.test(diaObj.horaFin)) {
            return res.status(400).json({
              message: `Formato de horaFin inválido para ${diaNormalizado}: ${diaObj.horaFin}. Use HH:mm`
            });
          }

          const [horaInicioDiaNum, minutoInicioDiaNum] = horaInicioDia.split(':').map(Number);
          const [horaFinDiaNum, minutoFinDiaNum] = horaFinDia.split(':').map(Number);
          const inicioDiaTotal = horaInicioDiaNum * 60 + minutoInicioDiaNum;
          const finDiaTotal = horaFinDiaNum * 60 + minutoFinDiaNum;

          // Validar que horaInicio < horaFin del día
          if (inicioDiaTotal >= finDiaTotal) {
            return res.status(400).json({
              message: `La hora de inicio debe ser menor que la hora de fin para ${diaNormalizado} (${horaInicioDia} - ${horaFinDia})`
            });
          }

          // Validar formato y rango de horarios
          const horariosNormalizados = [];
          if (diaObj.horarios && diaObj.horarios.length > 0) {
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

              // Validar que esté dentro del rango horaInicio - horaFin del día
              if (horarioTotal < inicioDiaTotal || horarioTotal >= finDiaTotal) {
                return res.status(400).json({
                  message: `El horario ${horario} está fuera del rango permitido para ${diaNormalizado} (${horaInicioDia} - ${horaFinDia})`
                });
              }

              // Normalizar formato (asegurar HH:mm)
              const horarioFormateado = `${String(horaNum).padStart(2, '0')}:${String(minutoNum).padStart(2, '0')}`;
              horariosNormalizados.push(horarioFormateado);
            }
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

          const diaFinal = {
            dia: diaNormalizado,
            horarios: horariosNormalizados,
            status: diaObj.status
          };

          // Agregar horaInicio y horaFin específicos del día si existen
          if (diaObj.horaInicio) diaFinal.horaInicio = diaObj.horaInicio;
          if (diaObj.horaFin) diaFinal.horaFin = diaObj.horaFin;

          diasNormalizados.push(diaFinal);
          }

          agenda.dias = diasNormalizados;
        }
      }

      if (horaInicio) agenda.horaInicio = horaInicio;
      if (horaFin) agenda.horaFin = horaFin;
      if (bloque !== undefined) agenda.bloque = bloque;
      if (status !== undefined) agenda.status = status;

      await agenda.save();

      // Asegurar que el profesional tenga la referencia a la agenda
      await UsuariosUcad.findByIdAndUpdate(agenda.profesional, { agenda: agenda._id });

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

      // Validar fecha y crear objeto Date en zona horaria local
      const [year, month, day] = fecha.split('-').map(Number);
      const fechaDate = new Date(year, month - 1, day);

      if (isNaN(fechaDate.getTime())) {
        return res.status(400).json({
          message: "Formato de fecha inválido. Use YYYY-MM-DD"
        });
      }

      // Obtener día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const diaSemana = diasSemana[fechaDate.getDay()];

      // Verificar que el día esté en los días habilitados
      const diasArray = Array.isArray(agenda.dias) ? agenda.dias : [];
      if (!diasArray.includes(diaSemana)) {
        return res.status(400).json({
          message: `El profesional no atiende los ${diaSemana}s`
        });
      }

      // Obtener horarios disponibles para este día desde horariosDisponibles
      let bloquesDisponibles = [];
      if (agenda.horariosDisponibles && Array.isArray(agenda.horariosDisponibles)) {
        const diaConfig = agenda.horariosDisponibles.find(d => d.dia === diaSemana);
        if (diaConfig && Array.isArray(diaConfig.horarios)) {
          bloquesDisponibles = diaConfig.horarios.map(horario => {
            const [hora, minuto] = horario.split(':').map(Number);
            return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
          });
        }
      }

      // Si no hay horarios disponibles configurados, retornar mensaje
      if (bloquesDisponibles.length === 0) {
        return res.status(400).json({
          message: `El profesional no tiene horarios disponibles configurados para los ${diaSemana}s`
        });
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

      // Marcar bloques ocupados por citas
      const bloquesOcupados = new Set();
      citasExistentes.forEach(cita => {
        const fechaCita = new Date(cita.fecha);
        const horaCita = `${String(fechaCita.getHours()).padStart(2, '0')}:${String(fechaCita.getMinutes()).padStart(2, '0')}`;
        bloquesOcupados.add(horaCita);
      });

      // Agregar horarios bloqueados por el profesional (horariosOcupados)
      if (agenda.horariosOcupados && Array.isArray(agenda.horariosOcupados)) {
        const diaOcupado = agenda.horariosOcupados.find(d => d.dia === diaSemana);
        if (diaOcupado && Array.isArray(diaOcupado.horarios)) {
          diaOcupado.horarios.forEach(item => {
            if (item.hora) {
              bloquesOcupados.add(item.hora);
            }
          });
        }
      }

      // Filtrar bloques disponibles (excluir ocupados y bloqueados)
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
  },

  /**
   * Admin habilita agenda para un profesional (primera vez)
   * POST /habilitar-agenda
   * Body: { profesional, dias, horaInicio, horaFin, bloque, habilitadaPor }
   */
  habilitarAgenda: async (req, res) => {
    try {
      const { profesional, dias, horaInicio, horaFin, bloque = 15, habilitadaPor } = req.body;

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

      // Verificar si ya tiene agenda
      const agendaExistente = await AgendaUCAD.findOne({ profesional });
      if (agendaExistente) {
        return res.status(400).json({
          message: "El profesional ya tiene una agenda habilitada. Use el endpoint de actualización."
        });
      }

      // Validar que dias sea un array de strings
      if (!Array.isArray(dias) || dias.length === 0) {
        return res.status(400).json({
          message: "El campo 'dias' debe ser un array no vacío de días de la semana"
        });
      }

      // Validar formato de horas
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
        return res.status(400).json({
          message: "Formato de hora inválido. Use HH:mm (ej: 09:00, 17:00)"
        });
      }

      // Validar que horaInicio < horaFin
      const [horaIniNum, minIniNum] = horaInicio.split(':').map(Number);
      const [horaFnNum, minFnNum] = horaFin.split(':').map(Number);
      const inicioTotal = horaIniNum * 60 + minIniNum;
      const finTotal = horaFnNum * 60 + minFnNum;

      if (inicioTotal >= finTotal) {
        return res.status(400).json({
          message: "La hora de inicio debe ser menor que la hora de fin"
        });
      }

      // Validar días
      const diasValidos = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
      const diasNormalizados = dias.map(d => {
        const diaLower = d.toLowerCase();
        return diaLower === 'miercoles' ? 'miércoles' : (diaLower === 'sabado' ? 'sábado' : diaLower);
      });

      for (const dia of diasNormalizados) {
        if (!diasValidos.includes(dia)) {
          return res.status(400).json({
            message: `Día inválido: ${dia}`
          });
        }
      }

      // Crear la agenda con horariosDisponibles vacío (el profesional los llenará)
      const nuevaAgenda = new AgendaUCAD({
        profesional,
        dias: diasNormalizados,
        horaInicio,
        horaFin,
        bloque,
        status: true,
        horariosDisponibles: [], // vacío inicialmente
        habilitadaPor: habilitadaPor || null,
        fechaHabilitacion: new Date()
      });

      await nuevaAgenda.save();

      // Actualizar el campo agenda en el usuario profesional
      const usuarioActualizado = await UsuariosUcad.findByIdAndUpdate(
        profesional,
        { agenda: nuevaAgenda._id },
        { new: true }
      );

      console.log(`✓ Agenda vinculada al profesional ${usuarioActualizado.nombre} ${usuarioActualizado.apellido}`);

      res.status(201).json({
        message: "Agenda habilitada correctamente. El profesional puede ahora configurar sus horarios disponibles.",
        agenda: nuevaAgenda
      });

    } catch (error) {
      console.error('Error al habilitar agenda:', error);
      res.status(500).json({
        message: "Error al habilitar agenda",
        error: error.message
      });
    }
  },

  /**
   * Obtener agenda habilitada con todos los slots disponibles
   * GET /agenda-habilitada/:profesionalId
   */
  obtenerAgendaHabilitada: async (req, res) => {
    try {
      const { profesionalId } = req.params;

      const agenda = await AgendaUCAD.findOne({ profesional: profesionalId })
        .populate('profesional', 'nombre apellido especialidad')
        .populate('habilitadaPor', 'nombre apellido');

      if (!agenda) {
        return res.status(404).json({
          message: "El profesional no tiene agenda habilitada",
          agendaHabilitada: false
        });
      }

      // Normalizar días: asegurar que son strings, no objetos
      const diasNormalizados = Array.isArray(agenda.dias)
        ? agenda.dias.map(d => typeof d === 'string' ? d : (d.dia || String(d)))
        : [];

      // Generar todos los slots posibles por día
      const slotsDisponibles = {};
      diasNormalizados.forEach(dia => {
        slotsDisponibles[dia] = generarSlotsHorarios(agenda.horaInicio, agenda.horaFin, agenda.bloque);
      });

      // Organizar horarios ocupados desde la agenda (ya no buscamos citas internas)
      const horariosOcupados = {};
      if (agenda.horariosOcupados && Array.isArray(agenda.horariosOcupados)) {
        agenda.horariosOcupados.forEach(diaConfig => {
          if (diaConfig.dia && Array.isArray(diaConfig.horarios)) {
            horariosOcupados[diaConfig.dia] = diaConfig.horarios;
          }
        });
      }

      res.status(200).json({
        message: "Agenda obtenida correctamente",
        agendaHabilitada: true,
        agenda: {
          _id: agenda._id,
          profesional: agenda.profesional,
          dias: diasNormalizados,
          horaInicio: agenda.horaInicio,
          horaFin: agenda.horaFin,
          bloque: agenda.bloque,
          status: agenda.status,
          horariosDisponibles: agenda.horariosDisponibles,
          horariosOcupados: agenda.horariosOcupados,
          habilitadaPor: agenda.habilitadaPor,
          fechaHabilitacion: agenda.fechaHabilitacion
        },
        slotsDisponibles, // todos los slots posibles por día
        horariosOcupados // horarios bloqueados organizados por día
      });

    } catch (error) {
      console.error('Error al obtener agenda habilitada:', error);
      res.status(500).json({
        message: "Error al obtener agenda habilitada",
        error: error.message
      });
    }
  },

  /**
   * Profesional actualiza sus horarios disponibles
   * PUT /actualizar-horarios/:agendaId
   * Body: { horariosDisponibles: [{ dia: "lunes", horarios: ["09:00", "09:15"] }] }
   */
  actualizarHorariosDisponibles: async (req, res) => {
    try {
      const { agendaId } = req.params;
      const { horariosDisponibles } = req.body;

      if (!horariosDisponibles || !Array.isArray(horariosDisponibles)) {
        return res.status(400).json({
          message: "El campo 'horariosDisponibles' debe ser un array"
        });
      }

      const agenda = await AgendaUCAD.findById(agendaId);
      if (!agenda) {
        return res.status(404).json({
          message: "Agenda no encontrada"
        });
      }

      // Validar que los días y horarios están dentro del rango habilitado
      for (const diaConfig of horariosDisponibles) {
        if (!agenda.dias.includes(diaConfig.dia)) {
          return res.status(400).json({
            message: `El día '${diaConfig.dia}' no está habilitado en la agenda`
          });
        }

        // Generar slots válidos para este día
        const slotsValidos = generarSlotsHorarios(agenda.horaInicio, agenda.horaFin, agenda.bloque);

        // Validar que cada horario seleccionado está en el rango válido
        for (const horario of diaConfig.horarios) {
          if (!slotsValidos.includes(horario)) {
            return res.status(400).json({
              message: `El horario '${horario}' no está dentro del rango habilitado (${agenda.horaInicio} - ${agenda.horaFin})`
            });
          }
        }
      }

      // Actualizar horarios disponibles
      agenda.horariosDisponibles = horariosDisponibles;
      await agenda.save();

      res.status(200).json({
        message: "Horarios disponibles actualizados correctamente",
        agenda
      });

    } catch (error) {
      console.error('Error al actualizar horarios disponibles:', error);
      res.status(500).json({
        message: "Error al actualizar horarios disponibles",
        error: error.message
      });
    }
  },

  /**
   * Marcar hora como ocupada (crea cita interna)
   * POST /marcar-hora-ocupada/:agendaId
   * Body: { dia, fecha, hora, duracion, motivoBloqueo }
   */
  marcarHoraOcupada: async (req, res) => {
    try {
      const { agendaId } = req.params;
      const { dia, fecha, hora, duracion = 60, motivoBloqueo = 'Otro' } = req.body;

      if (!dia || !fecha || !hora) {
        return res.status(400).json({
          message: "Los campos dia, fecha y hora son requeridos"
        });
      }

      const agenda = await AgendaUCAD.findById(agendaId);
      if (!agenda) {
        return res.status(404).json({
          message: "Agenda no encontrada"
        });
      }

      // Validar que el día está habilitado
      if (!agenda.dias.includes(dia)) {
        return res.status(400).json({
          message: `El día '${dia}' no está habilitado en la agenda`
        });
      }

      // Generar slots que serán bloqueados
      const slotsABloquear = [];
      const [horaNum, minNum] = hora.split(':').map(Number);
      let horaActual = horaNum;
      let minutoActual = minNum;
      const duracionMinutos = parseInt(duracion);
      const minutosFinales = horaNum * 60 + minNum + duracionMinutos;

      while (horaActual * 60 + minutoActual < minutosFinales) {
        const horaFormato = `${String(horaActual).padStart(2, '0')}:${String(minutoActual).padStart(2, '0')}`;
        slotsABloquear.push(horaFormato);
        minutoActual += agenda.bloque;
        if (minutoActual >= 60) {
          horaActual += 1;
          minutoActual = minutoActual % 60;
        }
      }

      // Paso 1: Habilitar los horarios en la agenda si no están ya
      let diaConfig = agenda.horariosDisponibles.find(d => d.dia === dia);
      if (!diaConfig) {
        diaConfig = { dia, horarios: [] };
        agenda.horariosDisponibles.push(diaConfig);
      }

      // Agregar los slots si no existen
      slotsABloquear.forEach(slot => {
        if (!diaConfig.horarios.includes(slot)) {
          diaConfig.horarios.push(slot);
        }
      });

      await agenda.save();

      // Paso 2: Crear cita interna para bloquear
      const [horaInicio, minInicio] = hora.split(':').map(Number);
      const fechaCita = new Date(fecha);
      fechaCita.setHours(horaInicio, minInicio, 0, 0);

      const citaInterna = new CitasUcad({
        profesional: agenda.profesional,
        deportista: null, // cita interna
        especialidad: 'Bloqueado',
        tipoCita: 'consulta',
        fecha: fechaCita,
        duracion: duracionMinutos,
        estado: 'completada', // estado para que no se pueda modificar
        esCitaInterna: true,
        motivoBloqueo,
        notas: `Horario bloqueado por el profesional: ${motivoBloqueo}`
      });

      await citaInterna.save();

      res.status(201).json({
        message: "Hora marcada como ocupada correctamente",
        slotsHabilitados: slotsABloquear,
        citaInterna
      });

    } catch (error) {
      console.error('Error al marcar hora ocupada:', error);
      res.status(500).json({
        message: "Error al marcar hora ocupada",
        error: error.message
      });
    }
  },

  /**
   * Actualizar horarios ocupados del profesional
   * PUT /actualizar-horarios-ocupados/:agendaId
   * Body: { horariosOcupados: [{ dia: "lunes", horarios: [{ hora: "09:00", motivo: "Reunión" }] }] }
   */
  actualizarHorariosOcupados: async (req, res) => {
    try {
      const { agendaId } = req.params;
      const { horariosOcupados } = req.body;

      if (!horariosOcupados || !Array.isArray(horariosOcupados)) {
        return res.status(400).json({
          message: "El campo horariosOcupados es requerido y debe ser un array"
        });
      }

      const agenda = await AgendaUCAD.findById(agendaId);
      if (!agenda) {
        return res.status(404).json({
          message: "Agenda no encontrada"
        });
      }

      // Validar estructura de horarios ocupados
      for (const diaConfig of horariosOcupados) {
        if (!diaConfig.dia || !Array.isArray(diaConfig.horarios)) {
          return res.status(400).json({
            message: "Cada elemento debe tener un campo 'dia' y un array 'horarios'"
          });
        }

        // Validar que el día está habilitado
        if (!agenda.dias.includes(diaConfig.dia)) {
          return res.status(400).json({
            message: `El día '${diaConfig.dia}' no está habilitado en la agenda`
          });
        }

        // Validar estructura de cada horario ocupado
        for (const horario of diaConfig.horarios) {
          if (!horario.hora || !horario.motivo) {
            return res.status(400).json({
              message: "Cada horario ocupado debe tener 'hora' y 'motivo'"
            });
          }
        }
      }

      // Actualizar horarios ocupados
      agenda.horariosOcupados = horariosOcupados;
      await agenda.save();

      res.status(200).json({
        message: "Horarios ocupados actualizados correctamente",
        agenda
      });

    } catch (error) {
      console.error('Error al actualizar horarios ocupados:', error);
      res.status(500).json({
        message: "Error al actualizar horarios ocupados",
        error: error.message
      });
    }
  },

  /**
   * Sincronizar agendas con usuarios (temporal - para arreglar agendas existentes)
   * GET /sincronizar-agendas
   */
  sincronizarAgendas: async (req, res) => {
    try {
      const agendas = await AgendaUCAD.find().select('_id profesional');

      let actualizados = 0;
      for (const agenda of agendas) {
        const resultado = await UsuariosUcad.findByIdAndUpdate(
          agenda.profesional,
          { agenda: agenda._id },
          { new: true }
        );
        if (resultado) actualizados++;
      }

      res.status(200).json({
        message: "Sincronización completada",
        totalAgendas: agendas.length,
        usuariosActualizados: actualizados
      });

    } catch (error) {
      console.error('Error al sincronizar agendas:', error);
      res.status(500).json({
        message: "Error al sincronizar agendas",
        error: error.message
      });
    }
  }
};

module.exports = agendaUcadController;

