const mongoose = require("mongoose");
const PatentesPiscina = require("./patentesPiscinaModel");
const Institucion = require("../institucion/institucionModel");
const UsuariosComplejos = require("../usuarios-complejos/usuariosComplejos");

const patentesPiscinaController = {
  crear: async (req, res) => {
    try {
      const {
        institucion,
        usuario: usuarioFromBody,
        tipoRut,
        rut,
        nombre,
        apellido,
        correo,
        telefono,
        tipoUsuario,
        institucionNombre,
        diasAsistencia,
        contrato,
        tipoVehiculo,
        marcaVehiculo,
        marcaVehiculoOtro,
        patente,
        autorizacionDatos,
      } = req.body;

      if (!institucion || !rut || !nombre || !apellido || !correo || !patente) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos requeridos: institucion, rut, nombre, apellido, correo, patente",
        });
      }

      const institucionDoc = await Institucion.findById(institucion);
      if (!institucionDoc) {
        return res.status(404).json({
          success: false,
          message: "Institución no encontrada",
        });
      }

      let usuarioId = null;
      if (usuarioFromBody && mongoose.Types.ObjectId.isValid(usuarioFromBody)) {
        const usuarioExistente = await UsuariosComplejos.findById(usuarioFromBody);
        if (usuarioExistente) usuarioId = usuarioExistente._id;
      }
      if (!usuarioId) {
        const rutLimpio = String(rut).trim().toUpperCase().replace(/\./g, "").replace(/-/g, "");
        const usuario = await UsuariosComplejos.findOne({ rut: rutLimpio });
        if (usuario) usuarioId = usuario._id;
      }

      const diasArray = Array.isArray(diasAsistencia)
        ? diasAsistencia
        : typeof diasAsistencia === "string"
          ? (diasAsistencia || "").split(",").map((d) => d.trim()).filter(Boolean)
          : [];

      const nuevaPatente = new PatentesPiscina({
        institucion,
        usuario: usuarioId,
        tipoRut: tipoRut || undefined,
        rut: String(rut).trim(),
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        correo: String(correo).trim(),
        telefono: telefono ? String(telefono).trim() : undefined,
        tipoUsuario: tipoUsuario || undefined,
        institucionNombre: institucionNombre || undefined,
        diasAsistencia: diasArray,
        contrato: contrato || undefined,
        tipoVehiculo: tipoVehiculo || undefined,
        marcaVehiculo: marcaVehiculo || undefined,
        marcaVehiculoOtro: marcaVehiculoOtro || undefined,
        patente: String(patente).trim().toUpperCase(),
        autorizacionDatos: autorizacionDatos !== false,
      });

      await nuevaPatente.save();

      res.status(201).json({
        success: true,
        message: "Autorización de patente registrada correctamente",
        patente: nuevaPatente,
      });
    } catch (error) {
      console.error("Error en crear patente:", error);
      res.status(500).json({
        success: false,
        message: "Error al guardar la autorización de patente",
        error: error.message,
      });
    }
  },

  contar: async (req, res) => {
    try {
      const total = await PatentesPiscina.countDocuments();
      res.status(200).json({
        success: true,
        total,
      });
    } catch (error) {
      console.error("Error contando patentes:", error);
      res.status(500).json({
        success: false,
        message: "Error al contar patentes",
        error: error.message,
      });
    }
  },

  listarTodas: async (req, res) => {
    try {
      const patentes = await PatentesPiscina.find()
        .sort({ createdAt: -1 })
        .populate("usuario", "nombre apellido rut correo telefono")
        .populate("institucion", "nombre")
        .lean();
      res.status(200).json({
        success: true,
        patentes,
        total: patentes.length,
      });
    } catch (error) {
      console.error("Error listando patentes:", error);
      res.status(500).json({
        success: false,
        message: "Error al listar patentes",
        error: error.message,
      });
    }
  },

  listarPorInstitucion: async (req, res) => {
    try {
      const { institucion } = req.params;
      const patentes = await PatentesPiscina.find({ institucion })
        .sort({ createdAt: -1 })
        .lean();
      res.status(200).json({
        success: true,
        patentes,
      });
    } catch (error) {
      console.error("Error listando patentes:", error);
      res.status(500).json({
        success: false,
        message: "Error al listar patentes",
        error: error.message,
      });
    }
  },

  listarPorRut: async (req, res) => {
    try {
      const { rut } = req.params;
      const rutLimpio = String(rut).trim().toUpperCase().replace(/\./g, "").replace(/-/g, "");
      const patentes = await PatentesPiscina.find({
        $or: [
          { rut: { $regex: rutLimpio, $options: "i" } },
          { rut: rutLimpio },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();
      res.status(200).json({
        success: true,
        patentes,
      });
    } catch (error) {
      console.error("Error listando patentes por RUT:", error);
      res.status(500).json({
        success: false,
        message: "Error al listar patentes",
        error: error.message,
      });
    }
  },
};

module.exports = patentesPiscinaController;
