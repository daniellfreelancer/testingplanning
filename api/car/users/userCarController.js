const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserCar = require("./userCarModel");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Joi = require("joi");
const sendWelcomeEmail = require("../../../controllers/mailRegisterUserAdmin");

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

const userCarController = {
  carSignUp: async (req, res) => {
    const { name, lastName, email, role, rut, from } = req.body;
    const password = generateRandomPassword(8);

    try {
      if (from !== "carForm") {
        return res.status(400).json({
          message: "No está habilitado para crear cuenta desde esta fuente",
        });
      }

     // 2. Validar si el correo ya se encuentra registrado
      // Reemplaza 'UserCar.findOne' con el método adecuado de tu ORM/base de datos
      const existingUserByEmail = await UserCar.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({ message: "El correo ya se encuentra registrado" });
      }

      // 3. Validar si el RUT ya se encuentra registrado
      const existingUserByRut = await UserCar.findOne({ rut });
      if (existingUserByRut) {
        return res.status(400).json({ message: "El RUT ya se encuentra registrado" });
      }

      // Crear un nuevo usuario
      const newUser = new UserCar({
        name,
        lastName,
        email,
        role,
        rut,
        password: bcryptjs.hashSync(password, 10),
      })

      await newUser.save()


      let userName = `${name} ${lastName}`;
      // Enviar correo de bienvenida
      await sendWelcomeEmail(email, password, userName);

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
    carSignIn: async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Validar que se proporcionen email y contraseña
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos." });
      }

      // 2. Buscar el usuario por email
      // Reemplaza 'UserCar.findOne' con el método adecuado de tu ORM/base de datos
      const user = await UserCar.findOne({ email });

      // 3. Verificar si el usuario existe
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas." }); // No especificar si es email o contraseña por seguridad
      }

      // 4. Comparar la contraseña proporcionada con la contraseña hasheada almacenada
      const isMatch = bcryptjs.compare(password, user.password);

      // 5. Si las contraseñas no coinciden, retornar error
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas." });
      }

      // 6. Generar el token JWT
      const token = jwt.sign(
        {
          id: user._id, // Usar el ID del usuario
          role: user.role // Incluir el rol del usuario en el token (si aplica)
        },
        process.env.KEY_JWT, // Clave secreta para firmar el token
        {
          expiresIn: '1d' // El token expira en 1 día (puedes ajustar esto: '1h', '7d', etc.)
        }
      );

      // 7. Respuesta exitosa: devolver el token y los datos del usuario (sin contraseña)
      res.status(200).json({
        message: "Inicio de sesión exitoso.",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          rut: user.rut,
          // Añade aquí cualquier otro campo del usuario que sea seguro devolver
        },
      });

    } catch (error) {
      console.error("Error en carSignIn:", error);
      res.status(500).json({ message: "Error interno del servidor al intentar iniciar sesión." });
    }
  },
  carGetAllUsers : async (req,res)=>{

    try {
      const users = await UserCar.find().select("-password"); // Excluir el campo de contraseña
      res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener usuarios." });
    }

  },
  carGetUserById: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await UserCar.findById(id).select("-password"); // Excluir el campo de contraseña
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      res.status(500).json({ message: "Error interno del servidor al obtener el usuario." });
    }
  },
  carForgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      // Validar que se proporcione un email
      if (!email) {
        return res.status(400).json({ message: "Email es requerido." });
      }

      // Buscar el usuario por email
      const user = await UserCar.findOne({ email });

      // Verificar si el usuario existe
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      // Generar una nueva contraseña aleatoria
      const newPassword = generateRandomPassword(8);
      user.password = bcryptjs.hashSync(newPassword, 10);
      await user.save();

      // Enviar correo con la nueva contraseña (implementa tu lógica de envío de correo)
      await sendWelcomeEmail(email, newPassword, `${user.name} ${user.lastName}`);

      res.status(200).json({ message: "Nueva contraseña enviada al correo." });
    } catch (error) {
      console.error("Error en carForgotPassword:", error);
      res.status(500).json({ message: "Error interno del servidor al restablecer la contraseña." });
    }
  },
  carUpdateUser: async (req, res) => {
    const { id } = req.params;


    try {

        // Validar que se proporcione un ID
        if (!id) {
          return res.status(400).json({ message: "ID de usuario es requerido." });
        }

        // Buscar el usuario por ID
        const user = await UserCar.findById(id).select("-password");

        // Verificar si el usuario existe
        if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Actualizar con los datos proporcionados por req.body
        const updatedData = req.body;
        Object.assign(user, updatedData);
        await user.save();

        res.status(200).json({ message: "Usuario actualizado con éxito.", user: user });
        
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ message: "Error interno del servidor al actualizar el usuario." });
        
    }

  },
  carDeleteUser: async (req, res) => {
    const { id } = req.params;
    
    try {
      // Validar que se proporcione un ID
      if (!id) {
        return res.status(400).json({ message: "ID de usuario es requerido." });
      }

      // Buscar el usuario por ID
      const user = await UserCar.findById(id);

      // Verificar si el usuario existe
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      // Eliminar el usuario
      await UserCar.findByIdAndDelete(id);

      res.status(200).json({ message: "Usuario eliminado con éxito." });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({ message: "Error interno del servidor al eliminar el usuario." });
    }
  }
};

module.exports = userCarController;
