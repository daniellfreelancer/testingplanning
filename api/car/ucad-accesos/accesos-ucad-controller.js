const AccesosUcad = require("./accesos-ucad");
const UsuariosUcad = require("../ucad-usuarios/usuarios-ucad");
const NotificacionesUcad = require("../ucad-notificaciones/notificaciones-ucad");
const CitasUcad = require("../ucad-citas/citas-ucad");
const sendEmailAsistenciaCita = require("../email/emailAsistenciacita");
// Populate usuariosUcad (ajusta los campos a los reales en tu modelo)
const queryPopulate = [
  {
    path: "usuario usuarioAutorizado",
    select: "nombre apellido rut email telefono rol especialidad",
  },
  {
    path: "institucion",
    select: "nombre",
  },
];

const calcularFechasPorPeriodo = (periodo, fechaInicio = null, fechaFin = null) => {
  const ahora = new Date();
  const inicio = new Date();
  const fin = new Date();

  switch (periodo) {
    case "hoy":
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
      break;

    case "semana": {
      const diaSemana = ahora.getDay(); // 0 domingo
      const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
      inicio.setDate(ahora.getDate() - diasHastaLunes);
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    }

    case "mes":
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);x|
      fin.setMonth(ahora.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
      break;

    case "todos":
      return null;

    case "rango":
      if (fechaInicio && fechaFin) {
        inicio.setTime(new Date(fechaInicio).getTime());
        inicio.setHours(0, 0, 0, 0);
        fin.setTime(new Date(fechaFin).getTime());
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
      }
      return null;

    default:
      return null;
  }

  return { inicio, fin };
};

