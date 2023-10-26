const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserAdmin = require('../models/admin')
const Students = require('../models/student')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')

const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

const userController = {
    signUp: async (req, res) => {
        let { 
          name, 
          lastName, 
          email, 
          password, 
          role, 
          rut ,  
          phone, 
          gender, 
          age
        } = req.body
        try {

            let adminUser = await UserAdmin.findOne({ email })
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


                password = bcryptjs.hashSync(password, 10)

                adminUser = await new UserAdmin({
                    email,
                    password,
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
                    phone

                }).save()

                if (req.file) {
                    let { filename } = req.file
                    adminUser.imgUrl = filename
                    await adminUser.save()
                }


                res.status(201).json({
                    message: "Usuario registrado con exito",
                    success: true
                })

            } else {
                res.status(200).json({
                    message: "Usuario ya existe en la base de datos",
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

    }, signIn: async (req, res) => {
            let { email, password } = req.body;
            try {
                // Buscar en UserAdmin
                const admin = await UserAdmin.findOne({ email });

                if (admin) {
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
                            bio : admin.bio,
                            age:admin.age,
                            weight:admin.weight,
                            size:admin.size,
                            phone:admin.phone,
                            gender:admin.gender,
                            classroom: admin.classroom,
                            school: admin.school,
                            workshop: admin.workshop,
                            program: admin.program

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
                            message: 'Contraseña incorrecta para el administrador, verifica e intenta nuevamente',
                            success: false
                        });
                    }
                }

                // Buscar en Students
                const student = await Students.findOne({ email });

                if (student) {
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

             
             
                    await student.populate('school program')

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
                        tasks: student.tasks
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
                    })} else {
                        return res.status(400).json({
                            message: 'Contraseña incorrecta para el estudiante, verifica e intenta nuevamente',
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
            let admins = await UserAdmin.find().sort({ name: 1 })

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
    resetPassword: async (req, res) => {

        const { email, newPassword } = req.body;

        try {
          let adminUser = await UserAdmin.findOne({ email });
          let studentUser = await Students.findOne({ email });
      
          if (!adminUser && !studentUser) {
            return res.status(404).json({
              message: 'Usuario no encontrado',
              success: false
            });
          }
      
          const hashedPassword = bcryptjs.hashSync(newPassword, 10);
      
          if (adminUser) {
            adminUser.password = hashedPassword;
            await adminUser.save();
          }
      
          if (studentUser) {
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
    updateUser: async (req,res)=>{

        const {rut} = req.params;

        try {
            let adminUser = await UserAdmin.findOne({ rut });
            

            if (adminUser){

                const userForUpdate = await UserAdmin.findOneAndUpdate({rut}, req.body)

                if (req.file) {
                    const fileContent = req.file.buffer;
                    const extension = req.file.originalname.split('.').pop();
                    const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;
            
                    const uploadParams = {
                      Bucket: process.env.AWS_BUCKET_NAME,
                      Key: fileName,
                      Body: fileContent,
                    };
            
                    // Subir el archivo a S3
                    const uploadCommand = new PutObjectCommand(uploadParams);
                    await clientAWS.send(uploadCommand);
            
                    userForUpdate.imgUrl = fileName;
                  }
                await userForUpdate.save()

                res.status(200).json({
                    message: 'Usuario actualizado con éxito',
                    success: true,
                    response: userForUpdate
                  });

            }

            let studentUser = await Students.findOne({ rut });

            if (studentUser){
                const studentForUpdate = await Students.findOneAndUpdate({rut}, req.body)

                if (req.file) {
                    const fileContent = req.file.buffer;
                    const extension = req.file.originalname.split('.').pop();
                    const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;
            
                    const uploadParams = {
                      Bucket: process.env.AWS_BUCKET_NAME,
                      Key: fileName,
                      Body: fileContent,
                    };
            
                    // Subir el archivo a S3
                    const uploadCommand = new PutObjectCommand(uploadParams);
                    await clientAWS.send(uploadCommand);
            
                    studentForUpdate.imgUrl = fileName;
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
    updateProfilePhoto: async (req, res)=>{
        const {rut} = req.params;

        try {




            
        } catch (error) {
            console.log(error);
            res.status(400).json({
              message: 'Error al intentar actualizar la foto de perfil',
              success: false
            });
        }


    }
};

module.exports = userController;

