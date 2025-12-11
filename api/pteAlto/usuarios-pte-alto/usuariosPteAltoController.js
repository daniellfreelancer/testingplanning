// api/pte-alto/usuarios/usuariosPteAltoController.js  (por ejemplo)
const UsuariosPteAlto = require("./usuariosPteAlto");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Institucion = require("../../institucion/institucionModel");
const sendWelcomeMailPteAlto = require("../../mail/welcomeUsuariosPteAlto");

// 👇 nuevo: usamos el helper centralizado de S3
const { uploadMulterFile } = require("../../../utils/s3Client");

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

const usuariosPteAltoController = {
  crearUsuarioPteAlto: async (req, res) => {
    try {
      const { nombre, apellido, email, rut, rol } = req.body;
      // valida si el correo y rut ya existen
      const usuarioPteAltoEmail = await UsuariosPteAlto.findOne({ email });
      const usuarioPteAltoRut = await UsuariosPteAlto.findOne({ rut });
      if (usuarioPteAltoEmail || usuarioPteAltoRut) {
        return res
          .status(400)
          .json({ message: "El correo o rut ya existe" });
      }

      const password = generateRandomPassword(8);
      const passwordHashed = bcryptjs.hashSync(password, 10);
      const nuevoUsuarioPteAlto = new UsuariosPteAlto({
        nombre,
        apellido,
        email,
        rut,
        rol,
        password: [passwordHashed],
      });

      nuevoUsuarioPteAlto.status = true;
      nuevoUsuarioPteAlto.estadoValidacion = "validado";
      await nuevoUsuarioPteAlto.save();

      // mostrar por consola el password generado
      console.log("Password generado:", password);
      res.status(201).json({
        message: "Usuario PTE Alto creado correctamente",
        usuarioPteAlto: nuevoUsuarioPteAlto,
        password,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al crear usuario PTE Alto",
        error: error.message,
      });
    }
  },

  crearUsuarioExternoPteAlto: async (req, res) => {
    try {
      const { nombre, apellido, email, rut, rol, institucion } = req.body;

      // validar si el correo y rut ya existen
      const usuarioPteAltoEmail = await UsuariosPteAlto.findOne({ email });
      const usuarioPteAltoRut = await UsuariosPteAlto.findOne({ rut });
      if (usuarioPteAltoEmail || usuarioPteAltoRut) {
        return res
          .status(400)
          .json({ message: "El correo o rut ya existe" });
      }

      const password = generateRandomPassword(8);
      const passwordHashed = bcryptjs.hashSync(password, 10);
      const nuevoUsuarioPteAlto = new UsuariosPteAlto({
        nombre,
        apellido,
        email,
        rut,
        rol,
        password: [passwordHashed],
        institucion,
        ...req.body,
      });

      let institucionDoc = await Institucion.findById(institucion);
      if (!institucionDoc) {
        return res
          .status(404)
          .json({ message: "Institución no encontrada" });
      }

      institucionDoc.usuariosPteAlto.push(nuevoUsuarioPteAlto._id);
      await institucionDoc.save();

      // ⬇️ Subida de archivo usando helper S3 central
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          // mantenemos la lógica anterior: guardar solo el key (no URL completa)
          nuevoUsuarioPteAlto.certificadoDomicilio = key;
        } catch (err) {
          console.error("Error subiendo certificado a S3:", err);
          return res.status(500).json({
            message: "Error al subir el certificado de domicilio",
            error: err.message,
          });
        }
      }

      await nuevoUsuarioPteAlto.save();

      // ENVIAR EMAIL DE BIENVENIDA
      await sendWelcomeMailPteAlto(
        nuevoUsuarioPteAlto.email,
        password,
        nuevoUsuarioPteAlto.nombre
      );

      res.status(201).json({
        message: "Usuario PTE Alto creado correctamente",
        response: nuevoUsuarioPteAlto,
        password,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al crear usuario PTE Alto",
        error: error.message,
      });
    }
  },

  actualizarUsuarioPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, rut, rol } = req.body;
      const usuarioPteAlto = await UsuariosPteAlto.findByIdAndUpdate(
        id,
        { nombre, apellido, email, rut, rol },
        { new: true }
      );
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }
      res.status(200).json({
        message: "Usuario PTE Alto actualizado correctamente",
        usuarioPteAlto,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al actualizar usuario PTE Alto",
        error: error.message,
      });
    }
  },

  eliminarUsuarioPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioPteAlto = await UsuariosPteAlto.findByIdAndDelete(id);
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }
      res.status(200).json({
        message: "Usuario PTE Alto eliminado correctamente",
        usuarioPteAlto,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al eliminar usuario PTE Alto",
        error: error.message,
      });
    }
  },

  obtenerUsuarioPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioPteAlto = await UsuariosPteAlto.findById(id);
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }
      res.status(200).json({
        message: "Usuario PTE Alto encontrado correctamente",
        usuarioPteAlto,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener usuario PTE Alto",
        error: error.message,
      });
    }
  },

  loginUsuarioPteAlto: async (req, res) => {
    try {
      const { email, password } = req.body;
      const usuarioPteAlto = await UsuariosPteAlto.findOne({ email });
      if (!usuarioPteAlto) {
        return res.status(404).json({
          message: "Usuario no encontrado, verifica tu correo.",
        });
      } else {
        const isMatch = usuarioPteAlto.password.filter((userpassword) =>
          bcryptjs.compareSync(password, userpassword)
        );

        if (isMatch.length > 0) {
          const token = jwt.sign(
            {
              id: usuarioPteAlto._id,
              role: usuarioPteAlto.rol,
            },
            process.env.KEY_JWT,
            {
              expiresIn: 60 * 60 * 24,
            }
          );
          res.status(200).json({
            message: "Usuario PTE Alto logueado correctamente",
            usuarioPteAlto,
            token,
          });
        } else {
          return res.status(401).json({ message: "Contraseña incorrecta" });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al loguear usuario PTE Alto",
        error: error.message,
      });
    }
  },

  logoutUsuarioPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioPteAlto = await UsuariosPteAlto.findByIdAndUpdate(
        id,
        { logeado: false },
        { new: true }
      );
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }
      res.status(200).json({
        message: "Usuario PTE Alto deslogueado correctamente",
        usuarioPteAlto,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al desloguear usuario PTE Alto",
        error: error.message,
      });
    }
  },

  obtenerTodosLosUsuariosPteAlto: async (req, res) => {
    try {
      // con rol USER
      const usuariosPteAlto = await UsuariosPteAlto.find({ rol: "USER" })
        .sort({ createAt: -1 })
        .select(
          "nombre apellido email rut rol status institucion estadoValidacion certificadoDomicilio comuna ciudad region fechaNacimiento sexo direccion telefono"
        );

      if (usuariosPteAlto?.length > 0) {
        res.status(200).json({
          response: usuariosPteAlto,
          message: "Usuarios PTE Alto encontrados",
          success: true,
        });
      } else {
        res
          .status(404)
          .json({ message: "No se encontraron usuarios PTE Alto" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener usuarios PTE Alto",
        error: error.message,
      });
    }
  },

  asignarAdminPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const { institucion } = req.body;
      const usuarioPteAlto = await UsuariosPteAlto.findById(id);
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }
      let institucionDoc = await Institucion.findById(institucion);
      if (!institucionDoc) {
        return res
          .status(404)
          .json({ message: "Institución no encontrada" });
      }
      institucionDoc.adminsPteAlto.push(usuarioPteAlto._id);
      await institucionDoc.save();
      res.status(200).json({
        message: "Admin PTE Alto asignado correctamente",
        institucionDoc,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al asignar admin PTE Alto",
        error: error.message,
      });
    }
  },

  validarUsuarioPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const { estadoValidacion } = req.body;
      const usuarioPteAlto = await UsuariosPteAlto.findByIdAndUpdate(
        id,
        { estadoValidacion },
        { new: true }
      );
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }

      usuarioPteAlto.status = true;
      usuarioPteAlto.estadoValidacion = estadoValidacion;

      await usuarioPteAlto.save();
      res.status(200).json({
        message: "Usuario PTE Alto validado correctamente",
        usuarioPteAlto,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al validar usuario PTE Alto",
        error: error.message,
      });
    }
  },

  crearUsuarioFormPteAlto: async (req, res) => {
    try {
      const { nombre, apellido, email, rut } = req.body;

      let institucion = "6925f10308c7b00a3c4498ca";
      let rol = "USER";

      // validar si el rut ya existe
      const usuarioPteAltoRut = await UsuariosPteAlto.findOne({ rut });
      if (usuarioPteAltoRut) {
        return res.status(400).json({
          message: "El RUT ya existe",
          response: usuarioPteAltoRut?._id,
          success: true,
        });
      }

      const nuevoUsuarioPteAlto = new UsuariosPteAlto({
        nombre,
        apellido,
        email,
        rut,
        rol,
        institucion,
        ...req.body,
      });

      let institucionDoc = await Institucion.findById(institucion);
      if (!institucionDoc) {
        return res
          .status(404)
          .json({ message: "Institución no encontrada" });
      }

      institucionDoc.usuariosPteAlto.push(nuevoUsuarioPteAlto._id);
      await institucionDoc.save();

      // ⬇️ Subida de archivo usando helper S3 central
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          nuevoUsuarioPteAlto.certificadoDomicilio = key;
        } catch (err) {
          console.error("Error subiendo certificado a S3:", err);
          return res.status(500).json({
            message: "Error al subir el certificado de domicilio",
            error: err.message,
          });
        }
      }

      nuevoUsuarioPteAlto.status = true;
      nuevoUsuarioPteAlto.estadoValidacion = "validado";

      await nuevoUsuarioPteAlto.save();

      // Si algún día quieres enviar mail acá, solo descomentas
      // await sendWelcomeMailPteAlto(nuevoUsuarioPteAlto.email, password, nuevoUsuarioPteAlto.nombre);

      res.status(201).json({
        message: "Usuario creado correctamente",
        response: nuevoUsuarioPteAlto?._id,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al crear usuario PTE Alto",
        error: error.message,
      });
    }
  },
  obtenerUsuariosInternosPteAlto: async (req, res) => {

    try {

      // obtener los usuarios con rol ADMIN, EMPLOYED, TRAINER
      const usuariosInternosPteAlto = await UsuariosPteAlto.find({ rol: { $in: ['ADMIN', 'EMPLOYED', 'TRAINER'] } });
      res.status(200).json({
        message: "Usuarios internos PTE Alto encontrados correctamente",
        response: usuariosInternosPteAlto,
        success: true,
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener usuarios internos PTE Alto",
        error: error.message,
      });
    }
  }
};

module.exports = usuariosPteAltoController;