const AccesosUcadController = {
  crearAccesoUcad: async (req, res) => {
    try {
      const {
        usuario,
        usuarioAutorizado,
        institucion,
        accesoLugar,
        accesoTipo,
        resultado,
        motivo,
        metadata,
      } = req.body;

      if (!usuario) {
        return res.status(400).json({ message: "El campo usuario es requerido" });
      }

      const acceso = await AccesosUcad.create({
        usuario,
        usuarioAutorizado: usuarioAutorizado || null,
        institucion: institucion || null,
        accesoLugar: accesoLugar || "",
        accesoTipo: accesoTipo || "",
        resultado: resultado || "permitido",
        motivo: motivo || "",
        metadata: metadata || {},
      });

      return res.status(201).json(acceso);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  obtenerAccesosPorInstitucion: async (req, res) => {
    try {
      const { institucion, periodo = "todos" } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      let query = { institucion };

      if (periodo !== "todos") {
        const fechas =
          periodo === "rango"
            ? calcularFechasPorPeriodo(periodo, fechaInicio, fechaFin)
            : calcularFechasPorPeriodo(periodo);

        if (fechas) {
          query.createdAt = { $gte: fechas.inicio, $lte: fechas.fin };
        }
      }

      const accesos = await AccesosUcad.find(query)
        .sort({ createdAt: -1 })
        .populate(queryPopulate);

      return res.status(200).json(accesos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  obtenerAccesosPorUsuario: async (req, res) => {
    try {
      const { usuarioId, periodo = "todos" } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      let query = { usuario: usuarioId };

      if (periodo !== "todos") {
        const fechas =
          periodo === "rango"
            ? calcularFechasPorPeriodo(periodo, fechaInicio, fechaFin)
            : calcularFechasPorPeriodo(periodo);

        if (fechas) {
          query.createdAt = { $gte: fechas.inicio, $lte: fechas.fin };
        }
      }

      const accesos = await AccesosUcad.find(query)
        .sort({ createdAt: -1 })
        .populate(queryPopulate);

      return res.status(200).json(accesos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  obtenerAccesosPorAutorizador: async (req, res) => {
    try {
      const { autorizadorId, periodo = "todos" } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      let query = { usuarioAutorizado: autorizadorId };

      if (periodo !== "todos") {
        const fechas =
          periodo === "rango"
            ? calcularFechasPorPeriodo(periodo, fechaInicio, fechaFin)
            : calcularFechasPorPeriodo(periodo);

        if (fechas) {
          query.createdAt = { $gte: fechas.inicio, $lte: fechas.fin };
        }
      }

      const accesos = await AccesosUcad.find(query)
        .sort({ createdAt: -1 })
        .populate(queryPopulate);

      return res.status(200).json(accesos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  obtenerTodosLosAccesos: async (req, res) => {
    try {
      const accesos = await AccesosUcad.find()
        .sort({ createdAt: -1 })
        .populate(queryPopulate);

      return res.status(200).json(accesos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  accesoCompletoUcad: async (req, res) => {
    try {
      const { rut } = req.params;

      // Limpiar y validar RUT
      const rutLimpio = rut.replace(/-/g, '').trim();
      if (!rutLimpio || rutLimpio.length < 7) {
        return res.status(400).json({ message: "RUT inválido" });
      }

      // Buscar usuario UCAD por RUT (formato: 27210192-2)
      const usuarioUcad = await UsuariosUcad.findOne({ 
        rut: { $regex: `^${rutLimpio}-` } 
      });
      
      if (!usuarioUcad) {
        return res.status(404).json({ message: "Usuario ucad no encontrado" });
      }

      // ID del sistema para registrar accesos automáticos
      const sistemaUsuarioId = "6945e1914f071a7cad249dff";
      const nombreCompleto = `${usuarioUcad.nombre} ${usuarioUcad.apellido}`;

      // Caso 1: Usuario no es deportista - acceso directo
      if (usuarioUcad.rol !== "deportista") {
        const acceso = await AccesosUcad.create({
          usuario: sistemaUsuarioId,
          usuarioAutorizado: usuarioUcad._id,
          accesoLugar: "CAR",
          accesoTipo: "ingreso",
          resultado: "permitido",
          motivo: "Ingreso a las instalaciones",
        });

        return res.status(200).json({
          message: "Registro de acceso creado correctamente",
          response: acceso,
          success: true,
        });
      }

      // Caso 2: Usuario es deportista - verificar citas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const hoyString = hoy.toDateString();

      // Buscar citas del deportista con populate optimizado
      const citasUcad = await CitasUcad.find({ 
        deportista: usuarioUcad._id 
      }).populate('profesional', 'nombre apellido email');

      // Filtrar citas pendientes o derivadas de hoy
      const citasPendientesODerivadas = citasUcad.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        fechaCita.setHours(0, 0, 0, 0);
        return (
          (cita.estado === "pendiente" || cita.estado === "derivada") &&
          fechaCita.toDateString() === hoyString
        );
      });

      // Si hay citas pendientes/derivadas hoy, enviar notificaciones
      if (citasPendientesODerivadas.length > 0) {
        // Procesar emails y notificaciones en paralelo para cada cita
        const notificacionesPromises = citasPendientesODerivadas.map(async (cita) => {
          const emailPromise = sendEmailAsistenciaCita(
            cita.profesional.email, 
            nombreCompleto, 
            cita
          );
          
          const notificacion = new NotificacionesUcad({
            createdBy: usuarioUcad._id,
            target: cita.profesional._id,
            motivo: `El deportista ${nombreCompleto} ha ingresado a las instalaciones, para la atención de la cita`,
            prioridad: "alta",
            tipo: "cita"
          });
          const notificacionPromise = notificacion.save();

          return Promise.all([emailPromise, notificacionPromise]);
        });

        await Promise.all(notificacionesPromises);
      }

      // Crear registro de acceso (siempre se crea para deportistas)
      const acceso = await AccesosUcad.create({
        usuario: sistemaUsuarioId,
        usuarioAutorizado: usuarioUcad._id,
        accesoLugar: "CAR",
        accesoTipo: "ingreso",
        resultado: "permitido",
        motivo: citasPendientesODerivadas.length > 0 
          ? "Ingreso a las instalaciones con citas programadas" 
          : "Ingreso a las instalaciones",
        metadata: {
          tieneCitasHoy: citasPendientesODerivadas.length > 0,
          cantidadCitas: citasPendientesODerivadas.length
        }
      });

      return res.status(200).json({
        message: citasPendientesODerivadas.length > 0
          ? "Registro de acceso creado correctamente y notificaciones enviadas"
          : "Registro de acceso creado correctamente",
        response: acceso,
        success: true,
      });

    } catch (error) {
      console.error("Error en accesoCompletoUcad:", error);
      return res.status(500).json({ 
        message: error.message || "Error al procesar el acceso" 
      });
    }
  }
};

module.exports = AccesosUcadController;
