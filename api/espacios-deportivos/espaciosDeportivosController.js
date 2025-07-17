const EspaciosDeportivos = require('./espaciosDeportivosModel');
const User = require('../usuarios-complejos/usuariosComplejos');
const Institucion = require('../institucion/institucionModel');
const CentrosDeportivos = require('../centros-deportivos/centrosDeportivosModel');

const espaciosDeportivosController = {
    crearEspacioDeportivo: async (req, res) => {
        try {
            const {id} = req.params;
            const institucionID = req.body.institucion;
            const centroDeportivoID = req.body.centroDeportivo;

            const nuevoEspacioDeportivo = new EspaciosDeportivos({
                ...req.body,
                admins: id ? [id] : [],
            });
            await nuevoEspacioDeportivo.save();

            if (id) {
                //asignar el id del espacio deportivo a la propiedad admins del usuario
                const user = await User.findByIdAndUpdate(id, { $push: { espacioDeportivo: nuevoEspacioDeportivo._id } }, { new: true });
            }

            if (institucionID) {
                //asignar el id de la institucion al espacio deportivo
                const institucion = await Institucion.findByIdAndUpdate(institucionID, { $push: { espaciosDeportivos: nuevoEspacioDeportivo._id } }, { new: true });
                //asignar el id del espacio deportivo a la propiedad espaciosDeportivos de la institucion
                const espacioDeportivoUpdated = await EspaciosDeportivos.findByIdAndUpdate(nuevoEspacioDeportivo._id, { $push: { institucion: institucionID } }, { new: true });
            }

            if (centroDeportivoID) {
                //asignar el id del centro deportivo al espacio deportivo
                const centroDeportivo = await CentrosDeportivos.findByIdAndUpdate(centroDeportivoID, { $push: { espaciosDeportivos: nuevoEspacioDeportivo._id } }, { new: true });
                //asignar el id del espacio deportivo a la propiedad espaciosDeportivos de la institucion
                const espacioDeportivoUpdated = await EspaciosDeportivos.findByIdAndUpdate(nuevoEspacioDeportivo._id, { $push: { centroDeportivo: centroDeportivoID } }, { new: true });
            }

            res.status(201).json({ message: "Espacio deportivo creado correctamente", nuevoEspacioDeportivo });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el espacio deportivo", error });
        }
    },
    actualizarEspacioDeportivo: async (req, res) => {
         try {
            const {id} = req.params;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json({ message: "Espacio deportivo actualizado correctamente", espacioDeportivo });
         } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el espacio deportivo", error });
         }
    }
}

module.exports = espaciosDeportivosController;