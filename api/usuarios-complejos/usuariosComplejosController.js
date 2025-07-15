const UsuariosComplejos = require("./usuariosComplejos");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendWelcomeEmail = require("../../controllers/mailRegisterUserAdmin");


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

const usuariosComplejosController = {
    crearUsuarioComplejo: async (req, res) => {
        const { nombre, apellido, email, rol, status, rut, from } = req.body;
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

    }

}


module.exports = usuariosComplejosController;