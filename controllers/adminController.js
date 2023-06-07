const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserAdmin = require('../models/admin')

const userController = {
    signUp: async (req, res)=>{
        let {name, lastName, email, password, role, rut} = req.body
        try {

            let adminUser = await UserAdmin.findOne({ email })
            if(!adminUser){
                let logged = false;
                let imgUrl = null
                password = bcryptjs.hashSync(password, 10)

                adminUser = await new UserAdmin({
                    email,
                    password,
                    logged,
                    password,
                    name,
                    lastName,
                    rut,
                    role,
                    imgUrl
                }).save()

                if (req.file) {
                    let {filename} = req.file
                    adminUser.imgUrl = filename
                    await adminUser.save()
                }


                res.status(201).json({
                    message:"Usuario registrado con exito",
                    success: true
                })

            } else {
                res.status(200).json({
                    message:"Usuario ya existe en la base de datos",
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
    signIn: async (req, res)=>{
        let {email, password} = req.body;
        try {
            const admin = await UserAdmin.findOne({ email })
            if (!admin){
                res.status(404).json({
                    message: 'Usuario no existe, comunicate con el administrador',
                    success: false
                })
            } else if (admin){

                const token = jwt.sign(
                    {
                        id: admin._id,
                        role: admin.role
                    },
                    process.env.KEY_JWT,
                    { 
                        expiresIn: 60 * 60 * 24 
                    }
                    )


                const adminPass = admin.password.filter(userpassword => bcryptjs.compareSync(password, userpassword))

                if (adminPass.length > 0) {
                    const loginAdmin = {
                        id: admin._id,
                        email: admin.email,
                        name: admin.name,
                        lastName: admin.lastName,
                        rut: admin.rut,
                        role: admin.role,

                    } 
                    admin.logged = true
                    await admin.save()

                    res.status(200).json({
                        message: 'Bienvenido, Inicio de sesión con exito',
                        success: true,
                        response: {
                            admin: loginAdmin,
                            token: token
                        }
                    })
                } else {
                    res.status(400).json({
                        message: 'La contraseña es incorrecta, verifica e intenta nuevamente',
                        success: false
                    })
                }

            }



        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: error.message,
                success: false
            })
        }
    },
    signOut: async (req, res) => {
        let { email } = req.body;

        try {
            const adminUser = await UserAdmin.findOne({ email })

            if (adminUser) {

                adminUser.logged = false;
                await adminUser.save();

                res.status(200).json({
                    message: 'Hasta luego, Cierre de sesión con exito',
                    success: true,
                    response: {
                        username: adminUser.username,
                        logged: adminUser.logged
                    }
                })

            } else {
                res.status(400).json({
                    message: 'No podés cerrar sesión, ya que no estas loguead@',
                    success: false
                })
            }
            
        } catch (error) {
            console.log(error);
            res.status(400).json({
                message: "Error al intentar finalizar tu sesión",
                success: false
            })
        }
    },
    getAdmins: async (req, res) => {
        try {
            let admins = await UserAdmin.find().sort({ name: 1})

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
    resetPassword : async (req, res) => {
        const { email, newPassword } = req.body;
      
        try {
          let adminUser = await UserAdmin.findOne({ email });
          if (!adminUser) {
            res.status(404).json({
              message: 'Usuario no encontrado',
              success: false
            });
            return;
          }
      
          const hashedPassword = bcryptjs.hashSync(newPassword, 10);
          adminUser.password = hashedPassword;
          await adminUser.save();
      
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
      }
};

module.exports = userController;

