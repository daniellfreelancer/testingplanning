const AccesoPteAlto = require("./accesoPteAlto");
const UsuariosPteAlto = require("../usuarios-pte-alto/usuariosPteAlto");

const accesoPteAltoController = {
    crearAccesoPteAlto: async (req, res) => {
        try {
            const { usuario, institucion, accesoLugar, accesoTipo, rut } = req.body;

            // Validar si el usuario existe
            const usuarioPteAlto = await UsuariosPteAlto.findOne({ rut: rut });
            if (!usuarioPteAlto) {
               
                //si el usuario no existe, crearlo
                const nuevoUsuarioPteAlto = new UsuariosPteAlto({
                    rut: rut,
                    nombre:'',
                    apellido:'',
                    email:'',
                    password: '',
                    rol: 'usuario',
                    status: true,
                });
                await nuevoUsuarioPteAlto.save();
                let nuevoUsuarioId = nuevoUsuarioPteAlto._id;

                //crear acceso para el nuevo usuario
                const nuevoAccesoPteAlto = new AccesoPteAlto({
                    usuario: usuario,
                    usuarioAutorizado: nuevoUsuarioId,
                    institucion: institucion,
                    accesoLugar: accesoLugar,
                    accesoTipo: accesoTipo,
                 
                });
                await nuevoAccesoPteAlto.save();

                res.status(200).json({ message: "Acceso creado correctamente", accesoPteAlto: nuevoAccesoPteAlto });
                
            } else {
                
                //crear acceso para el usuario existente
                const nuevoAccesoPteAlto = new AccesoPteAlto({
                    usuario: usuario,
                    usuarioAutorizado: usuarioPteAlto._id,
                    institucion: institucion,
                    accesoLugar: accesoLugar,
                    accesoTipo: accesoTipo,
                });
                await nuevoAccesoPteAlto.save();

                res.status(200).json({ message: "Acceso creado correctamente", accesoPteAlto: nuevoAccesoPteAlto });
            }


        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear acceso PTE Alto", error: error });
        }
    },
    obtenerAccesosPteAlto: async (req, res) => {
        try {
            const accesosPteAlto = await AccesoPteAlto.find().sort({ createdAt: -1 }).populate('usuario usuarioAutorizado');
            res.status(200).json(accesosPteAlto);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener accesos PTE Alto", error: error.message });
        }
    }
}

module.exports = accesoPteAltoController;