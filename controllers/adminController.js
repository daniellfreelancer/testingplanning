const bcryptjs = require('bcryptjs');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const UserAdmin = require('../models/admin')
const Students = require('../models/student')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const Joi = require('joi')
const sendResetMail = require('./mailResetPassword')
const sendWelcomeMail = require('./mailRegisterUserAdmin')

// const bucketRegion = process.env.AWS_BUCKET_REGION
// const bucketName = process.env.AWS_BUCKET_NAME
// const publicKey = process.env.AWS_PUBLIC_KEY
// const privateKey = process.env.AWS_SECRET_KEY

// const clientAWS = new S3Client({
//   region: bucketRegion,
//   credentials: {
//     accessKeyId: publicKey,
//     secretAccessKey: privateKey,
//   },
// })

// const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

const { uploadMulterFile, getSignedUrlForKey } = require('../utils/s3Client');


const userLoginValidator = Joi.object({
  "email": Joi.string()
    .email()
    .required().messages({
      "string.email": "El email debe ser válido",
      "string.empty": "El email es requerido"
    }),
  "password": Joi.string()
    .required().messages({
      "string.empty": "La contraseña es requerida"
    }),
  "from": Joi.string()
    .required().messages({
      "string.empty": "El origen es requerido"
    })
})

function generateRandomPassword(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    password += characters[randomIndex];
  }
  return password;
}





