const CitaUcad = require("../ucad-citas/citas-ucad");
const UsuariosUcad = require("./usuarios-ucad");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { uploadMulterFile } = require('../../../utils/s3Client'); // helper centralizado
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;
const renovarPasswordMail = require("../email/renovarPassword");
const bienvenidaDeportistaMail = require("../email/bienvenidaDeportista");
const bienvenidaProfesionalMail = require("../email/bienvenidaProfesional");
const bienvenidaColaboradorMail = require("../email/bienvenidaColaborador");
const bienvenidaAdminMail = require("../email/bienvenidaAdmin");
const sendEmailReservaQR = require("../email/emailreservaQR");


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

const usuariosUcadController = { // si entra como profecional o colaborador,
  registrarDeportista: async (req, res) => { // bienvenida + clave sin url
    try {
      const { nombre, apellido, rut, email, fechaNacimiento, sexo } = req.body;

      // Validar campos requeridos
      if (!nombre || !apellido || !rut || !email || !fechaNacimiento || !sexo) {
        return res.status(400).json({
          message: "Todos los campos son requeridos: nombre, apellido, rut, email, fechaNacimiento, sexo"
        });
      }

      // Convertir fechaNacimiento de string "DD/MM/YYYY" a Date
      let fechaNacimientoDate;
      if (typeof fechaNacimiento === 'string') {
        // Si viene en formato DD/MM/YYYY
        if (fechaNacimiento.includes('/')) {
          const parts = fechaNacimiento.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-11
            const year = parseInt(parts[2], 10);
            fechaNacimientoDate = new Date(year, month, day);
          } else {
            return res.status(400).json({
              message: "Formato de fecha inválido. Use DD/MM/YYYY"
            });
          }
        } else {
          // Si viene en formato ISO (YYYY-MM-DD o ISO string)
          fechaNacimientoDate = new Date(fechaNacimiento);
        }

        // Validar que la fecha sea válida
        if (isNaN(fechaNacimientoDate.getTime())) {
          return res.status(400).json({
            message: "Fecha de nacimiento inválida"
          });
        }
      } else if (fechaNacimiento instanceof Date) {
        fechaNacimientoDate = fechaNacimiento;
      } else {
        return res.status(400).json({
          message: "Formato de fecha inválido"
        });
      }

      // Verificar si ya existe el rut o el correo
      const usuarioExistenteEmail = await UsuariosUcad.findOne({ email });
      const usuarioExistenteRut = await UsuariosUcad.findOne({ rut });

      if (usuarioExistenteEmail || usuarioExistenteRut) {
        return res.status(400).json({
          message: "El correo o RUT ya está registrado"
        });
      }

      // Generar password aleatorio
      const password = generateRandomPassword(8);
      const passwordHashed = bcryptjs.hashSync(password, 10);

      // Crear nuevo usuario deportista
      const nuevoDeportista = new UsuariosUcad({
        nombre,
        apellido,
        rut,
        email,
        fechaNacimiento: fechaNacimientoDate,
        sexo,
        rol: 'deportista',
        password: [passwordHashed],
        estadoValidacion: 'pendiente'
      });

      // Subir imagen si existe
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          const fileUrl = `${cloudfrontUrl}/${key}`;
          nuevoDeportista.imgUrl = fileUrl;
        } catch (err) {
          console.error("Error subiendo imagen a S3:", err);
          return res.status(500).json({
            message: "Error al subir la imagen",
            error: err.message
          });
        }
      }

      await nuevoDeportista.save();
      await bienvenidaDeportistaMail(nuevoDeportista.email, password, nuevoDeportista.nombre);

      // Mostrar password generado por consola
      console.log("Password generado para deportista:", password);

      res.status(201).json({
        message: "Deportista registrado correctamente",
        usuario: nuevoDeportista,
        password // Retornar password para que el admin pueda verlo
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al registrar deportista",
        error: error.message
      });
    }
  },

  registrarColaborador: async (req, res) => { // si entra como profecional o colaborador, bienvenida + clave, profecional a la app y el colaboraador a la web // 
    try {
      const { nombre, apellido, rut, email, telefono, fechaNacimiento, sexo, rol, especialidad, direccion, comuna, region } = req.body;

      // Validar campos requeridos
      if (!nombre || !apellido || !rut || !email || !rol) {
        return res.status(400).json({
          message: "Los campos nombre, apellido, rut, email y rol son requeridos"
        });
      }

      // Validar que el rol sea válido (colaborador, profesional o deportista)
      if (!['colaborador', 'profesional', 'deportista', 'admin'].includes(rol)) {
        return res.status(400).json({
          message: "El rol debe ser: colaborador, profesional o deportista"
        });
      }

      // Verificar si ya existe el rut o el correo
      const usuarioExistenteEmail = await UsuariosUcad.findOne({ email });
      const usuarioExistenteRut = await UsuariosUcad.findOne({ rut });

      if (usuarioExistenteEmail || usuarioExistenteRut) {
        return res.status(400).json({
          message: "El correo o RUT ya está registrado"
        });
      }

      // Generar password aleatorio
      const password = generateRandomPassword(8);
      const passwordHashed = bcryptjs.hashSync(password, 10);

      // Crear nuevo usuario
      const nuevoUsuario = new UsuariosUcad({
        nombre,
        apellido,
        rut,
        email,
        telefono,
        fechaNacimiento,
        sexo,
        rol,
        especialidad,
        direccion,
        comuna,
        region,
        password: [passwordHashed],
        estadoValidacion: 'validado' // Los usuarios creados por admin se validan automáticamente
      });

      // Subir imagen si existe
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          const fileUrl = `${cloudfrontUrl}/${key}`;
          nuevoUsuario.imgUrl = fileUrl;
        } catch (err) {
          console.error("Error subiendo imagen a S3:", err);
          return res.status(500).json({
            message: "Error al subir la imagen",
            error: err.message
          });
        }
      }

      await nuevoUsuario.save();

      if (rol === "profesional") {
        await bienvenidaProfesionalMail(nuevoUsuario.email, password, nuevoUsuario.nombre, rol);
      } else if (rol === "colaborador") {
        await bienvenidaColaboradorMail(nuevoUsuario.email, password, nuevoUsuario.nombre, rol);
      } else if (rol === "admin") {
        await bienvenidaAdminMail(nuevoUsuario.email, password, nuevoUsuario.nombre, rol);
      }



      // Mostrar password generado por consola
      console.log(`Password generado para ${rol}:`, password);

      res.status(201).json({
        message: `Usuario ${rol} creado correctamente`,
        usuario: nuevoUsuario,
        password // Retornar password para que el admin pueda verlo
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al registrar usuario",
        error: error.message
      });
    }
  },

  loginUsuarioUCAD: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validar campos requeridos
      if (!email || !password) {
        return res.status(400).json({
          message: "Email y contraseña son requeridos"
        });
      }

      // Buscar usuario por email
      const usuario = await UsuariosUcad.findOne({ email });

      if (!usuario) {
        return res.status(404).json({
          message: "Usuario no encontrado, verifica tu correo"
        });
      }

      // Verificar password
      const isMatch = usuario.password.filter((userPassword) =>
        bcryptjs.compareSync(password, userPassword)
      );

      if (isMatch.length > 0) {
        // Generar token JWT
        const token = jwt.sign(
          {
            id: usuario._id,
            role: usuario.rol
          },
          process.env.KEY_JWT,
          {
            expiresIn: 60 * 60 * 24 // 24 horas
          }
        );

        // Actualizar estado logged
        usuario.logged = true;
        await usuario.save();

        res.status(200).json({
          message: "Usuario logueado correctamente",
          usuario: {
            id: usuario._id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol,
            rut: usuario.rut,
            telefono: usuario.telefono,
            imgUrl: usuario.imgUrl,
            estadoValidacion: usuario.estadoValidacion
          },
          token
        });
      } else {
        return res.status(401).json({
          message: "Contraseña incorrecta"
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al loguear usuario",
        error: error.message
      });
    }
  },

  logoutUsuarioUCAD: async (req, res) => {
    try {
      const { email } = req.body;

      // Validar campo requerido
      if (!email) {
        return res.status(400).json({
          message: "El email es requerido"
        });
      }

      // Buscar y actualizar usuario
      const usuario = await UsuariosUcad.findOneAndUpdate(
        { email },
        { logged: false },
        { new: true }
      );

      if (!usuario) {
        return res.status(404).json({
          message: "Usuario no encontrado"
        });
      }

      res.status(200).json({
        message: "Usuario deslogueado correctamente",
        usuario: {
          id: usuario._id,
          email: usuario.email,
          logged: usuario.logged
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al desloguear usuario",
        error: error.message
      });
    }
  },

  recuperarPasswordUCAD: async (req, res) => {
    try {
      let { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "El email es requerido" });
      }

      // Normalizar
      email = String(email).trim().toLowerCase();

      // Buscar usuario
      const usuario = await UsuariosUcad.findOne({ email });

      if (!usuario) {
        return res.status(404).json({
          message: "No existe un usuario registrado con ese correo"
        });
      }

      // Generar password aleatorio + hash
      const password = generateRandomPassword(8);
      const passwordHashed = bcryptjs.hashSync(password, 10);

      // Guardar en el array de passwords (historial)
      if (!Array.isArray(usuario.password)) {
        usuario.password = [];
      }
      usuario.password.push(passwordHashed);

      await usuario.save();

      // Enviar correo con la nueva password
      try {
        await renovarPasswordMail(usuario.email, password, usuario.nombre);
        console.log(`Correo de recuperación enviado exitosamente a: ${usuario.email}`);
      } catch (emailError) {
        console.error('Error al enviar correo de recuperación:', emailError);
        // Aunque falle el envío del correo, la contraseña ya fue actualizada
        // Informamos al usuario pero no fallamos la operación completa
        return res.status(200).json({
          message: "Se generó una nueva contraseña. Sin embargo, hubo un problema al enviar el correo. Por favor contacta al administrador.",
          warning: "Error al enviar correo"
        });
      }


      return res.status(200).json({
        message: "Se envió una nueva contraseña al correo"
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error al recuperar contraseña",
        error: error.message
      });
    }
  },

  editarUsuarioUCAD: async (req, res) => {
    try {
      const { _id } = req.params;
      const updateData = { ...req.body };

      // Validar que existe el _id
      if (!_id) {
        return res.status(400).json({
          message: "El _id es requerido"
        });
      }

      // Buscar usuario
      const usuario = await UsuariosUcad.findById(_id);

      if (!usuario) {
        return res.status(404).json({
          message: "Usuario no encontrado"
        });
      }

      // Si se envía un nuevo archivo, subirlo a S3
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          const fileUrl = `${cloudfrontUrl}/${key}`;
          updateData.imgUrl = fileUrl;
        } catch (err) {
          console.error("Error subiendo imagen a S3:", err);
          return res.status(500).json({
            message: "Error al subir la imagen",
            error: err.message
          });
        }
      }

      // Si se actualiza el password, hashearlo
      if (updateData.password) {
        const passwordHashed = bcryptjs.hashSync(updateData.password, 10);
        // Agregar el nuevo password al array (mantener historial)
        usuario.password.push(passwordHashed);
        updateData.password = usuario.password;
      }

      // Actualizar usuario
      const usuarioActualizado = await UsuariosUcad.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        message: "Usuario actualizado correctamente",
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al actualizar usuario",
        error: error.message
      });
    }
  },

  eliminarUsuarioUCAD: async (req, res) => {
    try {
      const { _id } = req.params;

      // Validar que existe el _id
      if (!_id) {
        return res.status(400).json({
          message: "El _id es requerido"
        });
      }

      // Buscar y eliminar usuario
      const usuarioEliminado = await UsuariosUcad.findByIdAndDelete(_id);

      if (!usuarioEliminado) {
        return res.status(404).json({
          message: "Usuario no encontrado"
        });
      }

      res.status(200).json({
        message: "Usuario eliminado correctamente",
        usuario: usuarioEliminado
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al eliminar usuario",
        error: error.message
      });
    }
  },
  
  
  obtenerProfesionales: async (req, res) => {

    try {
      const profesionales = await UsuariosUcad.find({ rol: 'profesional' })
      .populate('agenda')
      .select('nombre apellido email especialidad imgUrl agenda rol rut telefono');
      res.status(200).json({
        message: "Profesionales encontrados correctamente",
        response: profesionales,
        success: true
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener profesionales",
        error: error.message,
        success: false
      });
    }

  },

  obtenerDeportistas: async (req, res) => {

    try {
      const deportistas = await UsuariosUcad.find({ rol: 'deportista' })
      .select('nombre apellido email rut telefono imgUrl rol estadoValidacion fechaNacimiento genero');
      res.status(200).json({
        message: "Deportistas encontrados correctamente",
        response: deportistas,
        success: true
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener deportistas",
        error: error.message,
        success: false
      });
    }

  },

  obtenerColaboradores: async (req, res) => {

    try {
      const colaboradores = await UsuariosUcad.find({ rol: 'colaborador' })
      .select('nombre apellido email rut telefono imgUrl rol estadoValidacion');
      res.status(200).json({
        message: "Colaboradores encontrados correctamente",
        response: colaboradores,
        success: true
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener colaboradores",
        error: error.message,
        success: false
      });
    }

  },

  enviarEmailCitaQR: async (req, res) => {
    try {
      const { citaId } = req.body;

      if (!citaId) {
        return res.status(400).json({ message: "citaId es requerido" });
      }

      // 1) Buscar cita + poblar deportista y profesional (si el schema tiene ref)
      let cita = await CitaUcad.findById(citaId)
        .populate("deportista", "nombre apellido email")
        .populate("profesional", "nombre apellido email");

      if (!cita) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      // 2) Si no se pudo poblar (por schema sin ref), buscar manualmente
      let deportista = cita.deportista;
      if (!deportista || !deportista.email) {
        deportista = await UsuariosUcad.findById(cita.deportista).select("nombre apellido email");
      }

      let profesional = cita.profesional;
      if (!profesional || !profesional.nombre) {
        profesional = await UsuariosUcad.findById(cita.profesional).select("nombre apellido email");
      }

      if (!deportista?.email) {
        return res.status(400).json({
          message: "La cita no tiene email de deportista asociado"
        });
      }

      // 3) URL que irá al QR (base en env; fallback)
      const baseUrl = process.env.CITA_QR_BASE_URL || "https://api.vitalmoveglobal.com/citas/validar-cita";
      const qrUrl = `${baseUrl}/${cita._id}`;

      // 4) Armar “cita enriquecida” para el template
      // (tu mailer puede leer profesional.nombre/apellido)
      const citaParaEmail = cita.toObject ? cita.toObject() : cita;
      citaParaEmail.deportista = deportista;
      citaParaEmail.profesional = profesional;
      citaParaEmail.qrUrl = qrUrl; // por si quieres mostrarlo además del QR

      const nombreDeportista = `${deportista.nombre || ""} ${deportista.apellido || ""}`.trim() || "Usuario";

      // 5) Enviar mail (asumo tu emailreservaQR.js recibe: (email, nombre, cita))
      await sendEmailReservaQR(deportista.email, nombreDeportista, citaParaEmail);

      return res.status(200).json({
        message: "Email de confirmación de cita enviado",
        citaId: String(cita._id),
        emailDestino: deportista.email,
        qrUrl
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error enviando email de confirmación",
        error: error.message
      });
    }
  },
  obtenerUsuarioUCAD: async (req, res) => {
    try {
      const { _id } = req.params;
      const usuario = await UsuariosUcad.findById(_id);

      let usuarioCompleto = {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rut: usuario.rut,
        telefono: usuario.telefono,
        imgUrl: usuario.imgUrl,
        rol: usuario.rol,
        estadoValidacion: usuario.estadoValidacion,
        fechaNacimiento: usuario.fechaNacimiento,
        sexo: usuario.sexo,
        direccion: usuario.direccion,
        comuna: usuario.comuna,
        region: usuario.region,

      }
      res.status(200).json({
        message: "Usuario encontrado correctamente",
        response: usuarioCompleto
      });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener usuario",
        error: error.message
      });
    }
  }

}

module.exports = usuariosUcadController;