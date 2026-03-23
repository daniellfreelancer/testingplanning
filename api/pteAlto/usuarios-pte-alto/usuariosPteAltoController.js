// api/pte-alto/usuarios/usuariosPteAltoController.js  (por ejemplo)
const UsuariosPteAlto = require("./usuariosPteAlto");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Institucion = require("../../institucion/institucionModel");
const sendWelcomeColaboradorPuenteAlto = require("../mail/welcomeColaborador");
const sendWelcomeUsuarioExternoPteAlto = require("../mail/welcomeUsuarioExternoPteAlto");
const sendUsuarioValidadoPteAlto = require("../mail/usuarioValidadoPteAlto");
const sendUsuarioDeshabilitadoPteAlto = require("../mail/usuarioDeshabilitadoPteAlto");
const sendUsuarioHabilitadoPteAlto = require("../mail/usuarioHabilitadoPteAlto");
const sendUsuarioRechazadoPteAlto = require("../mail/usuarioRechazadoPteAlto");
const ReservasPteAlto = require("../reservas-pte-alto/reservasPteAlto");
const ComplejosDeportivosPteAlto = require("../complejos-deportivos/complejosDeportivosPteAlto");

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
      if (usuarioPteAltoEmail ) {
        return res
          .status(400)
          .json({ message: "El correo ya existe, ingrese otro correo" });
      }
      if (usuarioPteAltoRut) {
        return res
          .status(400)
          .json({ message: "El rut ya existe, ingrese otro rut" });
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

    //enviar correo de bienvenida a los roles de colaboradores
    if (nuevoUsuarioPteAlto.rol === "ADMIN"
      || nuevoUsuarioPteAlto.rol === "SUPERVISOR"
      || nuevoUsuarioPteAlto.rol === "AGENDAMIENTO"
      || nuevoUsuarioPteAlto.rol === "ADMIN_RECINTO"
      || nuevoUsuarioPteAlto.rol === "COORDINADOR"
      || nuevoUsuarioPteAlto.rol === "MONITOR"
      || nuevoUsuarioPteAlto.rol === "COMUNICACIONES"
      || nuevoUsuarioPteAlto.rol === "TERRITORIO_DEPORTIVO"
    ) {
      await sendWelcomeColaboradorPuenteAlto(nuevoUsuarioPteAlto.email, password, nuevoUsuarioPteAlto.nombre);
    }

 
      // mostrar por consola el password generado
      console.log("Password generado:", password);
      res.status(201).json({
        message: "Usuario creado correctamente",
        usuarioPteAlto: nuevoUsuarioPteAlto,
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
      const { nombre, apellido, email, rut, rol, institucion, tipoDocumento } = req.body;

      const usuarioPteAltoEmail = await UsuariosPteAlto.findOne({ email });
      if (usuarioPteAltoEmail) {
        return res.status(400).json({
          message: "El correo ya está registrado",
          code: "email_duplicado",
        });
      }

      const tipoDoc = tipoDocumento || "rut";
      let usuarioPteAltoRut;
      if (tipoDoc === "rut") {
        usuarioPteAltoRut = await UsuariosPteAlto.findOne({
          rut,
          $or: [{ tipoDocumento: "rut" }, { tipoDocumento: null }, { tipoDocumento: { $exists: false } }],
        });
      } else {
        usuarioPteAltoRut = await UsuariosPteAlto.findOne({ rut, tipoDocumento: "pasaporte" });
      }
      if (usuarioPteAltoRut) {
        return res.status(400).json({
          message: "El documento ya está registrado",
          code: "documento_duplicado",
        });
      }

      const password = generateRandomPassword(8);
      const passwordHashed = bcryptjs.hashSync(password, 10);
      const nuevoUsuarioPteAlto = new UsuariosPteAlto({
        nombre,
        apellido,
        email,
        rut,
        rol,
      //  password: [passwordHashed],
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

      // if (req.file.fotoCedulaFrontal) {
      //   try {
      //     const key = await uploadMulterFile(req.file.fotoCedulaFrontal);
      //     nuevoUsuarioPteAlto.fotoCedulaFrontal = key;
      //   } catch (err) {
      //     console.log("Error subiendo foto de cédula frontal a S3:", err);
      //     return res.status(500).json({
      //       message: "Error al subir la foto de la cédula frontal",
      //       error: err.message,
      //     });
      //   }
      // }

      if (req.files && req.files["fotoCedulaFrontal"]) {
        try {
          const key = await uploadMulterFile(req.files["fotoCedulaFrontal"][0]);
          nuevoUsuarioPteAlto.fotoCedulaFrontal = key;
        } catch (err) {
          console.log("Error subiendo foto de cédula frontal a S3:", err);
          return res.status(500).json({
            message: "Error al subir la foto de la cédula frontal",
            error: err.message,
          });
        }
      }


      // ⬇️ Subida de archivo usando helper S3 central
      // if (req.file.certificadoDomicilio) {
      //   try {
      //     const key = await uploadMulterFile(req.file.certificadoDomicilio);
      //     // mantenemos la lógica anterior: guardar solo el key (no URL completa)
      //     nuevoUsuarioPteAlto.certificadoDomicilio = key;
      //   } catch (err) {
      //     console.log("Error subiendo certificado a S3:", err);
      //     return res.status(500).json({
      //       message: "Error al subir el certificado de domicilio",
      //       error: err.message,
      //     });
      //   }
      // }
      if (req.files && req.files["certificadoDomicilio"]) {
        try {
          const key = await uploadMulterFile(req.files["certificadoDomicilio"][0]);
          nuevoUsuarioPteAlto.certificadoDomicilio = key;
        } catch (err) {
          console.log("Error subiendo certificado de domicilio a S3:", err);
          return res.status(500).json({
            message: "Error al subir el certificado de domicilio",
            error: err.message,
          });
        }
      }

      await nuevoUsuarioPteAlto.save();

      try {
        await sendWelcomeUsuarioExternoPteAlto(nuevoUsuarioPteAlto);
      } catch (err) {
        console.error("Error enviando email de bienvenida (usuario ya creado):", err);
      }

      res.status(201).json({
        message: "Cuenta creada correctamente",
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
      const { 
        nombre, 
        apellido, 
        email, 
        rut, 
        rol, 
        status,
        fechaNacimiento,
        sexo,
        telefono,
        direccion,
        region,
        comuna,
        estadoValidacion
      } = req.body;
      
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (apellido !== undefined) updateData.apellido = apellido;
      if (email !== undefined) updateData.email = email;
      if (rut !== undefined) updateData.rut = rut;
      if (rol !== undefined) updateData.rol = rol;
      if (status !== undefined) updateData.status = status;
      if (fechaNacimiento !== undefined) updateData.fechaNacimiento = fechaNacimiento;
      if (sexo !== undefined) updateData.sexo = sexo;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (region !== undefined) updateData.region = region;
      if (comuna !== undefined) updateData.comuna = comuna;
      if (estadoValidacion !== undefined) updateData.estadoValidacion = estadoValidacion;
      
      const usuarioPteAlto = await UsuariosPteAlto.findByIdAndUpdate(
        id,
        updateData,
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

  obtenerFichaUsuarioRechazadoPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioPteAlto = await UsuariosPteAlto.findById(id);
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario no encontrado" });
      }
      if (usuarioPteAlto.estadoValidacion !== "rechazado") {
        return res
          .status(403)
          .json({ message: "Este enlace solo está disponible para usuarios con solicitud rechazada" });
      }
      res.status(200).json({
        message: "Ficha de usuario rechazado",
        usuarioPteAlto,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener ficha",
        error: error.message,
      });
    }
  },

  actualizarDatosUsuarioRechazadoPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nombre,
        apellido,
        email,
        telefono,
        fechaNacimiento,
        sexo,
        direccion,
        region,
        comuna,
        rut,
        pasaporte,
        tipoDocumento,
      } = req.body;

      const usuarioPteAlto = await UsuariosPteAlto.findById(id);
      if (!usuarioPteAlto) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (usuarioPteAlto.estadoValidacion !== "rechazado") {
        return res
          .status(403)
          .json({ message: "Solo puedes actualizar datos si tu solicitud fue rechazada" });
      }

      const updateData = { estadoValidacion: "pendiente", motivoRechazo: "", motivoValidacion: "" };
      if (nombre !== undefined) updateData.nombre = nombre;
      if (apellido !== undefined) updateData.apellido = apellido;
      if (email !== undefined) updateData.email = email;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (fechaNacimiento !== undefined) updateData.fechaNacimiento = fechaNacimiento;
      if (sexo !== undefined) updateData.sexo = sexo;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (region !== undefined) updateData.region = region;
      if (comuna !== undefined) updateData.comuna = comuna;
      if (tipoDocumento !== undefined) updateData.tipoDocumento = tipoDocumento;
      if (rut !== undefined || pasaporte !== undefined) {
        updateData.rut = rut !== undefined ? rut : pasaporte;
      }

      if (req.files && req.files["certificadoDomicilio"]) {
        try {
          const key = await uploadMulterFile(req.files["certificadoDomicilio"][0]);
          updateData.certificadoDomicilio = key;
        } catch (err) {
          console.error("Error subiendo certificado:", err);
          return res.status(500).json({
            message: "Error al subir el certificado de domicilio",
            error: err.message,
          });
        }
      }
      
      if (req.files && req.files["fotoCedulaFrontal"]) {
        try {
          const key = await uploadMulterFile(req.files["fotoCedulaFrontal"][0]);
          updateData.fotoCedulaFrontal = key;
        } catch (err) {
          console.log("Error subiendo foto de cédula frontal a S3:", err);
          return res.status(500).json({
            message: "Error al subir la foto de la cédula frontal",
            error: err.message,
          });
        }
      }

      const usuarioActualizado = await UsuariosPteAlto.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      res.status(200).json({
        message: "Datos actualizados correctamente. Tu cuenta será revisada nuevamente.",
        usuarioPteAlto: usuarioActualizado,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al actualizar datos",
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
          "nombre apellido email rut tipoDocumento rol status institucion estadoValidacion certificadoDomicilio fotoCedulaFrontal motivoValidacion motivoRechazo comuna ciudad region fechaNacimiento sexo direccion telefono"
        ).populate("talleresInscritos", "nombre");
        const reservasPteAlto = await ReservasPteAlto.find({ usuario: { $in: usuariosPteAlto.map(usuario => usuario._id) } }).populate("espacioDeportivo", {nombre: 1} , {fechaInicio: 1});

        // retornar las reservas de cada usuario en la lista de los usuarios encontrados

        let usuariosPteAltoConReservas = usuariosPteAlto.map(usuario => {
          return {
            ...usuario._doc,
            reservas: reservasPteAlto.filter(reserva => reserva.usuario._id.equals(usuario._id)),
          };
        });

      res.status(200).json({
        response: usuariosPteAltoConReservas ?? [],
        message: usuariosPteAltoConReservas?.length > 0 ? "Usuarios PTE Alto encontrados" : "No se encontraron usuarios PTE Alto",
        success: true,
      });
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

  actualizarCertificadoDomicilioPteAlto: async (req, res) => {
    try {
      const { id } = req.params;

      // validar existencia de usuario
      const usuarioPteAlto = await UsuariosPteAlto.findById(id);
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }

      // validar archivo
      if (!req.file) {
        return res.status(400).json({
          message: "No se adjuntó ningún archivo de certificado de domicilio",
        });
      }

      // subir nuevo certificado a S3
      let key;
      try {
        key = await uploadMulterFile(req.file);
      } catch (err) {
        console.error("Error subiendo certificado a S3:", err);
        return res.status(500).json({
          message: "Error al subir el certificado de domicilio",
          error: err.message,
        });
      }

      // actualizar campo en el usuario
      usuarioPteAlto.certificadoDomicilio = key;
      await usuarioPteAlto.save();

      return res.status(200).json({
        message: "Certificado de domicilio actualizado correctamente",
        response: {
          _id: usuarioPteAlto._id,
          certificadoDomicilio: usuarioPteAlto.certificadoDomicilio,
        },
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al actualizar certificado de domicilio",
        error: error.message,
      });
    }
  },


  validarUsuarioPteAlto: async (req, res) => {
    try {
      const { id } = req.params;
      const { estadoValidacion, status, motivoValidacion, motivoRechazo } = req.body;
      
      // Buscar el usuario
      const usuarioPteAlto = await UsuariosPteAlto.findById(id);
      if (!usuarioPteAlto) {
        return res
          .status(404)
          .json({ message: "Usuario PTE Alto no encontrado" });
      }

      // Capturar estado previo antes de modificar (para detectar qué email enviar)
      const statusPrev = usuarioPteAlto.status;
      const estadoValidacionPrev = usuarioPteAlto.estadoValidacion;

      // Actualizar campos según lo que se envíe
      if (estadoValidacion !== undefined) {
        usuarioPteAlto.estadoValidacion = estadoValidacion;
      }
      
      if (status !== undefined) {
        // Convertir string a boolean si es necesario
        usuarioPteAlto.status = status === "true" || status === true;
      }
      
      if (motivoValidacion !== undefined) {
        usuarioPteAlto.motivoValidacion = motivoValidacion;
      }
      
      if (motivoRechazo !== undefined) {
        usuarioPteAlto.motivoRechazo = motivoRechazo;
      }

      await usuarioPteAlto.save();

      // Enviar email según la acción detectada (no bloquear respuesta si falla)
      try {
        const statusNew = usuarioPteAlto.status;
        const estadoValidacionNew = usuarioPteAlto.estadoValidacion;

        // Deshabilitar: status pasó de true a false
        if (statusNew === false && statusPrev === true) {
          const motivo = usuarioPteAlto.motivoValidacion || usuarioPteAlto.motivoRechazo;
          await sendUsuarioDeshabilitadoPteAlto(usuarioPteAlto, motivo);
        }
        // Validar: primera validación (pendiente/rechazado -> validado + habilitado)
        else if (
          statusNew === true &&
          estadoValidacionNew === "validado" &&
          (estadoValidacionPrev === "pendiente" || estadoValidacionPrev === "rechazado")
        ) {
          await sendUsuarioValidadoPteAlto(usuarioPteAlto);
        }
        // Habilitar: re-activación de usuario previamente deshabilitado
        else if (statusNew === true && statusPrev === false) {
          await sendUsuarioHabilitadoPteAlto(usuarioPteAlto);
        }
        // Rechazar: usuario pendiente o validado que es rechazado
        else if (estadoValidacionNew === "rechazado") {
          const motivo = usuarioPteAlto.motivoRechazo || usuarioPteAlto.motivoValidacion;
          await sendUsuarioRechazadoPteAlto(usuarioPteAlto, motivo);
        }
      } catch (emailError) {
        console.error("Error enviando email de notificación (usuario actualizado correctamente):", emailError);
      }
      
      res.status(200).json({
        message: "Usuario PTE Alto actualizado correctamente",
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


      
      // ⬇️ Subida de archivo usando helper S3 central (se debe subir el certificado de domicilio)
      if (req.file.certificadoDomicilio) {
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
      const usuariosInternosPteAlto = await UsuariosPteAlto.find({ rol: { $in: ['ADMIN', 'SUPERVISOR', 'AGENDAMIENTO', 'ADMIN_RECINTO', 'COORDINADOR', 'MONITOR', 'COMUNICACIONES', 'TERRITORIO_DEPORTIVO'] } });
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
  },
  obtenerColaboradoresPteAlto: async (req, res) => {
    try {
      const colaboradoresPteAlto = await UsuariosPteAlto.find({ rol: 'COLABORADOR' });
      res.status(200).json({
        message: "Colaboradores PTE Alto encontrados correctamente",
        response: colaboradoresPteAlto,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener colaboradores PTE Alto",
        error: error.message,
      });
    }
  },
  cambiarContraseñaUsuarioPteAlto: async (req, res) => {

    /**
     * el controlador debe recibir el id del usuario, la contraseña actual y la nueva contraseña
     * el controlador debe validar si la contraseña actual es correcta
     * el controlador debe actualizar la contraseña del usuario
     * el controlador debe devolver un mensaje de éxito o error
     */

    try {
      const { id } = req.params;
      const { contrasenaActual, nuevaContrasena } = req.body;
      
      // Validar que se envíen los campos requeridos
      if (!contrasenaActual || !nuevaContrasena) {
        return res.status(400).json({ message: "La contraseña actual y la nueva contraseña son requeridas" });
      }
      
      const usuarioPteAlto = await UsuariosPteAlto.findById(id);
      if (!usuarioPteAlto) {
        return res.status(404).json({ message: "Usuario PTE Alto no encontrado" });
      }

      // validar si la contraseña actual es correcta
      const isMatch = usuarioPteAlto.password.filter((userpassword) =>
        bcryptjs.compareSync(contrasenaActual, userpassword)
      );

      if (isMatch.length === 0) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }

      // Actualizar la contraseña
      usuarioPteAlto.password = [bcryptjs.hashSync(nuevaContrasena, 10)];
      await usuarioPteAlto.save();
      
      return res.status(200).json({
        message: "Contraseña actualizada correctamente",
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al cambiar contraseña usuario PTE Alto",
        error: error.message,
      });
    }
  },
  actualizarColaboradorPteAlto : async (req, res) => {

    try {
      const {idColaborador} = req.params;
      const { nombre, apellido, email, rut, rol } = req.body;
      const colaboradorPteAlto = await UsuariosPteAlto.findByIdAndUpdate(idColaborador, { nombre, apellido, email, rut, rol }, { new: true });
      
      res.status(200).json({ message: "Colaborador PTE Alto actualizado correctamente", colaboradorPteAlto });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al actualizar colaborador PTE Alto", error: error.message });
    }
  },
  adminsComplejosPteAlto: async (req, res) => {
    try {
      const { idUsuario } = req.params;
      const { complejosArray } = req.body;

      if (!Array.isArray(complejosArray)) {
        return res.status(400).json({ message: "complejosArray debe ser un array de IDs" });
      }

      const usuarioPteAlto = await UsuariosPteAlto.findById(idUsuario);
      if (!usuarioPteAlto) {
        return res.status(404).json({ message: "Usuario PTE Alto no encontrado" });
      }

      const idsDeseados = complejosArray.map((id) => id.toString());
      const idsActuales = (usuarioPteAlto.complejosAdmin || []).map((id) => id.toString());

      const idsAgregar = idsDeseados.filter((id) => !idsActuales.includes(id));
      const idsQuitar = idsActuales.filter((id) => !idsDeseados.includes(id));

      if (idsAgregar.length > 0) {
        const complejosAgregar = await ComplejosDeportivosPteAlto.find({ _id: { $in: idsAgregar } });
        for (const complejo of complejosAgregar) {
          if (!complejo.admins.some((id) => id.toString() === usuarioPteAlto._id.toString())) {
            complejo.admins.push(usuarioPteAlto._id);
            await complejo.save();
          }
        }
        for (const complejo of complejosAgregar) {
          usuarioPteAlto.complejosAdmin.push(complejo._id);
        }
      }

      if (idsQuitar.length > 0) {
        const complejosQuitar = await ComplejosDeportivosPteAlto.find({ _id: { $in: idsQuitar } });
        for (const complejo of complejosQuitar) {
          complejo.admins = complejo.admins.filter(
            (id) => id.toString() !== usuarioPteAlto._id.toString()
          );
          await complejo.save();
        }
        usuarioPteAlto.complejosAdmin = usuarioPteAlto.complejosAdmin.filter(
          (id) => !idsQuitar.includes(id.toString())
        );
      }

      await usuarioPteAlto.save();

      res.status(200).json({
        message: "Complejos deportivos del usuario actualizados correctamente",
        usuarioPteAlto,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al actualizar los complejos deportivos del usuario",
        error: error.message,
      });
    }
  },
};

module.exports = usuariosPteAltoController;