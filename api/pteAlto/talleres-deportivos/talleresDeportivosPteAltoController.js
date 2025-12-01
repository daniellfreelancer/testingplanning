const TalleresDeportivos = require('./talleresDeportivosPteAlto');
const EspaciosDeportivos = require('../espacios-deportivos/espaciosDeportivosPteAlto');

const talleresDeportivosPteAltoController = {

    //crear taller deportivo PTE Alto y agregarlo al espacio deportivo en caso de tenerlo
    crearTallerDeportivoPteAlto: async (req, res) => {
        try {
            const nuevoTallerDeportivoPteAlto = new TalleresDeportivos({
                ...req.body,
            });
    
            // Cambiar req.params.espacioDeportivo por req.query.espacioDeportivo
            if (req.query.espacioDeportivo) {
                const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(req.query.espacioDeportivo);
                if (!espacioDeportivoEncontrado) {
                    return res.status(404).json({ message: "Espacio deportivo no encontrado" });
                }
                espacioDeportivoEncontrado.talleres.push(nuevoTallerDeportivoPteAlto._id);
                await espacioDeportivoEncontrado.save();
    
                nuevoTallerDeportivoPteAlto.espacioDeportivo = espacioDeportivoEncontrado._id;
                await nuevoTallerDeportivoPteAlto.save();
    
                res.status(201).json({ message: "Taller deportivo PTE Alto creado correctamente", tallerDeportivoPteAlto: nuevoTallerDeportivoPteAlto });
            } else {
                nuevoTallerDeportivoPteAlto.espacioDeportivo = null;
                await nuevoTallerDeportivoPteAlto.save();
                res.status(201).json({ message: "Taller deportivo PTE Alto creado correctamente", tallerDeportivoPteAlto: nuevoTallerDeportivoPteAlto });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el taller deportivo PTE Alto", error });
        }
    },
    obtenerTodosLosTalleresDeportivosPteAlto: async (req, res) => {
        try {
            const talleresDeportivosPteAlto = await TalleresDeportivos.find();
            res.status(200).json({ message: "Talleres deportivos PTE Alto obtenidos correctamente", response: talleresDeportivosPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener los talleres deportivos PTE Alto", error });
        }
    },
    obtenerTallerDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const tallerDeportivoPteAlto = await TalleresDeportivos.findById(id);
            res.status(200).json({ message: "Taller deportivo PTE Alto obtenido correctamente", response: tallerDeportivoPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener el taller deportivo PTE Alto", error });
        }
    },
    actualizarTallerDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, imagen, video, link, complejoDeportivo, espacioDeportivo, capacidad, valor, pago, horarios, dias, fechaInicio, fechaFin, usuarios, profesores, status } = req.body;
            const tallerDeportivoPteAlto = await TalleresDeportivos.findByIdAndUpdate(id, { nombre, descripcion, imagen, video, link, complejoDeportivo, espacioDeportivo, capacidad, valor, pago, horarios, dias, fechaInicio, fechaFin, usuarios, profesores, status }, { new: true });
            res.status(200).json({ message: "Taller deportivo PTE Alto actualizado correctamente", response: tallerDeportivoPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el taller deportivo PTE Alto", error });
        }
    },
    eliminarTallerDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const tallerDeportivoPteAlto = await TalleresDeportivos.findByIdAndDelete(id);

            // en caso de estar asociado a un espacio deportivo, eliminar el taller deportivo del espacio deportivo

            if (tallerDeportivoPteAlto.espacioDeportivo) {
                const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(tallerDeportivoPteAlto.espacioDeportivo);
                if (espacioDeportivoEncontrado) {
                    espacioDeportivoEncontrado.talleres = espacioDeportivoEncontrado.talleres.filter(taller => taller.toString() !== tallerDeportivoPteAlto._id.toString());
                    await espacioDeportivoEncontrado.save();
                }
            }

            res.status(200).json({ message: "Taller deportivo PTE Alto eliminado correctamente", response: tallerDeportivoPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar el taller deportivo PTE Alto", error });
        }
    }
}

module.exports = talleresDeportivosPteAltoController;