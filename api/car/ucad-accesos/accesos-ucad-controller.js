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
      inicio.setHours(0, 0, 0, 0);
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

      // El RUT viene sin dígito verificador (ej: 27210192)
      // En la BD está almacenado con formato completo (ej: 27210192-2)
      // Buscamos usando regex para encontrar RUTs que empiecen con el número recibido
      const rutLimpio = rut.replace(/-/g, '').trim(); // Limpiar cualquier guion que pueda venir
      
      // Buscar RUT que comience con el número recibido seguido de guion y dígito verificador
      const usuarioUcad = await UsuariosUcad.findOne({ 
        rut: { $regex: `^${rutLimpio}-` } 
      });
      
      if (!usuarioUcad) {
        return res.status(404).json({ message: "Usuario ucad no encontrado" });
      }

      if (usuarioUcad.rol !== "deportista") {
        /**
         * aqui vamos a registrar un acceso ucad con el rol no deportista
         */
      }

      //buscar las citas ucad por usuario ucad
        const citasUcad = await CitasUcad.find({ deportista: usuarioUcad._id }).populate('profesional', 'nombre apellido email');

      /** 
       * en caso de encontrar citas ucad, debe verificar si la/s cita/s tiene estado pendiente o derivada y el campo fecha es igual a hoy sin importar la hora
       * 
       */

      if (citasUcad.length > 0) {
        /**
         * en caso de encontrar citas ucad, debe verificar si la/s cita/s tiene estado pendiente o derivada y el campo fecha es igual a hoy y la hora actual debe ser menor al menos 2 horas antes de la hora de la cita
         */
        const horaActual = new Date().getHours();
        const citasPendientesHoy = citasUcad.filter(cita => cita.estado === "pendiente" && cita.fecha.toDateString() === new Date().toDateString());
        const citasDerivadasHoy = citasUcad.filter(cita => cita.estado === "derivada" && cita.fecha.toDateString() === new Date().toDateString());
        const citasPendientesODerivadas = [...citasPendientesHoy, ...citasDerivadasHoy];

        if (citasPendientesODerivadas.length > 0) {
          /**
           * por cada cita pendiente o derivada, debe crear una notificacion ejemplo:
           * 
           * {"createdBy": usuarioUcad._id, "target": usuarioUcad._id, "motivo": "Tu cita con el profesional [nombre profesional] ha sido pendiente o derivada", "prioridad": "alta", "tipo": "cita"}
           * 
           * luego debe guardar la notificacion en la base de datos
           * 
           * await NotificacionUcad.create({
           *   createdBy: usuarioUcad._id,
           *   target: usuarioUcad._id,
           *   motivo: "Tu cita con el profesional [nombre profesional] ha sido pendiente o derivada",
           *   prioridad: "alta",
           *   tipo: "cita"
           * });
           */

          // for (const cita of citasPendientesODerivadas) {
          //   const notificacion = await new NotificacionesUcad({
          //     createdBy: usuarioUcad._id,
          //     target: cita.profesional,
          //     motivo: `Tu cita con el profesional ${cita.profesional.nombre} ha sido pendiente o derivada`,
          //     prioridad: "alta",
          //     tipo: "cita"
          //   })
          //   await notificacion.save();
          // }

          for (const cita of citasPendientesODerivadas) {
            await sendEmailAsistenciaCita(cita.profesional.email, usuarioUcad.nombre + " " + usuarioUcad.apellido, cita);
          }

          //**
          // ahora debe crear un acceso para registrar que ingreso a las instalaciones

          //  */

          const acceso = await AccesosUcad({
            usuario: "6945e1914f071a7cad249dff",
            usuarioAutorizado: usuarioUcad._id,
            accesoLugar: "CAR Ingreso",
            accesoTipo: "ingreso",
            resultado: "permitido",
            motivo: "Ingreso a las instalaciones",

          }).save();


          res.status(200).json({
            message:"Registro de acceso creado correctamente y notificaciones enviadas",
            response: acceso,
            success: true,
          })

        }
      }
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }


  }
};

module.exports = AccesosUcadController;
