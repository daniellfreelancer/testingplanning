const Usuarios = require("./usuariosComplejos");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
//const sendWelcomeEmail = require("../../controllers/mailRegisterUserAdmin");
const sendWelcomeEmail = require("../../controllers/mailRegisterPiscinaSantiago");
const Institucion = require("../institucion/institucionModel");
const CentroDeportivo = require("../centros-deportivos/centrosDeportivosModel");
const sendMailUserContract = require("../mail/mailUserContract");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const UsuariosComplejos = require("./usuariosComplejos");
const usuariosComplejosModel = require("./usuariosComplejos");
const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const publicKey = process.env.AWS_PUBLIC_KEY;
const privateKey = process.env.AWS_SECRET_KEY;
const SuscripcionPlanes = require('../suscripcion-planes/suscripcionPlanes')
const RegistroAccesos = require('../acceso-usuarios-complejos/accesoUsuariosComplejosModel')

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

const queryPopulateOptions = [
  {
    path: "pagos",
    select: "planCurso planNL planGym transaccion monto voucher fechaPago",
    populate: [
      { path: "planCurso", select: "tipoPlan plan valor dias" },
      { path: "recepcion", select: "nombre apellido email rut" },
      { path: "planNL", model: "gestionPlanes" },
      { path: "planGym", model: "gestionPlanes" },
    ],
  },
  {
    path: "planCurso",
    select:
      "tipo tipoPlan plan tieneVariante variante valor dias horarios status",
  },
  {
    path: "planNL",
    select:
      "tipo tipoPlan plan tieneVariante variante valor dias horarios status",
  },
  {
    path: "planGym",
    select:
      " tipotipoPlan plan tieneVariante variante valor dias horarios status",
  },
];

const clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
});

const quizIdentifier = () => crypto.randomBytes(32).toString("hex");

