const AccesosUcad = require("./accesos-ucad");

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
};

module.exports = AccesosUcadController;
