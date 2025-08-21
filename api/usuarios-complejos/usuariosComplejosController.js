const UsuariosComplejos = require("./usuariosComplejos");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendWelcomeEmail = require("../../controllers/mailRegisterUserAdmin");
const Institucion = require("../institucion/institucionModel");
const CentroDeportivo = require("../centros-deportivos/centrosDeportivosModel");
const sendMailUserContract = require("../mail/mailUserContract");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

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

const clientAWS = new S3Client({
    region: bucketRegion,
    credentials: {
      accessKeyId: publicKey,
      secretAccessKey: privateKey,
    },
  })
  
  const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

const usuariosComplejosController = {
    crearUsuarioComplejo: async (req, res) => {
        const { nombre, apellido, email, rol, status, rut, from, institucionId, centroDeportivoId, espacioDeportivoId, tallerId } = req.body;
        const password = generateRandomPassword(8);
        try {

            if (from !== "vmForm") {
                return res.status(400).json({
                    message: "No está habilitado para crear cuenta desde esta fuente",
                });
            }

            const existingUserByEmail = await UsuariosComplejos.findOne({ email });
            if (existingUserByEmail) {
                return res.status(400).json({ message: "El correo ya se encuentra registrado" });
            }

            const existingUserByRut = await UsuariosComplejos.findOne({ rut });
            if (existingUserByRut) {
                return res.status(400).json({ message: "El RUT ya se encuentra registrado" });
            }

            const newUser = new UsuariosComplejos({ nombre, apellido, email, password: bcryptjs.hashSync(password, 10), rol, status, rut });

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
                }
                await institucion.save();
                newUser.institucion = institucion._id;
            }

            if (centroDeportivoId) {
                const centroDeportivo = await CentroDeportivo.findById(centroDeportivoId);
                if (!centroDeportivo) {
                    return res.status(404).json({ message: "Centro deportivo no encontrado" });
                }
                centroDeportivo.usuarios.push(newUser._id);
                await centroDeportivo.save();
                newUser.centroDeportivo = centroDeportivo._id;
            }

            await newUser.save();


            let userName = `${nombre} ${apellido}`;
            // Enviar correo de bienvenida
            await sendWelcomeEmail(email, password, userName);

            res.status(201).json({ message: "Usuario creado correctamente", user: newUser });


        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear usuario,", error: error });

        }
       
    },
    asignarAlumnosAEntrenador: async (req, res) => {
        const { entrenadorId, alumnosIds } = req.body;
        try {
            const entrenador = await UsuariosComplejos.findById(entrenadorId);
            if (!entrenador) {
                return res.status(404).json({ message: "Entrenador no encontrado" });
            }
            const alumnos = await UsuariosComplejos.find({ _id: { $in: alumnosIds } });
            if (alumnos.length !== alumnosIds.length) {
                return res.status(404).json({ message: "Algunos alumnos no encontrados" });
            }

            //agregar los alumnos al array alumnos del entrenador
            entrenador.alumnos = [...entrenador.alumnos, ...alumnosIds];
            await entrenador.save();

            //agregar el entrenador al campo entrenador de los alumnos
            alumnos.forEach(async (alumno) => {
                alumno.entrenador = entrenadorId;
                await alumno.save();
            });


            res.status(200).json({ message: "Alumnos asignados correctamente", alumnos });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al asignar alumnos a entrenador", error: error });
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
            entrenador.alumnos = entrenador.alumnos.filter(id => id.toString() !== alumnoId);
            await entrenador.save();

            //eliminar el entrenador del campo entrenador del alumno
            alumno.entrenador = null;
            await alumno.save();

            res.status(200).json({ message: "Alumno desasignado correctamente", alumno });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al desasignar alumno de entrenador", error: error });
        }
    },
    actualizarUsuarioComplejo: async (req, res) => {
        const { id } = req.params;

        try {
            const user = await UsuariosComplejos.findByIdAndUpdate(id, req.body, { new: true });
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ message: "Usuario actualizado correctamente", user });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar usuario,", error: error });

        }
    },
    obtenerUsuarioComplejo: async (req, res) => {
        const { id } = req.params;

        try {
            const user = await UsuariosComplejos.findById(id);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ message: "Usuario encontrado correctamente", user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuario,", error: error });
        }


    },
    eliminarUsuarioComplejo: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await UsuariosComplejos.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ message: "Usuario eliminado correctamente", user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar usuario,", error: error });
        }
    },
    obtenerTodosLosUsuariosComplejos: async (req, res) => {
        try {
            const users = await UsuariosComplejos.find();
            res.status(200).json({ message: "Usuarios encontrados correctamente", users });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuarios,", error: error });

        }
    },
    loginUsuarioComplejo: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await UsuariosComplejos.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Cuenta no encontrada, verifica tu correo." });
            } else {
                const isMatch = user.password.filter(userpassword => bcryptjs.compareSync(password, userpassword));
                if (isMatch.length > 0) {
                   
                    const token = jwt.sign(
                        {
                            id: user._id,
                            role: user.rol
                        },
                        process.env.KEY_JWT,
                        {
                            expiresIn: 60 * 60 * 24
                        }
                    );
        
                    user.logeado = true;
                    await user.save();
        
                    res.status(200).json({
                        message: "Inicio de sesión exitoso.", token, user: {
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
                           
                        }
                    });
                } else {
                    return res.status(401).json({ message: "El password es incorrecto, intenta nuevamente." });
                }
            }

        

         



        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al iniciar sesión,", error: error });

        }
    },
    logoutUsuarioComplejo: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await UsuariosComplejos.findByIdAndUpdate(id, { logeado: false }, { new: true });
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }
            res.status(200).json({ message: "Sesión cerrada correctamente", success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al cerrar sesión,", error: error });
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
                return res.status(404).json({ message: "Usuario no encontrado, verifica tu correo." });
            }

            const newPassword = generateRandomPassword(8);
            user.password = bcryptjs.hashSync(newPassword, 10);
            await user.save();

            await sendWelcomeEmail(email, newPassword, `${user.nombre} ${user.apellido}`);

            res.status(200).json({ message: "Nueva contraseña enviada al correo." });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al restablecer contraseña,", error: error });
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
            if (userData.fechaNacimiento && typeof userData.fechaNacimiento === 'string') {
                const [day, month, year] = userData.fechaNacimiento.split("/");
                userData.fechaNacimiento = new Date(`${year}-${month}-${day}`);
            }

            if (req.files && req.files['fotoCedulaFrontal']) {
                const fileContent = req.files['fotoCedulaFrontal'][0].buffer;
                const fileName = `${req.files['fotoCedulaFrontal'][0].fieldname}-${quizIdentifier()}.png`;

                const uploadFirst = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                };

                const uploadCommand = new PutObjectCommand(uploadFirst);
                await clientAWS.send(uploadCommand);

                userData.fotoCedulaFrontal = fileName;

            }

            if (req.files && req.files['fotoCedulaReverso']) {
                const fileContent = req.files['fotoCedulaReverso'][0].buffer;
                const fileName = `${req.files['fotoCedulaReverso'][0].fieldname}-${quizIdentifier()}.png`;
                
                const uploadSecond = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                };

                const uploadCommand = new PutObjectCommand(uploadSecond);
                await clientAWS.send(uploadCommand);

                userData.fotoCedulaReverso = fileName;

            }

            if (req.files && req.files['firma']) {
                const fileContent = req.files['firma'][0].buffer;
                const fileName = `${req.files['firma'][0].fieldname}-${quizIdentifier()}.png`;
                
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
                status: true
            });


            await newUser.save();

            // Agregar usuario al array usuarios de la institucion
            institucionDoc.usuarios.push(newUser._id);
            await institucionDoc.save();

            res.status(201).json({ 
                message: "Usuario de piscina creado correctamente", 
                user: newUser,
                institucion: institucionDoc._id
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear usuario de piscina", error: error.message });
        }
    },
    //obtener usuario de piscina por rut
    obtenerUsuarioComplejoPiscina: async (req, res) => {
        const { doc } = req.params;
        try {
            // Buscar un usuario cuyo rut comience con el doc recibido (sin dígito verificador)

            //popular  el response, para que retorne el usuario con los datos : "nombre, apellido, rut, email, telefono, rol, tipoPlan"


            const user = await UsuariosComplejos.findOne({
                rut: { $regex: `^${doc}\\d$` } // doc seguido de 1 dígito numérico
            });


    
            if (!user) {
                return res.status(404).json({ message: "Usuario de piscina no encontrado" });
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
                    tipoPlan: user.tipoPlan
                }
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener usuario de piscina", error });
        }
    },
    //obtener todos los usuarios de piscina por institucion
    obtenerTodosLosUsuariosComplejosPiscina: async (req, res) => {
        const { institucion } = req.params;
        try {
            //unicamente traer los usuarios que tengan el rol = usuario
            const users = await UsuariosComplejos.find({ institucion, rol: "usuario" });
            res.status(200).json({ message: "Usuarios de piscina encontrados correctamente", users });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuarios de piscina", error });
        }
    },
    //obtener todos los usuarios de piscina por centro deportivo
    obtenerTodosLosUsuariosComplejosPiscinaPorCentroDeportivo: async (req, res) => {
        const { centroDeportivo } = req.params;
        try {
            const users = await UsuariosComplejos.find({ centroDeportivo });
            res.status(200).json({ message: "Usuarios de piscina encontrados correctamente", users });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuarios de piscina", error });
        }
    },
    //obtener todos los usuarios de piscina por espacio deportivo
    obtenerTodosLosUsuariosComplejosPiscinaPorEspacioDeportivo: async (req, res) => {
        const { espacioDeportivo } = req.params;
        try {
            const users = await UsuariosComplejos.find({ espacioDeportivo });
            res.status(200).json({ message: "Usuarios de piscina encontrados correctamente", users });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuarios de piscina", error });
        }
    },
    //actualizar usuario de piscina
    actualizarUsuarioComplejoPiscina: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await UsuariosComplejos.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json({ message: "Usuario de piscina actualizado correctamente", user });
        } catch (error) {   
            console.log(error);
            res.status(500).json({ message: "Error al actualizar usuario de piscina", error });
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
            institucion.usuarios = institucion.usuarios.filter(usuario => usuario.toString() !== id);
            await institucion.save();

            //luego eliminamos el usuario de la base de datos
            await UsuariosComplejos.findByIdAndDelete(id);

            res.status(200).json({ message: "Usuario de piscina eliminado correctamente", user });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar usuario de piscina", error });
        }
    },
    //traer todos los usuarios por Id de institucion
    obtenerTodosLosUsuariosComplejosPiscinaPorInstitucion: async (req, res) => {
        const { institucion } = req.params;
        try {
            const users = await UsuariosComplejos.find({ institucion });
            res.status(200).json({ message: "Usuarios de piscina encontrados correctamente", users });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuarios de piscina", error });
        }
    },
    obtenerUsuarioPiscinaPorRut: async (req, res) => {
        const { rut } = req.params;
        try {
            const user = await UsuariosComplejos.findOne({ rut });
            res.status(200).json({ message: "Usuario de piscina encontrado correctamente", user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuario de piscina", error });
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
            res.status(200).json({ message: "Usuario de piscina encontrado correctamente", user });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuario de piscina", error });
        }
    }
}


module.exports = usuariosComplejosController;