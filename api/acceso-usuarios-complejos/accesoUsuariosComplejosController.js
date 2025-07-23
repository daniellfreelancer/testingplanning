const AccesoUsuariosComplejos = require('./accesoUsuariosComplejosModel');

// Populate usuariosComplejos "nombre, apellido, rut, email, tipoPlan, rol, telefono"
// Populate institucion "nombre"
// Populate usuarioAutorizado "nombre, apellido, rut, email, telefono, rol"

const queryPopulate = [
    {
        path: 'usuario usuarioAutorizado',
        select: 'nombre apellido rut email telefono rol tipoPlan'
    },
    {
        path: 'institucion',
        select: 'nombre'
    },

]


const AccesoUsuariosComplejosController = {
    crearAccesoUsuariosComplejos: async (req, res) => {
        try {
            const acceso = await AccesoUsuariosComplejos.create(req.body);
            res.status(200).json(acceso);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

    },
    //obtener los accesos por institucion
    obtenerAccesosPorInstitucion: async (req, res) => {
        try {
            const { institucion } = req.params;
            const accesos = await AccesoUsuariosComplejos.find({ institucion }).sort({ createdAt: -1 }).populate(queryPopulate);
            res.status(200).json(accesos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    //obtener todos los accesos ordenados por fecha de creación
    obtenerTodosLosAccesos: async (req, res) => {
        try {
            const accesos = await AccesoUsuariosComplejos.find().sort({ createdAt: -1 }).populate(queryPopulate);
            res.status(200).json(accesos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AccesoUsuariosComplejosController;