const userController = {
  signUp: async (req, res) => {
    // let {
    //   name,
    //   lastName,
    //   email,
    //   password,
    //   role,
    //   rut,
    //   phone,
    //   gender,
    //   age,
    //   from
    // } = req.body
    // try {

    //   let adminUser = await UserAdmin.findOne({ email })

    //   if (!adminUser) {
    //     let logged = false;
    //     let imgUrl = null;
    //     let classroom = [];
    //     let school = [];
    //     let workshop = [];
    //     let program = [];
    //     let bio = "";
    //     let weight = "";
    //     let size = "";
    //     let verified = false
    //     let code = crypto.randomBytes(15).toString('hex')
    //     password = bcryptjs.hashSync(password, 10)

    //     if (from === 'form') {
    //       adminUser = await new UserAdmin({
    //         email,
    //         password: [password],
    //         logged,
    //         name,
    //         lastName,
    //         rut,
    //         role,
    //         imgUrl,
    //         bio,
    //         classroom,
    //         school,
    //         workshop,
    //         program,
    //         weight,
    //         size,
    //         age,
    //         gender,
    //         phone,
    //         from: [from],
    //         verified,
    //         code
    //       }).save()

    //       if (req.file) {
    //         let { filename } = req.file
    //         adminUser.imgUrl = filename
    //         await adminUser.save()
    //       }

    //       res.status(201).json({
    //         message: "Usuario creado correctamente",
    //         success: true
    //       })
    //     } else {
    //       verified = true
    //       adminUser = await new UserAdmin({
    //         email,
    //         password: [password],
    //         logged,
    //         name,
    //         lastName,
    //         rut,
    //         role,
    //         imgUrl,
    //         bio,
    //         classroom,
    //         school,
    //         workshop,
    //         program,
    //         weight,
    //         size,
    //         age,
    //         gender,
    //         phone,
    //         from: [from],
    //         verified,
    //         code
    //       }).save()

    //       if (req.file) {
    //         let { filename } = req.file
    //         adminUser.imgUrl = filename
    //         await adminUser.save()
    //       }


    //       res.status(201).json({
    //         message: "Usuario creado desde: " + from,
    //         success: true
    //       })


    //     }

    //   } else {

    //     if (adminUser.from.includes(from)) {
    //       res.status(200).json({
    //         message: "Usuario, posse cuenta creada desde: " + from,
    //         success: false
    //       })
    //     } else {
    //       adminUser.from.push(from)
    //       adminUser.verified = true
    //       adminUser.password.push(bcryptjs.hashSync(password, 10))
    //       await adminUser.save()
    //       res.status(201).json({
    //         message: "Usuario, ha creado su cuenta desde: " + from,
    //         success: true
    //       })
    //     }
    //   }


    // } catch (error) {
    //   console.log(error)
    //   res.status(400).json({
    //     message: error.message,
    //     success: false
    //   })
    // }

    let {
      name,
      lastName,
      email,
      password,
      role,
      rut,
      phone,
      gender,
      age,
      from
    } = req.body;

    try {
      if (from !== 'form') {
        return res.status(400).json({
          message: "No está habilitado para crear cuenta desde esta fuente",
          success: false
        });
      }

      //let temporalPassword = "8pxae778"
      let temporalPassword = generateRandomPassword();

      let adminUser = await UserAdmin.findOne({ email });

      if (!adminUser) {
        let logged = false;
        let imgUrl = null;
        let classroom = [];
        let school = [];
        let workshop = [];
        let program = [];
        let bio = "";
        let weight = "";
        let size = "";
        let verified = true;
        let code = crypto.randomBytes(15).toString('hex');
        password = password.length > 0 ? bcryptjs.hashSync(password, 10) : bcryptjs.hashSync(temporalPassword, 10);

        adminUser = await new UserAdmin({
          email,
          password: [password],
          logged,
          name,
          lastName,
          rut,
          role,
          imgUrl,
          bio,
          classroom,
          school,
          workshop,
          program,
          weight,
          size,
          age,
          gender,
          phone,
          from: [from],
          verified,
          code
        }).save();

        if (req.file) {
          let { filename } = req.file;
          adminUser.imgUrl = filename;
          await adminUser.save();
        }

        res.status(201).json({
          message: "Usuario creado correctamente",
          success: true,
          response: adminUser._id
        });
        sendWelcomeMail(email, temporalPassword, name)
      } else {
        if (adminUser.from.includes(from)) {
          res.status(200).json({
            message: "Usuario posee cuenta creada desde: " + from,
            success: false
          });
        } else {
          adminUser.from.push(from);
          adminUser.verified = true;
          adminUser.password.push(bcryptjs.hashSync(password, 10));
          await adminUser.save();
          res.status(201).json({
            message: "Usuario ha creado su cuenta desde: " + from,
            success: true
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false
      });
    }

  }, signIn: async (req, res) => {
    let { email, password, from } = req.body;
    try {

      // Buscar en UserAdmin
      const admin = await UserAdmin.findOne({ email });

      if (admin) {
        if (!admin.verified) {
          return res.status(400).json({
            message: 'Usuario no verificado, comunícate con el administrador',
            success: false
          });
        } else {
          if (from === 'form' || from === 'app') {
            await userLoginValidator.validateAsync(req.body)

            const adminPass = admin.password.filter(userpassword =>
              bcryptjs.compareSync(password, userpassword)
            );

            if (adminPass.length > 0) {
              // Código existente para inicio de sesión exitoso del administrador
              const token = jwt.sign(
                {
                  id: admin._id,
                  role: admin.role
                },
                process.env.KEY_JWT,
                {
                  expiresIn: 60 * 60 * 24
                }
              );

              await admin.populate('classroom school workshop program institution')

              const loginAdmin = {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                lastName: admin.lastName,
                rut: admin.rut,
                role: admin.role,
                logged: admin.logged,
                imgUrl: admin.imgUrl,
                bio: admin.bio,
                age: admin.age,
                weight: admin.weight,
                size: admin.size,
                phone: admin.phone,
                gender: admin.gender,
                classroom: admin.classroom,
                school: admin.school,
                workshop: admin.workshop,
                program: admin.program,
                verified: admin.verified,
                code: admin.code,
                from: admin.from,
                institution: admin.institution?._id ? admin.institution?._id : admin.institution,
                idFront: admin.idFront,
                idBack: admin.idBack,
                backgroundDoc: admin.backgroundDoc,
                otherDocs: admin.otherDocs,
                controlParental: admin.controlParental,
                birth: admin.birth,
                institucion: admin.institution

              };

              admin.logged = true;
              await admin.save();
              return res.status(200).json({
                message: 'Bienvenido, inicio de sesión exitoso',
                success: true,
                response: {
                  admin: loginAdmin,
                  token: token
                }
              });
            } else {
              return res.status(400).json({
                message: 'Contraseña incorrecta, verifica e intenta nuevamente',
                success: false
              });
            }

          } else {

            const token = jwt.sign(
              {
                id: admin._id,
                role: admin.role
              },
              process.env.KEY_JWT,
              {
                expiresIn: 60 * 60 * 24
              }
            );

            await admin.populate('classroom school workshop program')

            const loginAdmin = {
              id: admin._id,
              email: admin.email,
              name: admin.name,
              lastName: admin.lastName,
              rut: admin.rut,
              role: admin.role,
              logged: admin.logged,
              imgUrl: admin.imgUrl,
              bio: admin.bio,
              age: admin.age,
              weight: admin.weight,
              size: admin.size,
              phone: admin.phone,
              gender: admin.gender,
              classroom: admin.classroom,
              school: admin.school,
              workshop: admin.workshop,
              program: admin.program,
              verified: admin.verified,
              code: admin.code,
              from: admin.from,
              institution: admin.institution,
              idFront: admin.idFront,
              idBack: admin.idBack,
              backgroundDoc: admin.backgroundDoc,
              otherDocs: admin.otherDocs,
              controlParental: admin.controlParental,
              birth: admin.birth

            };

            admin.logged = true;
            await admin.save();
            return res.status(200).json({
              message: 'Bienvenido, inicio de sesión exitoso',
              success: true,
              response: {
                admin: loginAdmin,
                token: token
              }
            });
          }
        }
      }


      // Buscar en Students
      const student = await Students.findOne({ email });
      if (student) {



        if (from === 'app') {
          await userLoginValidator.validateAsync(req.body)
          const studentPass = student.password.filter(userpassword =>
            bcryptjs.compareSync(password, userpassword)
          );

          if (studentPass.length > 0) {
            // Código existente para inicio de sesión exitoso del estudiante
            const token = jwt.sign(
              {
                id: student._id,
                role: student.role
              },
              process.env.KEY_JWT,
              {
                expiresIn: 60 * 60 * 24
              }
            );
            await student.populate('classroom school program workshop')

            const loginStudent = {
              id: student._id,
              email: student.email,
              name: student.name,
              lastName: student.lastName,
              role: student.role,
              logged: student.logged,
              age: student.age,
              weight: student.weight,
              size: student.size,
              classroom: student.classroom,
              school: student.school,
              gender: student.gender,
              rut: student.rut,
              imgUrl: student.imgUrl,
              phone: student.phone,
              gender: student.gender,
              school_representative: student.school_representative,
              workshop: student.workshop,
              program: student.program,
              bio: student.bio,
              tasks: student.tasks,
              controlParental: student.controlParental,
              gradebook: student.gradebook,
              notifications: student.notifications,
              challenges: student.challenges,
              skills: student.skills,
              quality: student.quality,
              membership: student.membership,
              vitalmoveCategory: student.vitalmoveCategory,
              from: student.from,
              verified: student.verified,
              code: student.code,
              institution: student.institution,
              birth: student.birth


            };

            student.logged = true;
            await student.save();

            return res.status(200).json({
              message: 'Bienvenido, inicio de sesión exitoso',
              success: true,
              response: {
                student: loginStudent,
                token: token
              }
            })
          } else {
            return res.status(400).json({
              message: 'Contraseña incorrecta para el estudiante, verifica e intenta nuevamente',
              success: false
            });
          }

        } else if (from === 'app-google') {

          const token = jwt.sign(
            {
              id: student._id,
              role: student.role
            },
            process.env.KEY_JWT,
            {
              expiresIn: 60 * 60 * 24
            }
          );
          await student.populate('classroom school program workshop')

          const loginStudent = {
            id: student._id,
            email: student.email,
            name: student.name,
            lastName: student.lastName,
            role: student.role,
            logged: student.logged,
            age: student.age,
            weight: student.weight,
            size: student.size,
            classroom: student.classroom,
            school: student.school,
            gender: student.gender,
            rut: student.rut,
            imgUrl: student.imgUrl,
            phone: student.phone,
            gender: student.gender,
            school_representative: student.school_representative,
            workshop: student.workshop,
            program: student.program,
            bio: student.bio,
            tasks: student.tasks,
            controlParental: student.controlParental,
            gradebook: student.gradebook,
            notifications: student.notifications,
            challenges: student.challenges,
            skills: student.skills,
            quality: student.quality,
            membership: student.membership,
            vitalmoveCategory: student.vitalmoveCategory,
            from: student.from,
            verified: student.verified,
            code: student.code,
            institution: student.institution,
            birth: student.birth
          };

          student.logged = true;
          await student.save();

          return res.status(200).json({
            message: 'Bienvenido, inicio de sesión exitoso',
            success: true,
            response: {
              student: loginStudent,
              token: token
            }
          })

        } else {
          return res.status(400).json({
            message: 'Acceso restringido, no puedes acceder desde este sitio',
            success: false
          });
        }

      }

      // Código existente para cuando el usuario no existe
      res.status(404).json({
        message: 'Usuario no existe, comunícate con el administrador',
        success: false
      })

    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false
      });
    }
  },

  //     let { email, password } = req.body;

  //     const admin = await UserAdmin.findOne({ email })

  //     const student = await Students.findOne({ email })


  //     // try {


  //     //     if (!admin ) {
  //     //         res.status(404).json({
  //     //             message: 'Usuario no existe, comunicate con el administrador',
  //     //             success: false
  //     //         })
  //     //     }  else if (admin) {

  //     //         const token = jwt.sign(
  //     //             {
  //     //                 id: admin._id,
  //     //                 role: admin.role
  //     //             },
  //     //             process.env.KEY_JWT,
  //     //             {
  //     //                 expiresIn: 60 * 60 * 24
  //     //             }
  //     //         )


  //     //         const adminPass = admin.password.filter(userpassword => bcryptjs.compareSync(password, userpassword))

  //     //         if (adminPass.length > 0) {
  //     //             const loginAdmin = {
  //     //                 id: admin._id,
  //     //                 email: admin.email,
  //     //                 name: admin.name,
  //     //                 lastName: admin.lastName,
  //     //                 rut: admin.rut,
  //     //                 role: admin.role,

  //     //             }
  //     //             admin.logged = true
  //     //             await admin.save()

  //     //             res.status(200).json({
  //     //                 message: 'Bienvenido, Inicio de sesión con exito',
  //     //                 success: true,
  //     //                 response: {
  //     //                     admin: loginAdmin,
  //     //                     token: token
  //     //                 }
  //     //             })
  //     //         } else {
  //     //             res.status(400).json({
  //     //                 message: 'La contraseña es incorrecta, verifica e intenta nuevamente',
  //     //                 success: false
  //     //             })
  //     //         }
  //     //     } else if (student ) {
  //     //         res.status(200).json({
  //     //             message: 'estudiante encontrado',
  //     //             success: true
  //     //         })
  //     //     } else if(!student){
  //     //         res.status(404).json({
  //     //             message: 'Estudiante no existe, comunicate con el administrador',
  //     //             success: false
  //     //         })
  //     //     }
  //     // } catch (error) {
  //     //     console.log(error);
  //     //     res.status(400).json({
  //     //         message: error.message,
  //     //         success: false
  //     //     })
  //     // }


  //     // } catch (error) {
  //     //     console.log(error);
  //     //     res.status(400).json({
  //     //         message: error.message,
  //     //         success: false
  //     //     })
  //     // }
  //     // try {
  //     //     // Buscar en UserAdmin
  //     //     const admin = await UserAdmin.findOne({ email });
  //     //     // Buscar en Students
  //     //     const student = await Students.findOne({ email });

  //     //     if (admin) {
  //     //         const adminPass = admin.password.filter(userpassword =>
  //     //             bcryptjs.compareSync(password, userpassword)
  //     //         );

  //     //         if (adminPass.length > 0) {
  //     //             const token = jwt.sign(
  //     //                 {
  //     //                     id: admin._id,
  //     //                     role: admin.role
  //     //                 },
  //     //                 process.env.KEY_JWT,
  //     //                 {
  //     //                     expiresIn: 60 * 60 * 24
  //     //                 }
  //     //             );

  //     //             const loginAdmin = {
  //     //                 id: admin._id,
  //     //                 email: admin.email,
  //     //                 name: admin.name,
  //     //                 lastName: admin.lastName,
  //     //                 rut: admin.rut,
  //     //                 role: admin.role,
  //     //                 logged: admin.logged
  //     //             };

  //     //             admin.logged = true;
  //     //             await admin.save();

  //     //             return res.status(200).json({
  //     //                 message: 'Bienvenido, inicio de sesión exitoso',
  //     //                 success: true,
  //     //                 response: {
  //     //                     admin: loginAdmin,
  //     //                     token: token
  //     //                 }
  //     //             });
  //     //         } else {
  //     //             res.status(400).json({
  //     //                 message: 'La contraseña es incorrecta, verifica e intenta nuevamente',
  //     //                 success: false
  //     //             })
  //     //         }
  //     //     }


  //     //     if (student) {
  //     //         const studentPass = student.password.filter(userpassword =>
  //     //             bcryptjs.compareSync(password, userpassword)
  //     //         );

  //     //         if (studentPass.length > 0) {
  //     //             const token = jwt.sign(
  //     //                 {
  //     //                     id: student._id,
  //     //                     role: student.role
  //     //                 },
  //     //                 process.env.KEY_JWT,
  //     //                 {
  //     //                     expiresIn: 60 * 60 * 24
  //     //                 }
  //     //             );

  //     //             const loginStudent = {
  //     //                 id: student._id,
  //     //                 email: student.email,
  //     //                 name: student.name,
  //     //                 lastName: student.lastName,
  //     //                 role: student.role,
  //     //                 logged: student.logged,
  //     //                 age: student.age,
  //     //                 weight: student.weight,
  //     //                 size: student.size,
  //     //                 classroom: student.classroom,
  //     //                 school: student.school,
  //     //                 gender: student.gender,
  //     //                 rut: student.rut,
  //     //                 imgUrl: student.imgUrl,
  //     //                 phone: student.phone,
  //     //                 gender: student.gender,
  //     //                 school_representative: student.school_representative,
  //     //                 workshop: student.workshop,
  //     //                 program: student.program
  //     //             };

  //     //             student.logged = true;
  //     //             await student.save();

  //     //             return res.status(200).json({
  //     //                 message: 'Bienvenido, inicio de sesión exitoso',
  //     //                 success: true,
  //     //                 response: {
  //     //                     student: loginStudent,
  //     //                     token: token
  //     //                 }
  //     //             })
  //     //         }
  //     //     }

  //     //     res.status(404).json({
  //     //         message: 'Usuario no existe, comunícate con el administrador',
  //     //         success: false
  //     //     })

  //     // } catch (error) {
  //     //     console.log(error);
  //     //     res.status(400).json({
  //     //         message: error.message,
  //     //         success: false
  //     //     })
  //     // }
  // },
  signOut: async (req, res) => {
    let { email } = req.body;

    try {
      const adminUser = await UserAdmin.findOne({ email });
      const studentUser = await Students.findOne({ email });

      if (adminUser) {
        adminUser.logged = false;
        await adminUser.save();

        res.status(200).json({
          message: 'Hasta luego, cierre de sesión exitoso',
          success: true,
          response: {
            username: adminUser.name,
            logged: adminUser.logged
          }
        });
      } else if (studentUser) {
        studentUser.logged = false;
        await studentUser.save();

        res.status(200).json({
          message: 'Hasta luego, cierre de sesión exitoso',
          success: true,
          response: {
            username: studentUser.name,
            logged: studentUser.logged
          }
        });
      } else {
        res.status(400).json({
          message: 'No puedes cerrar sesión, ya que no estás logueado',
          success: false
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar finalizar tu sesión',
        success: false
      });
    }

  },
  getAdmins: async (req, res) => {
    try {
      let admins = await UserAdmin.find({ role: { $in: ['SUVM', 'SUAD', 'SUMD', 'SUMR', 'SUAF', 'SUSF'] } }).sort({ name: 1 })

      if (admins) {
        res.status(200).json({

          users: admins,
          message: "Usuarios registrados",
          success: true

        })
      } else {
        res.status(404).json({
          message: "No hay usuarios asociados",
          success: false
        })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({
        message: error.message,
        success: false
      })
    }
  },
  getTeachers: async (req, res) => {

    try {

      const teachers = await UserAdmin.find({ role: { $in: ['SUPF'] } }).sort({ name: 1 })


      if (teachers) {

        res.status(200).json({
          response: teachers,
          message: "Profesores registrados",
          success: true
        })

      } else {

        res.status(404).json({
          message: "No hay profesores asociados",
          success: false
        })

      }



    } catch (error) {

      console.log(error)

      res.status(400).json({
        message: error.message,
        success: false
      })

    }



  },
  resetPassword: async (req, res) => {

    const { email, newPassword, code } = req.body;

    try {
      let adminUser = await UserAdmin.findOne({ email });
      let studentUser = await Students.findOne({ email });

      if (!adminUser && !studentUser) {
        return res.status(404).json({
          message: 'Verifique su email, no se encontró el usuario',
          success: false
        });
      }

      const hashedPassword = bcryptjs.hashSync(newPassword, 10);

      if (adminUser) {

        if (adminUser.code !== code) {
          return res.status(400).json({
            message: 'Código de verificación incorrecto',
            success: false
          });
        }
        adminUser.password = hashedPassword;
        await adminUser.save();
      }

      if (studentUser) {

        if (studentUser.code !== code) {
          return res.status(400).json({
            message: 'Código de verificación incorrecto',
            success: false
          });
        }

        studentUser.password = hashedPassword;
        await studentUser.save();
      }

      res.status(200).json({
        message: 'Contraseña restablecida con éxito',
        success: true
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Ocurrió un error al restablecer la contraseña',
        success: false
      });
    }


  },
  updateUser: async (req, res) => {

    const { rut } = req.params;

    try {
      let adminUser = await UserAdmin.findOne({ rut });


      if (adminUser) {

        const userForUpdate = await UserAdmin.findOneAndUpdate({ rut }, req.body)

        // if (req.file) {
        //   const fileContent = req.file.buffer;
        //   const extension = req.file.originalname.split('.').pop();
        //   const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

        //   const uploadParams = {
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: fileName,
        //     Body: fileContent,
        //   };

        //   // Subir el archivo a S3
        //   const uploadCommand = new PutObjectCommand(uploadParams);
        //   await clientAWS.send(uploadCommand);

        //   userForUpdate.imgUrl = fileName;
        // }

        if (req.file) {
          const key = await uploadMulterFile(req.file); // devuelve el nombre generado
          userForUpdate.imgUrl = key;
        }

        await userForUpdate.save()

        res.status(200).json({
          message: 'Usuario actualizado con éxito',
          success: true,
          response: userForUpdate
        });

      }

      let studentUser = await Students.findOne({ rut });

      if (studentUser) {
        const studentForUpdate = await Students.findOneAndUpdate({ rut }, req.body)

        // if (req.file) {
        //   const fileContent = req.file.buffer;
        //   const extension = req.file.originalname.split('.').pop();
        //   const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

        //   const uploadParams = {
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: fileName,
        //     Body: fileContent,
        //   };

        //   // Subir el archivo a S3
        //   const uploadCommand = new PutObjectCommand(uploadParams);
        //   await clientAWS.send(uploadCommand);

        //   studentForUpdate.imgUrl = fileName;
        // }

        if (req.file) {
          const key = await uploadMulterFile(req.file);
          studentForUpdate.imgUrl = key;
        }


        await studentForUpdate.save()

        res.status(200).json({
          message: 'Usuario actualizado con éxito',
          success: true,
          response: studentForUpdate
        });

      }


    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar actualizar el usuario',
        success: false
      });
    }

  },
  updateProfilePhoto: async (req, res) => {
    const { rut } = req.params;

    try {
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar actualizar la foto de perfil',
        success: false
      });
    }


  },
  emailToResetPassword: async (req, res) => {
    const { email } = req.body;
    try {

      let adminUser = await UserAdmin.findOne({ email });
      let studentUser = await Students.findOne({ email });

      if (!adminUser && !studentUser) {
        return res.status(404).json({
          message: 'Usuario no encontrado, comunícate con el administrador',
          success: false
        });
      }
      const code = crypto.randomBytes(15).toString('hex')

      if (adminUser) {
        adminUser.code = code
        await adminUser.save()
        sendResetMail(email, code)
        res.status(200).json({
          message: 'Se ha enviado un correo para restablecer tu contraseña',
          success: true
        });
      }

      if (studentUser) {
        studentUser.code = code
        await studentUser.save()
        sendResetMail(email, code)
        res.status(200).json({
          message: 'Se ha enviado un correo para restablecer tu contraseña',
          success: true
        });
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Ocurrió un error al restablecer la contraseña',
        success: false
      });

    }



  },
  deleteUser: async (req, res) => {
    try {
      const userId = req.params._id; // Recibir el _id del usuario desde los parámetros de la ruta
      const user = await UserAdmin.findById(userId);

      if (user) {
        await UserAdmin.deleteOne({ _id: userId });
        res.status(200).json({
          message: "Usuario eliminado con éxito",
          success: true
        });
      } else {
        res.status(404).json({
          message: "Usuario no encontrado",
          success: false
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false
      });
    }
  },
  resetPasswordInsideApp: async (req, res) => {

    const { email, newPassword } = req.body;

    try {

      let adminUser = await UserAdmin.findOne({ email });
      let studentUser = await Students.findOne({ email });
      const hashedPassword = bcryptjs.hashSync(newPassword, 10);

      if (adminUser) {
        adminUser.password = hashedPassword;
        await adminUser.save();
        res.status(200).json({
          message: 'Contraseña restablecida con éxito',
          success: true
        });
      }

      if (studentUser) {
        studentUser.password = hashedPassword;
        await studentUser.save();
        res.status(200).json({
          message: 'Contraseña restablecida con éxito',
          success: true
        });
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Ocurrió un error al restablecer la contraseña, intente nuevamente',
        success: false
      });
    }
  },
  controlParental: async (req, res) => {

    const { email } = req.body

    try {
      let studentUser = await Students.findOne({ email });
      let adminUser = await UserAdmin.findOne({ email });

      if (studentUser) {
        studentUser.controlParental = !studentUser.controlParental ? true : false
        await studentUser.save()
        res.status(200).json({
          message: 'Control parental activado con éxito',
          success: true
        });
      } else if (adminUser) {

        adminUser.controlParental = !adminUser.controlParental ? true : false
        await adminUser.save()
        res.status(200).json({
          message: 'Control parental activado con éxito',
          success: true
        });
      } else {
        res.status(400).json({
          message: 'No se encontró el usuario',
          success: false
        })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({
        message: 'Ocurrió un error al activar el control parental, intente nuevamente',
        success: false
      });
    }
  },
  controlParentalActive: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Correo electrónico es requerido',
        success: false
      });
    }

    try {
      let user = await Students.findOne({ email }) || await UserAdmin.findOne({ email });

      if (user) {
        user.controlParental = user.controlParental === null || user.controlParental === undefined ? true : !user.controlParental;
        await user.save();
        res.status(200).json({
          message: `Control parental ${user.controlParental ? 'activado' : 'desactivado'} con éxito`,
          success: true,
          controlParental: user.controlParental
        });
      } else {
        res.status(404).json({
          message: 'No se encontró el usuario',
          success: false
        });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Ocurrió un error al activar el control parental, intente nuevamente',
        success: false
      });
    }
  },
  getUserDetail: async (req, res) => {

    const { id } = req.params;

    try {
      // Intentar encontrar al estudiante
      let student = await Students.findById(id)
        .select('name lastName email role age size gender weight imgUrl classroom program school workshop') // Selecciona solo los campos deseados
        .populate({
          path: 'classroom',
          select: 'name grade level' // Selecciona solo los campos deseados de classroom
        })
        .populate({
          path: 'program',
          select: 'name grade level' // Selecciona solo los campos deseados de program
        })
        .populate({
          path: 'school',
          select: 'name grade level' // Selecciona solo los campos deseados de school
        })
        .populate({
          path: 'workshop',
          select: 'name grade level' // Selecciona solo los campos deseados de workshop
        });

      if (student) {
        return res.status(200).json({
          response: student,
          success: true,
          message: 'Usuario encontrado'
        });
      }

      // Intentar encontrar al usuario admin
      let user = await UserAdmin.findById(id)
        .select('name lastName email role age size gender weight imgUrl classroom program school workshop') // Selecciona solo los campos deseados
        .populate({
          path: 'classroom',
          select: 'name grade level students', // Agregar students
          populate: {
            path: 'students',
            select: 'name lastName email' // Campos específicos de estudiantes
          }
        })
        .populate({
          path: 'program',
          select: 'name grade level students', // Agregar students
          populate: {
            path: 'students',
            select: 'name lastName email' // Campos específicos de estudiantes
          }
        })
        .populate({
          path: 'school',
          select: 'name grade level students', // Agregar students
          populate: {
            path: 'students',
            select: 'name lastName email' // Campos específicos de estudiantes
          }
        })
        .populate({
          path: 'workshop',
          select: 'name grade level students', // Popular los estudiantes del workshop
          populate: {
            path: 'students',
            select: 'name lastName email phone birth gender rut age' // Campos específicos de estudiantes
          }
        });

      if (user) {
        return res.status(200).json({
          response: user,
          success: true,
          message: 'Usuario encontrado'
        });
      }

      return res.status(404).json({
        message: 'No se encontró el usuario',
        success: false
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Ocurrió un error al buscar el usuario',
        success: false
      });
    }


  }


};

module.exports = userController;

