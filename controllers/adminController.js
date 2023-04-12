const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const UserAdmin = require('../models/admin')

const userController = {
    signUp: async (req, res)=>{
        let {name, lastName, email, password, role, rut} = req.body


        try {

            let adminUser = await UserAdmin.findOne({ email })
            if(!adminUser){
                let logged = false;
                password = bcryptjs.hashSync(password, 10)

                adminUser = await new UserAdmin({
                    email,
                    password,
                    logged,
                    password,
                    name,
                    lastName,
                    rut,
                    role
                }).save()

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
    singIn: async (req, res)=>{
        let {email, password} = req.body;
        try {
            const admin = await UserAdmin.findOne({ email })
            if (!admin){
                res.status(404).json({
                    message: 'Usuario no existe, comunicate con el administrador ',
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
                        message: 'Datos incorrectos, verifica tu email y password',
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
    singOut: async (req, res) => {
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
    }
};

module.exports = userController;