const usuariosComplejosController = {
  crearUsuarioComplejo: async (req, res) => {
    const {
      nombre,
      apellido,
      email,
      rol,
      status,
      rut,
      from,
      institucionId,
      centroDeportivoId,
      espacioDeportivoId,
      tallerId,
    } = req.body;
    const password = generateRandomPassword(8);
    try {
      if (from !== "vmForm") {
        return res.status(400).json({
          message: "No está habilitado para crear cuenta desde esta fuente",
        });
      }

      const existingUserByEmail = await UsuariosComplejos.findOne({ email });
      if (existingUserByEmail) {
        return res
          .status(400)
          .json({ message: "El correo ya se encuentra registrado" });
      }

      const existingUserByRut = await UsuariosComplejos.findOne({ rut });
      if (existingUserByRut) {
        return res
          .status(400)
          .json({ message: "El RUT ya se encuentra registrado" });
      }

      const newUser = new UsuariosComplejos({
        nombre,
        apellido,
        email,
        password: bcryptjs.hashSync(password, 10),
        rol,
        status,
        rut,
      });

      if (institucionId) {
        const institucion = await Institucion.findById(institucionId);
        if (!institucion) {
          return res.status(404).json({ message: "Institución no encontrada" });
        }
        if (newUser.rol === "TRAINER") {
          institucion.profesores.push(newUser._id);
        } else if (newUser.rol === "USER") {
          institucion.usuarios.push(newUser._id);
        } else if (newUser.rol === "ADMIN") {
          institucion.admins.push(newUser._id);
        } else if (newUser.rol === "DIRECTOR") {
          institucion.director.push(newUser._id);
        } else if (newUser.rol === "ADMIN_OFICINA") {
          institucion.adminsOficina.push(newUser._id);
        } else if (newUser.rol === "EMPLOYED") {
          institucion.empleados.push(newUser._id);
        }
        await institucion.save();
        newUser.institucion = institucion._id;
      }

      if (centroDeportivoId) {
        const centroDeportivo = await CentroDeportivo.findById(
          centroDeportivoId
        );
        if (!centroDeportivo) {
          return res
            .status(404)
            .json({ message: "Centro deportivo no encontrado" });
        }
        centroDeportivo.usuarios.push(newUser._id);
        await centroDeportivo.save();
        newUser.centroDeportivo = centroDeportivo._id;
      }

      await newUser.save();

      let userName = `${nombre} ${apellido}`;
      // Enviar correo de bienvenida
      await sendWelcomeEmail(email, password, userName);

      res
        .status(201)
        .json({ message: "Usuario creado correctamente", user: newUser });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al crear usuario,", error: error });
    }
  },
  asignarAlumnosAEntrenador: async (req, res) => {
    const { entrenadorId, alumnosIds } = req.body;
    try {
      const entrenador = await UsuariosComplejos.findById(entrenadorId);
      if (!entrenador) {
        return res.status(404).json({ message: "Entrenador no encontrado" });
      }
      const alumnos = await UsuariosComplejos.find({
        _id: { $in: alumnosIds },
      });
      if (alumnos.length !== alumnosIds.length) {
        return res
          .status(404)
          .json({ message: "Algunos alumnos no encontrados" });
      }

      //agregar los alumnos al array alumnos del entrenador
      entrenador.alumnos = [...entrenador.alumnos, ...alumnosIds];
      await entrenador.save();

      //agregar el entrenador al campo entrenador de los alumnos
      alumnos.forEach(async (alumno) => {
        alumno.entrenador = entrenadorId;
        await alumno.save();
      });

      res
        .status(200)
        .json({ message: "Alumnos asignados correctamente", alumnos });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al asignar alumnos a entrenador",
        error: error,
      });
    }
  },
  desasignarAlumnoDeEntrenador: async (req, res) => {
    const { entrenadorId, alumnoId } = req.body;
    try {
      const entrenador = await UsuariosComplejos.findById(entrenadorId);
      if (!entrenador) {
        return res.status(404).json({ message: "Entrenador no encontrado" });
      }
      const alumno = await UsuariosComplejos.findById(alumnoId);
      if (!alumno) {
        return res.status(404).json({ message: "Alumno no encontrado" });
      }
      //eliminar el alumno del array alumnos del entrenador
      entrenador.alumnos = entrenador.alumnos.filter(
        (id) => id.toString() !== alumnoId
      );
      await entrenador.save();

      //eliminar el entrenador del campo entrenador del alumno
      alumno.entrenador = null;
      await alumno.save();

      res
        .status(200)
        .json({ message: "Alumno desasignado correctamente", alumno });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al desasignar alumno de entrenador",
        error: error,
      });
    }
  },
  actualizarUsuarioComplejo: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await UsuariosComplejos.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res
        .status(200)
        .json({ message: "Usuario actualizado correctamente", user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al actualizar usuario,", error: error });
    }
  },
  obtenerUsuarioComplejo: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await UsuariosComplejos.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res
        .status(200)
        .json({ message: "Usuario encontrado correctamente", user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuario,", error: error });
    }
  },
  eliminarUsuarioComplejo: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await UsuariosComplejos.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res
        .status(200)
        .json({ message: "Usuario eliminado correctamente", user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al eliminar usuario,", error: error });
    }
  },
  obtenerTodosLosUsuariosComplejos: async (req, res) => {
    try {
      const users = await UsuariosComplejos.find();
      res
        .status(200)
        .json({ message: "Usuarios encontrados correctamente", users });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuarios,", error: error });
    }
  },
  loginUsuarioComplejo: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await UsuariosComplejos.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Cuenta no encontrada, verifica tu correo." });
      } else {
        const isMatch = user.password.filter((userpassword) =>
          bcryptjs.compareSync(password, userpassword)
        );
        if (isMatch.length > 0) {
          const token = jwt.sign(
            {
              id: user._id,
              role: user.rol,
            },
            process.env.KEY_JWT,
            {
              expiresIn: 60 * 60 * 24,
            }
          );

          user.logeado = true;
          await user.save();

          res.status(200).json({
            message: "Inicio de sesión exitoso.",
            token,
            user: {
              id: user._id,
              nombre: user.nombre,
              apellido: user.apellido,
              email: user.email,
              rol: user.rol,
              rut: user.rut,
              status: user.status,
              telefono: user.telefono,
              institucion: user.institucion,
              centroDeportivo: user.centroDeportivo,
              espacioDeportivo: user.espacioDeportivo,
              taller: user.taller,
              misreservas: user.misreservas,
              logeado: user.logeado,
              fechaNacimiento: user.fechaNacimiento,
              sexo: user.sexo,
              direccion: user.direccion,
              numeroDireccion: user.numeroDireccion,
              imgUrl: user.imgUrl,
            },
          });
        } else {
          return res.status(401).json({
            message: "El password es incorrecto, intenta nuevamente.",
          });
        }
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al iniciar sesión,", error: error });
    }
  },
  logoutUsuarioComplejo: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await UsuariosComplejos.findByIdAndUpdate(
        id,
        { logeado: false },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res
        .status(200)
        .json({ message: "Sesión cerrada correctamente", success: true });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al cerrar sesión,", error: error });
    }
  },
  forgotPasswordUsuarioComplejo: async (req, res) => {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(400).json({ message: "Email es requerido." });
      }

      const user = await UsuariosComplejos.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "Usuario no encontrado, verifica tu correo." });
      }

      const newPassword = generateRandomPassword(8);
      user.password = bcryptjs.hashSync(newPassword, 10);
      await user.save();

      await sendWelcomeEmail(
        email,
        newPassword,
        `${user.nombre} ${user.apellido}`
      );

      res.status(200).json({ message: "Nueva contraseña enviada al correo." });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al restablecer contraseña,", error: error });
    }
  },
  changePasswordUsuarioComplejo: async (req, res) => {
    const { id } = req.params;

    try {
      const newPassword = generateRandomPassword(8);

      const user = await UsuariosComplejos.findById(id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      user.password = bcryptjs.hashSync(newPassword, 10);
      await user.save();


      res
        .status(200)
        .json({ message: "Nueva contraseña generada correctamente.", password: newPassword });


    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al cambiar contraseña,", error: error });
    }
  },
  //crear usuario de piscina
  crearUsuarioComplejosPiscina: async (req, res) => {
    try {
      const { institucion } = req.params;
      const userData = req.body;

      // Validar que la institución existe
      const institucionDoc = await Institucion.findById(institucion);
      if (!institucionDoc) {
        return res.status(404).json({ message: "Institución no encontrada" });
      }

      // Formatear fechaNacimiento si viene en formato dd/mm/yyyy
      if (
        userData.fechaNacimiento &&
        typeof userData.fechaNacimiento === "string"
      ) {
        const [day, month, year] = userData.fechaNacimiento.split("/");
        userData.fechaNacimiento = new Date(`${year}-${month}-${day}`);
      }

      if (req.files && req.files["fotoCedulaFrontal"]) {
        const fileContent = req.files["fotoCedulaFrontal"][0].buffer;
        const fileName = `${req.files["fotoCedulaFrontal"][0].fieldname
          }-${quizIdentifier()}.png`;

        const uploadFirst = {
          Bucket: bucketName,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadFirst);
        await clientAWS.send(uploadCommand);

        userData.fotoCedulaFrontal = fileName;
      }

      if (req.files && req.files["fotoCedulaReverso"]) {
        const fileContent = req.files["fotoCedulaReverso"][0].buffer;
        const fileName = `${req.files["fotoCedulaReverso"][0].fieldname
          }-${quizIdentifier()}.png`;

        const uploadSecond = {
          Bucket: bucketName,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadSecond);
        await clientAWS.send(uploadCommand);

        userData.fotoCedulaReverso = fileName;
      }

      if (req.files && req.files["firma"]) {
        const fileContent = req.files["firma"][0].buffer;
        const fileName = `${req.files["firma"][0].fieldname
          }-${quizIdentifier()}.png`;

        const uploadThird = {
          Bucket: bucketName,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadThird);
        await clientAWS.send(uploadCommand);

        userData.firma = fileName;
      }

      // Crear usuario con los datos del body y valores por defecto
      const newUser = new UsuariosComplejos({
        ...userData,
        institucion: [institucion], // Convertir a array según el modelo
        status: false,
      });

      await newUser.save();

      // Agregar usuario al array usuarios de la institucion
      institucionDoc.usuarios.push(newUser._id);
      await institucionDoc.save();

      res.status(201).json({
        message: "Usuario de piscina creado correctamente",
        user: newUser,
        institucion: institucionDoc._id,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al crear usuario de piscina",
        error: error.message,
      });
    }
  },
  //obtener usuario de piscina por rut
  obtenerUsuarioComplejoPiscina: async (req, res) => {
    const { doc } = req.params;
    try {
      // Buscar un usuario cuyo rut comience con el doc recibido (sin dígito verificador)
      // La regex ahora acepta tanto dígitos (0-9) como la letra 'K' (mayúscula o minúscula) como dígito verificador
      // También ignora la comilla simple (') que agrega el lector QR cuando el dígito es 'K'


      // buscar la cantidad de
      const user = await UsuariosComplejos.findOne({
        rut: { $regex: `^${doc}[0-9Kk]$`, $options: "i" }, // doc seguido de 1 dígito numérico, 'K'/'k', o comilla simple
      });

      //buscar suscripciones activas del usuario, que fechaFin se mayor o igual al dia de hoy en hora 00:00:00
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate());
      fechaFin.setHours(0, 0, 0, 0);

      //si la suscripcion es de planId?.tipo = nadoLibre, y el campo horasDisponibles es 0, no se debe mostrar
      const suscripcionesActivas = await SuscripcionPlanes.find({
        usuario: user?._id,
        fechaFin: { $gte: fechaFin },
      })
        .populate('planId', { 'nombrePlan': 1, 'tipo': 1, 'tipoPlan': 1, 'valor': 1 })
        .populate('varianteId', { 'horasDisponibles': 1, 'dia': 1, 'horario': 1 });

      const suscripcionesActivasFiltradas = suscripcionesActivas.filter((suscripcion) => {
        if (suscripcion.planId?.tipo === "nadoLibre" && suscripcion.horasDisponibles === 0) {
          return false;
        }
        return true;
      });

      if (!user) {
        return res
          .status(404)
          .json({ message: "Usuario de piscina no encontrado" });
      }

      res.status(200).json({
        message: "Usuario de piscina encontrado correctamente",
        user: {
          _id: user._id,
          nombre: user.nombre,
          apellido: user.apellido,
          rut: user.rut,
          email: user.email,
          telefono: user.telefono,
          rol: user.rol,
          tipoPlan: user.tipoPlan,
          tipoCurso: user.tipoCurso,
          status: user.status,
          tipoContratacion: user.tipoContratacion,
          nivelCurso: user.nivelCurso,
          tipoPlanGym: user.tipoPlanGym,
          arrendatario: user.arrendatario,
          nombreArrendatario: user.nombreArrendatario,
          suscripcionesActivas: suscripcionesActivasFiltradas,
          aptoNadolibre: user.aptoNadolibre,
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuario de piscina", error });
    }
  },
  //obtener todos los usuarios de piscina por institucion
  obtenerTodosLosUsuariosComplejosPiscina: async (req, res) => {
    const { institucion } = req.params;
    try {
      //unicamente traer los usuarios que tengan el rol = usuario
      const users = await UsuariosComplejos.find({
        institucion,
        rol: "usuario",
      }).populate(queryPopulateOptions);
      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuarios de piscina", error });
    }
  },
  //obtener todos los usuarios de piscina que tengan el rol = usuario y que tengan tipoPlanGym
  obtenerTodosLosUsuariosComplejosPiscinaPorTipoPlanGym: async (req, res) => {
    const { institucion } = req.params;
    try {
      const users = await UsuariosComplejos.find({
        institucion,
        //   rol: "usuario",
        tipoPlanGym: { $in: ["Plan full", "Plan basico", "Plan básico"] },
      });
      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users,
        cantidad: users.length,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuarios de piscina", error });
    }
  },
  //obtener todos los usuarios de piscina que tengan el rol = usuario y que tengan arrendatario = true
  obtenerTodosLosUsuariosComplejosPiscinaPorArrendatario: async (req, res) => {
    const { institucion } = req.params;
    try {
      const users = await UsuariosComplejos.find({
        institucion,
        rol: "usuario",
        arrendatario: true,
      });
      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuarios de piscina", error });
    }
  },
  //obtener todos los usuarios de piscina por centro deportivo
  obtenerTodosLosUsuariosComplejosPiscinaPorCentroDeportivo: async (
    req,
    res
  ) => {
    const { centroDeportivo } = req.params;
    try {
      const users = await UsuariosComplejos.find({ centroDeportivo });
      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuarios de piscina", error });
    }
  },
  //obtener todos los usuarios de piscina por espacio deportivo
  obtenerTodosLosUsuariosComplejosPiscinaPorEspacioDeportivo: async (
    req,
    res
  ) => {
    const { espacioDeportivo } = req.params;
    try {
      const users = await UsuariosComplejos.find({ espacioDeportivo });
      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuarios de piscina", error });
    }
  },
  //actualizar usuario de piscina
  actualizarUsuarioComplejoPiscina: async (req, res) => {
    const { id } = req.params;
    //   const clientId = req.headers["x-client-id"];
    //  const UsuariosComplejos = await usuariosComplejosModel(clientId);
    try {
      // Preparar datos de actualización
      const updateData = { ...req.body };

      // Procesar campos JSON que vienen como strings
      if (
        updateData.contactoEmergencia &&
        typeof updateData.contactoEmergencia === "string"
      ) {
        updateData.contactoEmergencia = JSON.parse(
          updateData.contactoEmergencia
        );
      }
      if (updateData.tutores && typeof updateData.tutores === "string") {
        updateData.tutores = JSON.parse(updateData.tutores);
      }

      // Procesar archivos de imágenes
      if (req.files && req.files["fotoCedulaFrontal"]) {
        const fileContent = req.files["fotoCedulaFrontal"][0].buffer;
        const fileName = `${req.files["fotoCedulaFrontal"][0].fieldname
          }-${quizIdentifier()}.png`;

        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        await clientAWS.send(uploadCommand);

        updateData.fotoCedulaFrontal = fileName;
      }

      if (req.files && req.files["fotoCedulaReverso"]) {
        const fileContent = req.files["fotoCedulaReverso"][0].buffer;
        const fileName = `${req.files["fotoCedulaReverso"][0].fieldname
          }-${quizIdentifier()}.png`;

        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: fileContent,
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        await clientAWS.send(uploadCommand);

        updateData.fotoCedulaReverso = fileName;
      }

      const user = await UsuariosComplejos.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      res.status(200).json({
        message: "Usuario de piscina actualizado correctamente",
        user,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al actualizar usuario de piscina", error });
    }
  },
  //eliminar usuario de piscina
  eliminarUsuarioComplejoPiscina: async (req, res) => {
    const { id } = req.params;
    try {
      /**
       * 1. eliminar el usuario de la institucion
       * 2. eliminar el usuario de la base de datos
       */

      //primero buscamos el usuario en la base de datos
      const user = await UsuariosComplejos.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      //luego eliminamos el usuario de la institucion
      const institucion = await Institucion.findById(user.institucion);
      if (!institucion) {
        return res.status(404).json({ message: "Institución no encontrada" });
      }
      institucion.usuarios = institucion.usuarios.filter(
        (usuario) => usuario.toString() !== id
      );
      await institucion.save();

      //luego eliminamos el usuario de la base de datos
      await UsuariosComplejos.findByIdAndDelete(id);

      res
        .status(200)
        .json({ message: "Usuario de piscina eliminado correctamente", user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al eliminar usuario de piscina", error });
    }
  },
  //traer todos los usuarios por Id de institucion
  obtenerTodosLosUsuariosComplejosPiscinaPorInstitucion: async (req, res) => {
    const { institucion } = req.params;
    try {
      const users = await UsuariosComplejos.find({ institucion });
      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuarios de piscina", error });
    }
  },
  obtenerUsuarioPiscinaPorRut: async (req, res) => {
    try {
      const clientId = req.headers["x-client-id"];
      const { rut } = req.params;

      if (!rut) {
        return res.status(400).json({
          message: "El RUT es requerido",
        });
      }

      // Obtener el modelo con la conexión específica del cliente
      //const UsuariosPiscina = await usuariosComplejosModel(clientId);

      // Buscar usuario por RUT
      const user = await Usuarios.findOne({ rut });

      if (!user) {
        return res.status(404).json({
          message: "Usuario no encontrado con el RUT especificado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Usuario encontrado correctamente",
        user: user,
        // user: {
        //   _id: user._id,
        //   nombre: user.nombre,
        //   apellido: user.apellido,
        //   rut: user.rut,
        //   email: user.email,
        //   telefono: user.telefono,
        //   rol: user.rol,
        //   status: user.status,
        //   tipoPlan: user.tipoPlan,
        //   tipoCurso: user.tipoCurso,
        //   nivelCurso: user.nivelCurso,
        //   tipoContratacion: user.tipoContratacion,
        //   arrendatario: user.arrendatario,
        //   institucion: user.institucion,
        //   // Agrega más campos según necesites
        // },
      });
    } catch (error) {
      console.error("Error en obtenerUsuarioPiscinaPorRut:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener usuario por RUT",
        error: error.message,
      });
    }
  },
  enviarCorreoContratacion: async (req, res) => {
    const { rut } = req.params;
    try {
      const user = await UsuariosComplejos.findOne({ rut });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      await sendMailUserContract(user);
      res
        .status(200)
        .json({ message: "Usuario de piscina encontrado correctamente", user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error al obtener usuario de piscina", error });
    }
  },
  encontrarUsuarioPiscinaConMismoRut: async (req, res) => {
    const clientId = req.headers["x-client-id"]; // Puede ser null
    // const UsuariosComplejos = await Usuarios(clientId);

    try {
      // Usar agregación para encontrar RUTs duplicados
      const rutDuplicados = await UsuariosComplejos.aggregate([
        {
          // Filtrar documentos que tengan RUT y no sean null/undefined
          $match: {
            rut: { $exists: true, $ne: null, $ne: "" },
          },
        },
        {
          // Agrupar por RUT y contar las ocurrencias
          $group: {
            _id: "$rut",
            count: { $sum: 1 },
            usuarios: {
              $push: {
                rut: "$rut",
                _id: "$_id",
                nombre: "$nombre",
                apellido: "$apellido",
                email: "$email",
                rol: "$rol",
                institucion: "$institucion",
                arrendatario: "$arrendatario",
                tipoPlanGym: "$tipoPlanGym",
                tipoPlan: "$tipoPlan",
                nivelCurso: "$nivelCurso",
                nombreArrendatario: "$nombreArrendatario",
                tipoContratacion: "$tipoContratacion",
              },
            },
          },
        },
        {
          // Filtrar solo los RUTs que aparecen más de una vez
          $match: {
            count: { $gt: 1 },
          },
        },
        {
          // Ordenar por cantidad de ocurrencias (mayor a menor)
          $sort: { count: -1 },
        },
      ]);

      // Formatear la respuesta
      const resultado = {
        totalRutsDuplicados: rutDuplicados.length,
        rutsDuplicados: rutDuplicados.map((item) => ({
          rut: item._id,
          cantidad: item.count,
          usuarios: item.usuarios,
        })),
      };

      res.status(200).json({
        message: "Análisis de RUTs duplicados completado",
        ...resultado,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al encontrar usuario de piscina con mismo rut",
        error,
      });
    }
  },
  //obtener todos los usuarios de piscina por institucion con paginación
  obtenerTodosLosUsuariosComplejosPiscinaPaginado: async (req, res) => {
    const { institucion } = req.params;
    const { limite = 50, pagina = 1, busqueda = '' } = req.query;

    try {
      // Validar parámetros
      const limiteNum = parseInt(limite);
      const paginaNum = parseInt(pagina);

      // if (limiteNum <= 0 || limiteNum > 200) {
      //   return res.status(400).json({
      //     message: "El límite debe estar entre 1 y 200 usuarios"
      //   });
      // }

      if (paginaNum <= 0) {
        return res.status(400).json({
          message: "La página debe ser mayor a 0"
        });
      }

      // Calcular skip para paginación
      const skip = (paginaNum - 1) * limiteNum;

      // Construir filtro de búsqueda
      let filtro = {
        institucion,
        rol: "usuario"
      };

      // Agregar filtro de búsqueda si se proporciona
      if (busqueda && busqueda.trim() !== '') {
        filtro.$or = [
          { nombre: { $regex: busqueda, $options: 'i' } },
          { apellido: { $regex: busqueda, $options: 'i' } },
          { email: { $regex: busqueda, $options: 'i' } },
          { rut: { $regex: busqueda, $options: 'i' } }
        ];
      }

      // Obtener total de usuarios para calcular páginas totales
      const totalUsuarios = await UsuariosComplejos.countDocuments(filtro);

      // Obtener usuarios con paginación
      const users = await UsuariosComplejos.find(filtro)
        .populate(queryPopulateOptions)
        .skip(skip)
        .limit(limiteNum)
        .sort({ createdAt: -1 }); // Ordenar por fecha de creación (más recientes primero)

      // Calcular información de paginación
      const paginasTotales = Math.ceil(totalUsuarios / limiteNum);
      const tieneSiguientePagina = paginaNum < paginasTotales;
      const tienePaginaAnterior = paginaNum > 1;

      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users,
        paginacion: {
          paginaActual: paginaNum,
          paginasTotales,
          totalUsuarios,
          limitePorPagina: limiteNum,
          tieneSiguientePagina,
          tienePaginaAnterior,
          usuariosEnPaginaActual: users.length
        },
        busqueda: busqueda || null
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error al obtener usuarios de piscina",
        error: error.message
      });
    }
  },
  //actualizar status arrendatario
  actualizarStatusArrendatario: async (req, res) => {
    const { id } = req.params;
    const { statusArrendatario, fechaInicioArrendatario, } = req.body;

    try {
      const user = await UsuariosComplejos.findByIdAndUpdate(id, { statusArrendatario, fechaInicioArrendatario, status: true }, { new: true });

      res.status(200).json({ message: "Status arrendatario actualizado correctamente", user });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al actualizar status arrendatario", error });
    }

  },
  buscarUsuarioPorPasaporte: async (req, res) => {
    const { pasaporte } = req.params;
    try {
      const user = await UsuariosComplejos.findOne({ rut: pasaporte });

      //buscar suscripciones activas del usuario, que fechaFin se mayor o igual al dia de hoy en hora 00:00:00
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate());
      fechaFin.setHours(0, 0, 0, 0);

      //si la suscripcion es de planId?.tipo = nadoLibre, y el campo horasDisponibles es 0, no se debe mostrar
      const suscripcionesActivas = await SuscripcionPlanes.find({
        usuario: user?._id,
        fechaFin: { $gte: fechaFin },
      })
        .populate('planId', { 'nombrePlan': 1, 'tipo': 1, 'tipoPlan': 1, 'valor': 1 })
        .populate('varianteId', { 'horasDisponibles': 1, 'dia': 1, 'horario': 1 });

      const suscripcionesActivasFiltradas = suscripcionesActivas.filter((suscripcion) => {
        if (suscripcion.planId?.tipo === "nadoLibre" && suscripcion.horasDisponibles === 0) {
          return false;
        }
        return true;
      });

      if (!user) {
        return res
          .status(404)
          .json({ message: "Usuario de piscina no encontrado" });
      }

      res.status(200).json({
        message: "Usuario de piscina encontrado correctamente",
        user: {
          _id: user._id,
          nombre: user.nombre,
          apellido: user.apellido,
          rut: user.rut,
          email: user.email,
          telefono: user.telefono,
          rol: user.rol,
          tipoPlan: user.tipoPlan,
          tipoCurso: user.tipoCurso,
          status: user.status,
          tipoContratacion: user.tipoContratacion,
          nivelCurso: user.nivelCurso,
          tipoPlanGym: user.tipoPlanGym,
          arrendatario: user.arrendatario,
          nombreArrendatario: user.nombreArrendatario,
          suscripcionesActivas: suscripcionesActivasFiltradas,
        },
      });


    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al buscar usuario por pasaporte", error });
    }
  },
  //enviar correo de bienvenida a usuario de piscina
  enviarCorreoBienvenidaUsuarioPiscina: async (req, res) => {
    const { email, password, name } = req.body;
    try {
      await sendWelcomeEmail(email, password, name);
      res.status(200).json({ message: "Correo de bienvenida enviado correctamente" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al enviar correo de bienvenida a usuario de piscina", error });
    }
  },
  //aqui va la peticion para stats de usuarios piscina
  statsUsuariosPiscina: async (req, res) => {

    const { institucionId } = req.params;

    try {

      const institucion = await Institucion.findById(institucionId);
      if (!institucion) {
        return res.status(404).json({ message: "Institución no encontrada" });
      }

      //contabilizar la cantidad de usuarios colaboradores tienen rol EMPLOYED
      const cantidadUsuariosColaboradores = await UsuariosComplejos.countDocuments({ institucion: institucionId, rol: 'EMPLOYED' });

      //Contabilizar la cantidad de usuarios colaboradores que tienen rol usuario
      const cantidadUsuariosPiscina = await UsuariosComplejos.countDocuments({ institucion: institucionId, rol: 'usuario' });

      //contabilizar la cantidad de usuarios con tipoPlanGym = Plan full, Plan basico, Plan básico
      const cantidadUsuariosConPlanGym = await UsuariosComplejos.countDocuments({
        institucion: institucionId,
        tipoPlanGym: { $in: ['Plan full', 'Plan basico', 'Plan básico'] }
      });

      //contabilizar la cantidad de usuarios con statusArrendatario = true
      const cantidadUsuariosConStatusArrendatario = await UsuariosComplejos.countDocuments({
        institucion: institucionId,
        statusArrendatario: true
      });

      //contabilizar la cantidad de accesos de usuarios piscina en el dia de hoy
      const inicioDia = new Date();
      inicioDia.setHours(0, 0, 0, 0);

      const finDia = new Date();
      finDia.setHours(23, 59, 59, 999);

      const cantidadAccesosHoy = await RegistroAccesos.countDocuments({
        institucion: institucionId,
        createdAt: { $gte: inicioDia, $lte: finDia }
      });


      res.status(200).json({
        message: "Stats de usuarios de piscina obtenidos correctamente",
        stats: {
          cantidadUsuariosColaboradores,
          cantidadUsuariosPiscina,
          cantidadUsuariosConPlanGym,
          cantidadUsuariosConStatusArrendatario,
          cantidadAccesosHoy,
          cantidadUsuariosNatacion: cantidadUsuariosPiscina - cantidadUsuariosConPlanGym - cantidadUsuariosConStatusArrendatario
        }
      });


    } catch (error) {

      console.log(error);
      res.status(500).json({ message: "Error al obtener stats de usuarios de piscina", error });// Error al obtener stats de usuarios de piscina

    }


  },
  //obtener todos los usuarios de piscina por institucion
  obtenerUsuariosPiscinaNatacion: async (req, res) => {
    const { institucion } = req.params;
    const startTime = Date.now();

    try {
      // Validación de entrada
      if (!institucion) {
        return res.status(400).json({
          message: "ID de institución es requerido",
          success: false
        });
      }

      // Optimización 1: Usar select() para traer solo los campos necesarios
      // Optimización 2: Usar lean() para obtener objetos planos (más rápido)
      // Optimización 3: Aplicar filtros directamente en la consulta MongoDB
      const users = await UsuariosComplejos.find({
        institucion,
        rol: "usuario",
        // Filtro optimizado: excluir arrendatarios sin planes directamente en la DB
        $or: [
          { arrendatario: { $ne: true } }, // No es arrendatario
          {
            arrendatario: true,
            $or: [
              { tipoPlan: { $exists: true, $ne: null, $ne: "" } },
              { tipoPlanGym: { $exists: true, $ne: null, $ne: "" } },
              { tipoContratacion: { $exists: true, $ne: null, $ne: "" } },
              { planCurso: { $exists: true, $ne: null } }
            ]
          }
        ]
      })
        .select('_id nombre apellido rut tipoRut status evaluado tipoPlan tipoPlanGym nivelCurso nombreArrendatario statusArrendatario tipoContratacion planCurso arrendatario correo email fechaRegistro telefono')
        .lean() // Objetos planos, más rápido
        .exec();

      // Optimización 4: Procesamiento más eficiente sin map innecesario
      const usersFiltered = users.map((user) => ({
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        rut: user.rut,
        tipoRut: user.tipoRut,
        status: user.status,
        evaluado: user.evaluado,
        tipoPlan: user.tipoPlan,
        tipoPlanGym: user.tipoPlanGym,
        nivelCurso: user.nivelCurso,
        nombreArrendatario: user.nombreArrendatario,
        statusArrendatario: user.statusArrendatario,
        tipoContratacion: user.tipoContratacion,
        correo: user.correo,
        email: user.email,
        fechaRegistro: user.fechaRegistro ? user.fechaRegistro.toISOString() : null,
        telefono: user.telefono,
      }));

      const responseTime = Date.now() - startTime;

      // Log de performance para monitoreo
      console.log(`[PERFORMANCE] obtenerUsuariosPiscinaNatacion - Institución: ${institucion}, Usuarios: ${usersFiltered.length}, Tiempo: ${responseTime}ms`);

      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users: users,
        meta: {
          total: usersFiltered.length,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
        },
        success: true
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`[ERROR] obtenerUsuariosPiscinaNatacion - Institución: ${institucion}, Tiempo: ${responseTime}ms`, error);

      res.status(500).json({
        message: "Error al obtener usuarios de piscina",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        success: false,
        responseTime: `${responseTime}ms`
      });
    }
  },

  obtenerUsuariosPiscinaNatacionPaginado: async (req, res) => {
    const { institucion } = req.params;
    const { page = 1, limit = 50, search = '' } = req.query;
    const startTime = Date.now();

    try {
      // Validación de entrada
      if (!institucion) {
        return res.status(400).json({
          message: "ID de institución es requerido",
          success: false
        });
      }

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100); // Máximo 100 por página
      const skip = (pageNum - 1) * limitNum;

      // Construir el filtro base
      let baseFilter = {
        institucion,
        rol: "usuario",
        $or: [
          { arrendatario: { $ne: true } },
          {
            arrendatario: true,
            $or: [
              { tipoPlan: { $exists: true, $ne: null, $ne: "" } },
              { tipoPlanGym: { $exists: true, $ne: null, $ne: "" } },
              { tipoContratacion: { $exists: true, $ne: null, $ne: "" } },
              { planCurso: { $exists: true, $ne: null } }
            ]
          }
        ]
      };

      // Construir filtros de búsqueda
      let searchFilter = {};
      if (search && search.trim()) {
        const searchTerms = search.trim().split(' ').filter(term => term.length > 0);

        if (searchTerms.length > 0) {
          // Crear expresiones regulares para cada término de búsqueda
          const searchQueries = searchTerms.map(term => ({
            $or: [
              { nombre: new RegExp(term, 'i') },
              { apellido: new RegExp(term, 'i') },
              { rut: new RegExp(term, 'i') },
              // Búsqueda combinada de nombre y apellido
              {
                $and: [
                  { nombre: new RegExp(term, 'i') },
                  { apellido: new RegExp(term, 'i') }
                ]
              }
            ]
          }));

          // Combinar todos los términos de búsqueda con AND
          searchFilter = { $and: searchQueries };
        }
      }

      // Combinar filtros
      const finalFilter = {
        ...baseFilter,
        ...(Object.keys(searchFilter).length > 0 ? searchFilter : {})
      };

      // Consulta optimizada con paginación
      const [users, totalCount] = await Promise.all([
        UsuariosComplejos.find(finalFilter)
          // .select('_id nombre apellido rut tipoRut status evaluado tipoPlan tipoPlanGym nivelCurso nombreArrendatario statusArrendatario tipoContratacion planCurso arrendatario email')
          .lean()
          .sort({ nombre: 1, apellido: 1 })
          .skip(search ? 0 : skip) // Si hay búsqueda, no aplicamos skip
          .limit(search ? 0 : limitNum) // Si hay búsqueda, no aplicamos límite
          .exec(),

        UsuariosComplejos.countDocuments(finalFilter)
      ]);

      // Si hay término de búsqueda, aplicamos la paginación en memoria
      let paginatedUsers = users;
      let effectiveTotalCount = totalCount;

      if (search) {
        effectiveTotalCount = users.length;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        paginatedUsers = users.slice(startIndex, endIndex);
      }

      const totalPages = Math.ceil(effectiveTotalCount / limitNum);
      const responseTime = Date.now() - startTime;

      // Log de performance
      console.log(`[PERFORMANCE] obtenerUsuariosPiscinaNatacionPaginado - Institución: ${institucion}, Página: ${pageNum}, Usuarios: ${paginatedUsers.length}/${effectiveTotalCount}, Tiempo: ${responseTime}ms, Búsqueda: ${search || 'ninguna'}`);

      res.status(200).json({
        message: "Usuarios de piscina encontrados correctamente",
        users: paginatedUsers,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount: effectiveTotalCount,
          limit: limitNum,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        },
        meta: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          searchTerm: search || null
        },
        success: true
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`[ERROR] obtenerUsuariosPiscinaNatacionPaginado - Institución: ${institucion}, Tiempo: ${responseTime}ms`, error);

      res.status(500).json({
        message: "Error al obtener usuarios de piscina",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        success: false,
        responseTime: `${responseTime}ms`
      });
    }
  },
  obtenerUsuarioPorId: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await UsuariosComplejos.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.status(200).json({ message: "Usuario encontrado correctamente", user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al obtener usuario por id", error });
    }
  },
  crearUsuarioPiscinaArrendatario: async (req, res) => {

    const { institucion } = req.params;
    const userData = req.body;

    try {
      //validar que la institucion exista
      const institucionDoc = await Institucion.findById(institucion);
      if (!institucionDoc) {
        return res.status(404).json({ message: "Institución no encontrada" });
      }

      //primero validar que el usuario no exista
      const user = await UsuariosComplejos.findOne({ rut: userData.rut });

      if (!user) {

        //si el usuario no existe, crear el usuario con los datos del body
        const newUser = new UsuariosComplejos({
          ...userData,
          institucion: institucionDoc._id,
          arrendatario: true,
          rol: "usuario",
          status: true,
          planCurso: null,
          planNL: null,
          planGym: null,
          pagos: [],
          suscripciones: [],
          statusArrendatario: true,
          fechaInicioArrendatario: new Date(),
        });
        await newUser.save();

        //agregar el usuario al array usuarios de la institucion
        institucionDoc.usuarios.push(newUser._id);
        await institucionDoc.save();

        return res.status(200).json({ message: "Usuario creado correctamente" });

      } else {
        //si el usuario existe, actualizar el campo arrendatario = true
        user.statusArrendatario = true;
        user.fechaInicioArrendatario = new Date();
        user.fechaRegistro = new Date();
        user.nombreArrendatario = userData.nombreArrendatario;
        await user.save();

        return res.status(200).json({ message: "Usuario actualizado correctamente" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error al crear usuario de piscina arrendatario", error });
    }

  }

};

module.exports = usuariosComplejosController;
