const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AdminExterno = require("../models/adminExterno");
const Institucion = require("../api/institucion/institucionModel");
const UsuariosComplejos = require("../api/usuarios-complejos/usuariosComplejos");
const sendCredencialesAdminExterno = require("../api/email/mailAdminExterno");
const AccesoUsuariosComplejos = require("../api/acceso-usuarios-complejos/accesoUsuariosComplejosModel");

const queryPopulateAccesos = [
  {
    path: "usuario usuarioAutorizado",
    select:
      "nombre apellido rut email telefono rol tipoPlan tipoPlanGym tipoCurso nivelCurso tipoContratacion arrendatario nombreArrendatario",
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
      const diaSemana = ahora.getDay();
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

function generateRandomPassword(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    password += characters[randomIndex];
  }
  return password;
}

const adminExternosController = {
  crearAdminExterno: async (req, res) => {
    const { institucion } = req.params;
    const { email, nombreArrendatario } = req.body;

    try {
      const institucionDoc = await Institucion.findById(institucion);
      if (!institucionDoc) {
        return res.status(404).json({ message: "Institución no encontrada" });
      }

      const emailNorm = email?.trim()?.toLowerCase();
      if (!emailNorm) {
        return res.status(400).json({ message: "El email es obligatorio" });
      }
      const nombreArrendatarioVal = nombreArrendatario?.trim() || institucionDoc.nombre || "";
      if (!nombreArrendatarioVal) {
        return res.status(400).json({ message: "La institución es obligatoria" });
      }

      const existe = await AdminExterno.findOne({ email: emailNorm });
      if (existe) {
        return res.status(400).json({
          message: "Ya existe un admin externo con ese email",
        });
      }

      const passwordPlain = generateRandomPassword(8);
      const passwordHash = bcryptjs.hashSync(passwordPlain, 10);

      const newAdmin = new AdminExterno({
        email: emailNorm,
        password: [passwordHash],
        rol: "ADMIN_EXTERNO",
        status: true,
        institucion: institucionDoc._id,
        nombreArrendatario: nombreArrendatarioVal,
        cupos: typeof req.body.cupos === "number" ? req.body.cupos : (parseInt(req.body.cupos, 10) || 0),
        limite: typeof req.body.limite === "number" ? req.body.limite : (parseInt(req.body.limite, 10) || 0),
        fechaRegistro: new Date(),
        from: req.body.from || "vmForm",
      });
      await newAdmin.save();

      const nombreCompleto = [newAdmin.nombre, newAdmin.apellido].filter(Boolean).join(" ") || newAdmin.email;
      const emailEnviado = await sendCredencialesAdminExterno(
        newAdmin.email,
        nombreCompleto,
        passwordPlain,
        newAdmin.nombreArrendatario
      );
      if (!emailEnviado) {
        console.warn("Admin externo creado pero no se pudo enviar el email con la contraseña a:", newAdmin.email);
      }

      return res.status(201).json({
        message: "Admin externo creado correctamente",
        emailEnviado: !!emailEnviado,
        admin: {
          _id: newAdmin._id,
          nombre: newAdmin.nombre,
          apellido: newAdmin.apellido,
          email: newAdmin.email,
          rut: newAdmin.rut,
          nombreArrendatario: newAdmin.nombreArrendatario,
          rol: newAdmin.rol,
          status: newAdmin.status,
        },
      });
    } catch (error) {
      console.error("Error crearAdminExterno:", error);
      return res.status(500).json({
        message: "Error al crear admin externo",
        error: error.message,
      });
    }
  },

  obtenerAdminExternosPorInstitucion: async (req, res) => {
    const { institucion } = req.params;
    try {
      const admins = await AdminExterno.find({ institucion })
        .select("-password")
        .sort({ email: 1 });
      return res.status(200).json({
        message: "Admins externos obtenidos correctamente",
        admins,
      });
    } catch (error) {
      console.error("Error obtenerAdminExternosPorInstitucion:", error);
      return res.status(500).json({
        message: "Error al obtener admins externos",
        error: error.message,
      });
    }
  },

  obtenerTodosAdminExternos: async (req, res) => {
    try {
      const admins = await AdminExterno.find()
        .select("-password")
        .populate("institucion", "nombre descripcion")
        .sort({ email: 1 });
      return res.status(200).json({
        message: "Admins externos obtenidos correctamente",
        admins,
      });
    } catch (error) {
      console.error("Error obtenerTodosAdminExternos:", error);
      return res.status(500).json({
        message: "Error al obtener admins externos",
        error: error.message,
      });
    }
  },

  obtenerAdminExternoPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const admin = await AdminExterno.findById(id)
        .select("-password")
        .populate("institucion", "nombre descripcion")
        .populate("usuarios", "nombre apellido email rut");
      if (!admin) {
        return res.status(404).json({ message: "Admin externo no encontrado" });
      }
      return res.status(200).json({
        message: "Admin externo obtenido correctamente",
        admin,
      });
    } catch (error) {
      console.error("Error obtenerAdminExternoPorId:", error);
      return res.status(500).json({
        message: "Error al obtener admin externo",
        error: error.message,
      });
    }
  },

  actualizarAdminExterno: async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.password;
    if (updateData.cupos !== undefined) updateData.cupos = parseInt(updateData.cupos, 10) || 0;
    if (updateData.limite !== undefined) updateData.limite = parseInt(updateData.limite, 10) || 0;

    try {
      const admin = await AdminExterno.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");
      if (!admin) {
        return res.status(404).json({ message: "Admin externo no encontrado" });
      }
      return res.status(200).json({
        message: "Admin externo actualizado correctamente",
        admin,
      });
    } catch (error) {
      console.error("Error actualizarAdminExterno:", error);
      return res.status(500).json({
        message: "Error al actualizar admin externo",
        error: error.message,
      });
    }
  },

  actualizarStatusAdminExterno: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (typeof status !== "boolean") {
      return res.status(400).json({ message: "status debe ser true o false" });
    }
    try {
      const admin = await AdminExterno.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).select("-password");
      if (!admin) {
        return res.status(404).json({ message: "Admin externo no encontrado" });
      }
      return res.status(200).json({
        message: "Estado actualizado correctamente",
        admin,
      });
    } catch (error) {
      console.error("Error actualizarStatusAdminExterno:", error);
      return res.status(500).json({
        message: "Error al actualizar estado",
        error: error.message,
      });
    }
  },

  obtenerMisUsuarios: async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Token de autenticación requerido" });
    }
    try {
      const decoded = jwt.verify(token, process.env.KEY_JWT || "defaultSecretChangeInProduction");
      const adminId = decoded.id;
      const admin = await AdminExterno.findById(adminId).populate("usuarios");
      if (!admin) {
        return res.status(404).json({ message: "Admin externo no encontrado" });
      }
      const users = Array.isArray(admin.usuarios) ? admin.usuarios : [];
      return res.status(200).json({
        message: "Usuarios obtenidos correctamente",
        users,
        cupos: admin.cupos,
        limite: admin.limite,
      });
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token inválido o expirado" });
      }
      console.error("Error obtenerMisUsuarios:", err);
      return res.status(500).json({
        message: "Error al obtener usuarios",
        error: err.message,
      });
    }
  },

  obtenerHistorialAccesosMisUsuarios: async (req, res) => {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token de autenticación requerido" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.KEY_JWT || "defaultSecretChangeInProduction"
      );
      const adminId = decoded.id;

      const admin = await AdminExterno.findById(adminId).select(
        "institucion usuarios"
      );
      if (!admin) {
        return res
          .status(404)
          .json({ message: "Admin externo no encontrado" });
      }

      const usuariosIds = Array.isArray(admin.usuarios)
        ? admin.usuarios.filter(Boolean)
        : [];

      if (usuariosIds.length === 0) {
        return res.status(200).json([]);
      }

      const { periodo = "todos" } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      const query = {
        institucion: admin.institucion,
        usuarioAutorizado: { $in: usuariosIds },
      };

      if (periodo !== "todos") {
        const fechas =
          periodo === "rango"
            ? calcularFechasPorPeriodo(periodo, fechaInicio, fechaFin)
            : calcularFechasPorPeriodo(periodo);

        if (fechas) {
          query.createdAt = {
            $gte: fechas.inicio,
            $lte: fechas.fin,
          };
        }
      }

      const accesos = await AccesoUsuariosComplejos.find(query)
        .sort({ createdAt: -1 })
        .populate(queryPopulateAccesos);

      return res.status(200).json(accesos);
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token inválido o expirado" });
      }
      console.error("Error obtenerHistorialAccesosMisUsuarios:", err);
      return res.status(500).json({
        message: "Error al obtener historial de accesos",
        error: err.message,
      });
    }
  },

  loginAdminExterno: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }
    try {
      const admin = await AdminExterno.findOne({ email: email.trim().toLowerCase() });
      if (!admin) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }
      if (!admin.status) {
        return res.status(403).json({ message: "Tu cuenta está deshabilitada. Contacta al administrador." });
      }
      const hashes = Array.isArray(admin.password) ? admin.password : [admin.password].filter(Boolean);
      const ok = hashes.some((hash) => bcryptjs.compareSync(password, hash));
      if (!ok) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }
      const token = jwt.sign(
        { id: admin._id, rol: admin.rol || "ADMIN_EXTERNO" },
        process.env.KEY_JWT || "defaultSecretChangeInProduction",
        { expiresIn: 60 * 60 * 24 }
      );
      const userData = {
        id: admin._id,
        email: admin.email,
        nombre: admin.nombre,
        apellido: admin.apellido,
        rol: admin.rol || "ADMIN_EXTERNO",
        nombreArrendatario: admin.nombreArrendatario,
        institucion: admin.institucion,
        cupos: admin.cupos,
        limite: admin.limite,
      };
      return res.status(200).json({
        message: "Inicio de sesión exitoso",
        token,
        user: userData,
      });
    } catch (error) {
      console.error("Error loginAdminExterno:", error);
      return res.status(500).json({
        message: "Error al iniciar sesión",
        error: error.message,
      });
    }
  },

  agregarUsuariosALista: async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Token de autenticación requerido" });
    }
    const { usuarios: userIds } = req.body || {};
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Se requiere un array 'usuarios' con al menos un id" });
    }
    try {
      const decoded = jwt.verify(token, process.env.KEY_JWT || "defaultSecretChangeInProduction");
      const adminId = decoded.id;
      const admin = await AdminExterno.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin externo no encontrado" });
      }
      const current = Array.isArray(admin.usuarios) ? admin.usuarios : [];
      const setIds = new Set(current.map((id) => id.toString()));
      for (const id of userIds) {
        const str = id && (id.toString ? id.toString() : String(id));
        if (str && !setIds.has(str)) {
          setIds.add(str);
          current.push(id);
        }
      }
      admin.usuarios = current;
      await admin.save();
      return res.status(200).json({
        message: "Usuarios agregados a la lista correctamente",
        total: admin.usuarios.length,
      });
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token inválido o expirado" });
      }
      console.error("Error agregarUsuariosALista:", err);
      return res.status(500).json({
        message: "Error al agregar usuarios",
        error: err.message,
      });
    }
  },

  quitarUsuarioDeLista: async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Token de autenticación requerido" });
    }
    const { usuarioId } = req.body || {};
    if (!usuarioId) {
      return res.status(400).json({ message: "Se requiere usuarioId" });
    }
    try {
      const decoded = jwt.verify(token, process.env.KEY_JWT || "defaultSecretChangeInProduction");
      const admin = await AdminExterno.findById(decoded.id);
      if (!admin) {
        return res.status(404).json({ message: "Admin externo no encontrado" });
      }
      const idStr = usuarioId.toString ? usuarioId.toString() : String(usuarioId);
      admin.usuarios = (Array.isArray(admin.usuarios) ? admin.usuarios : []).filter(
        (id) => (id && id.toString()) !== idStr
      );
      await admin.save();

      const userIdObj = mongoose.Types.ObjectId.isValid(usuarioId) ? new mongoose.Types.ObjectId(usuarioId) : null;
      if (userIdObj) {
        await UsuariosComplejos.findByIdAndUpdate(userIdObj, {
          statusArrendatario: false,
        });
      }

      return res.status(200).json({
        message: "Usuario quitado de tu lista correctamente",
        total: admin.usuarios.length,
      });
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token inválido o expirado" });
      }
      console.error("Error quitarUsuarioDeLista:", err);
      return res.status(500).json({
        message: "Error al quitar usuario",
        error: err.message,
      });
    }
  },

  resetearPasswordAdminExterno: async (req, res) => {
    const { id } = req.params;
    try {
      const admin = await AdminExterno.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin externo no encontrado" });
      }
      const newPasswordPlain = generateRandomPassword(8);
      const newPasswordHash = bcryptjs.hashSync(newPasswordPlain, 10);
      admin.password = [newPasswordHash];
      await admin.save();

      const nombreCompleto = [admin.nombre, admin.apellido].filter(Boolean).join(" ") || admin.email;
      const emailEnviado = await sendCredencialesAdminExterno(
        admin.email,
        nombreCompleto,
        newPasswordPlain,
        admin.nombreArrendatario
      );
      if (!emailEnviado) {
        console.warn("Contraseña actualizada pero no se pudo reenviar el email a:", admin.email);
      }

      return res.status(200).json({
        message: "Contraseña restablecida y enviada por email",
        emailEnviado: !!emailEnviado,
        admin: {
          _id: admin._id,
          nombre: admin.nombre,
          apellido: admin.apellido,
          email: admin.email,
          status: admin.status,
        },
      });
    } catch (error) {
      console.error("Error resetearPasswordAdminExterno:", error);
      return res.status(500).json({
        message: "Error al resetear contraseña",
        error: error.message,
      });
    }
  },
  obtenerExternosParaPatentes: async (req, res) =>{

    try {
   const {id} = req.params;


  const externos = await AdminExterno.find({ institucion: id, status: true }).select(
    "nombreArrendatario usuarios status"
  );


    if(!externos){
      return res.status(404).json({message: "No se encontraron externos para patentes"});
    }

    return res.status(200).json({
      message: "Externos para patentes obtenidos correctamente",
      response:externos,
      success: true,
    });

      
    } catch (error) {

      console.error("Error obtenerExternosParaPatentes:", error);
      return res.status(500).json({
        message: "Error al obtener externos para patentes",
        error: error.message,
      });
    }


  }
};

module.exports = adminExternosController;
