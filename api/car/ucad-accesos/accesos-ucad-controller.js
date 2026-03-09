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
      const { usuarioAutorizador } = req.body;

      const rutLimpio = rut.replace(/-/g, '').trim();
      if (!rutLimpio || rutLimpio.length < 7) {
        return res.status(400).json({ message: "RUT inválido" });
      }

      const usuarioUcad = await UsuariosUcad.findOne({ 
        rut: { $regex: `^${rutLimpio}-` } 
      });
      
      if (!usuarioUcad) {
        return res.status(404).json({ message: "Usuario ucad no encontrado" });
      }

      const sistemaUsuarioId =  usuarioAutorizador ? usuarioAutorizador : "69aec7e5ace6ed72422f369f";
      const nombreCompleto = `${usuarioUcad.nombre} ${usuarioUcad.apellido}`;

      // Caso 1: Usuario no es deportista - acceso directo sin revisión de citas
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
          usuario: {
            _id: usuarioUcad._id,
            nombre: usuarioUcad.nombre,
            apellido: usuarioUcad.apellido,
            rut: usuarioUcad.rut,
            rol: usuarioUcad.rol,
          },
          citas: { pendientes: [], validadas: [], sobreCupo: [] },
        });
      }

      // Caso 2: Usuario es deportista - buscar todas sus citas de hoy
      const inicioDia = new Date();
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date();
      finDia.setHours(23, 59, 59, 999);

      const citasHoy = await CitasUcad.find({
        deportista: usuarioUcad._id,
        fecha: { $gte: inicioDia, $lte: finDia },
      }).populate('profesional', 'nombre apellido email especialidad');

      const citasPendientes = citasHoy.filter(c => c.estado === "pendiente" || c.estado === "derivada");
      const citasValidadas = citasHoy.filter(c => c.estado === "validada");
      const citasSobreCupo = citasHoy.filter(c => c.sobreCupo === true);

      // Enviar notificaciones para citas pendientes y validadas
      const citasParaNotificar = [...citasPendientes, ...citasValidadas];
      if (citasParaNotificar.length > 0) {
        const notificacionesPromises = citasParaNotificar.map(async (cita) => {
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
            tipo: "cita",
          });
          const notificacionPromise = notificacion.save();

          return Promise.all([emailPromise, notificacionPromise]);
        });

        await Promise.all(notificacionesPromises);
      }

      const totalCitasHoy = citasHoy.length;

      const acceso = await AccesosUcad.create({
        usuario: sistemaUsuarioId,
        usuarioAutorizado: usuarioUcad._id,
        accesoLugar: "CAR",
        accesoTipo: "ingreso",
        resultado: "permitido",
        motivo: totalCitasHoy > 0
          ? "Ingreso a las instalaciones con citas programadas"
          : "Ingreso a las instalaciones",
        metadata: {
          tieneCitasHoy: totalCitasHoy > 0,
          cantidadCitas: totalCitasHoy,
          cantidadPendientes: citasPendientes.length,
          cantidadValidadas: citasValidadas.length,
          cantidadSobreCupo: citasSobreCupo.length,
        },
      });

      return res.status(200).json({
        message: citasParaNotificar.length > 0
          ? "Registro de acceso creado correctamente y notificaciones enviadas"
          : "Registro de acceso creado correctamente",
        response: acceso,
        success: true,
        usuario: {
          _id: usuarioUcad._id,
          nombre: usuarioUcad.nombre,
          apellido: usuarioUcad.apellido,
          rut: usuarioUcad.rut,
          rol: usuarioUcad.rol,
          imgUrl: usuarioUcad.imgUrl,
        },
        citas: {
          pendientes: citasPendientes,
          validadas: citasValidadas,
          sobreCupo: citasSobreCupo,
        },
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
