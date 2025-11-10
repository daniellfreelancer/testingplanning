const UsuariosPteAlto = require("./usuariosPteAlto");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Institucion = require("../../institucion/institucionModel");

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
            //valida si el correo y rut ya existen
            const usuarioPteAltoEmail = await UsuariosPteAlto.findOne({ email });
            const usuarioPteAltoRut = await UsuariosPteAlto.findOne({ rut });
            if (usuarioPteAltoEmail || usuarioPteAltoRut) {
                return res.status(400).json({ message: "El correo o rut ya existe" });
            }

            const password = generateRandomPassword(8);
            const passwordHashed = bcryptjs.hashSync(password, 10);
            const nuevoUsuarioPteAlto = new UsuariosPteAlto({ 
                nombre, apellido, email,rut, rol, password: [passwordHashed]
            });

            await nuevoUsuarioPteAlto.save();

            //mostrar por consola el password generado
            console.log("Password generado:", password);
            res.status(201).json({ message: "Usuario PTE Alto creado correctamente", usuarioPteAlto: nuevoUsuarioPteAlto, password });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear usuario PTE Alto", error: error });
        }

    },
    actualizarUsuarioPteAlto: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, apellido, email, rut, rol } = req.body;
            const usuarioPteAlto = await UsuariosPteAlto.findByIdAndUpdate(id, { nombre, apellido, email, rut, rol }, { new: true });
            if (!usuarioPteAlto) {
                return res.status(404).json({ message: "Usuario PTE Alto no encontrado" });
            }
            res.status(200).json({ message: "Usuario PTE Alto actualizado correctamente", usuarioPteAlto });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar usuario PTE Alto", error: error });
        }

    },
    eliminarUsuarioPteAlto: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioPteAlto = await UsuariosPteAlto.findByIdAndDelete(id);
            if (!usuarioPteAlto) {
                return res.status(404).json({ message: "Usuario PTE Alto no encontrado" });
            }
            res.status(200).json({ message: "Usuario PTE Alto eliminado correctamente", usuarioPteAlto });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar usuario PTE Alto", error: error });
        }
    },
    obtenerUsuarioPteAlto: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioPteAlto = await UsuariosPteAlto.findById(id);
            if (!usuarioPteAlto) {
                return res.status(404).json({ message: "Usuario PTE Alto no encontrado" });
            }
            res.status(200).json({ message: "Usuario PTE Alto encontrado correctamente", usuarioPteAlto });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener usuario PTE Alto", error: error });
        }
    },
    loginUsuarioPteAlto: async (req, res) => {
        try {
            const { email, password } = req.body;
            const usuarioPteAlto = await UsuariosPteAlto.findOne({ email });
            if (!usuarioPteAlto) {
                return res.status(404).json({ message: "Usuario no encontrado, verifica tu correo." });
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
                    res.status(200).json({ message: "Usuario PTE Alto logueado correctamente", usuarioPteAlto, token });
                  } else {
                    return res.status(401).json({ message: "Contraseña incorrecta" });
                  }
            }
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al loguear usuario PTE Alto", error: error });
        }
    },
    logoutUsuarioPteAlto: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioPteAlto = await UsuariosPteAlto.findByIdAndUpdate(id, { logeado: false }, { new: true });
            if (!usuarioPteAlto) {
                return res.status(404).json({ message: "Usuario PTE Alto no encontrado" });
            }
            res.status(200).json({ message: "Usuario PTE Alto deslogueado correctamente", usuarioPteAlto });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al desloguear usuario PTE Alto", error: error });
        }
    },
}

module.exports = usuariosPteAltoController;