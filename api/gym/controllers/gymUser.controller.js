const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserGym = require("../models/gymUsers");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Joi = require("joi");

const gymUserController = {
  signUpUserGym: async (req, res) => {
    const { name, lastName, email, rut, role } = req.body;

    let temporalPassword = "1234";

    try {
      let userGym = await UserGym.findOne({ email });

      if (userGym) {
        return res.status(400).json({
          message: "El correo electrónico ya se encuentra registrado",
          success: false,
        });
      }

      const hashedPassword = bcryptjs.hashSync(temporalPassword, 10);

      userGym = new UserGym({
        name,
        lastName,
        email,
        rut,
        role,
        password: [hashedPassword],
      });

      await userGym.save();

      res.status(200).json({
        message: "Usuario registrado con éxito",
        success: true,
        response: userGym,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },
  signInUserGym: async (req, res) => {
    const { email, password } = req.body;

    try {
      const userGym = await UserGym.findOne({ email });

      if (!userGym) {
        return res.status(400).json({
          message: "El usuario no se encuentra registrado",
          success: false,
        });
      }

      const userPasswords = userGym.password.filter((userpassword) =>
        bcryptjs.compareSync(password, userpassword)
      );

      if (userPasswords.length > 0) {
        const token = jwt.sign(
          {
            id: userGym._id,
            role: userGym.role,
          },
          process.env.KEY_JWT,
          {
            expiresIn: 60 * 60 * 24,
          }
        );

        const loginUserGym = {
          id: userGym._id,
          email: userGym.email,
          role: userGym.role,
          name: userGym.name,
          lastName: userGym.lastName,
          rut: userGym.rut,
          logged: true,
          token: token,
        };

        return res.status(200).json({
          message: "Inicio de sesión exitoso",
          success: true,
          response: loginUserGym,
        });
      } else {
        return res.status(400).json({
          message: "La contraseña es incorrecta, verifica e intenta nuevamente",
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },
  signOutUserGym: async (req, res) => {
    const { email } = req.body;

    try {
      const userGym = await UserGym.findOne({ email });

      if (!userGym) {
        return res.status(400).json({
          message: "El usuario no se encuentra registrado",
          success: false,
        });
      }

      userGym.logged = false;
      await userGym.save();

      res.status(200).json({
        message: "Hasta luego, cierre de sesión exitoso",
        success: true,
        response: {
          username: userGym.name,
          logged: userGym.logged,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },
};

module.exports = gymUserController;
