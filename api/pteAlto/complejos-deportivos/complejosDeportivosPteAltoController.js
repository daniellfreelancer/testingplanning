const UsuariosPteAlto = require('../usuarios-pte-alto/usuariosPteAlto');
const ComplejosDeportivosPteAlto = require('./complejosDeportivosPteAlto');
const Institucion = require('../../institucion/institucionModel');

const complejosDeportivosPteAltoController = {

    //crear complejo deportivo PTE Alto y agregarlo a la institucion
    crearComplejoDeportivoPteAlto: async (req, res) => {
        try {
            const {institucion} = req.params;
            let institucionDoc = await Institucion.findById(institucion);
          
            if (!institucionDoc) {
                return res.status(404).json({ message: "Institución no encontrada" });
            }
            const nuevoComplejoDeportivoPteAlto = new ComplejosDeportivosPteAlto({
                ...req.body,
            });
           
            institucionDoc.complejosPteAlto.push(nuevoComplejoDeportivoPteAlto._id);
            await institucionDoc.save();
           
            nuevoComplejoDeportivoPteAlto.institucion = institucionDoc._id;
            await nuevoComplejoDeportivoPteAlto.save();
          
            res.status(201).json({ message: "Complejo deportivo PTE Alto creado correctamente", complejoDeportivoPteAlto: nuevoComplejoDeportivoPteAlto });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el complejo deportivo PTE Alto", error });
        }
    },
    //obtener todos los complejos deportivos PTE Alto
    obtenerTodosLosComplejosDeportivosPteAlto: async (req, res) => {
        try {
            const EspaciosDeportivosPteAlto = require('../espacios-deportivos/espaciosDeportivosPteAlto');
            
            const complejosDeportivosPteAlto = await ComplejosDeportivosPteAlto.find({ status: true })
                .populate({
                    path: 'espaciosDeportivos',
                    model: EspaciosDeportivosPteAlto,
                    match: { status: { $in: ['activo', 'interno'] } }
                });
            
            res.status(200).json({ 
                message: "Complejos deportivos PTE Alto obtenidos correctamente", 
                response: complejosDeportivosPteAlto,
                success: true 
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener los complejos deportivos PTE Alto", error });
        }
    },
    //obtener un complejo deportivo PTE Alto por id
    obtenerComplejoDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const EspaciosDeportivosPteAlto = require('../espacios-deportivos/espaciosDeportivosPteAlto');
            
            const complejoDeportivoPteAlto = await ComplejosDeportivosPteAlto.findById(id)
                .populate({
                    path: 'espaciosDeportivos',
                    model: EspaciosDeportivosPteAlto,
                    match: { status: { $in: ['activo', 'interno'] } }
                });
            
            if (!complejoDeportivoPteAlto) {
                return res.status(404).json({
                    success: false,
                    message: "Complejo deportivo no encontrado"
                });
            }
            
            res.status(200).json({ 
                message: "Complejo deportivo PTE Alto obtenido correctamente", 
                response: complejoDeportivoPteAlto,
                success: true 
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener el complejo deportivo PTE Alto", error });
        }
    },
    //actualizar un complejo deportivo PTE Alto por id
    actualizarComplejoDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, direccion, telefono, email, rut, ciudad, comuna, region, institucion, espaciosDeportivos, horarioApertura, horarioCierre, horarioAtencion, horarioAtencionFin } = req.body;
            const complejoDeportivoPteAlto = await ComplejosDeportivosPteAlto.findByIdAndUpdate(id, { nombre, descripcion, direccion, telefono, email, rut, ciudad, comuna, region, institucion, espaciosDeportivos, horarioApertura, horarioCierre, horarioAtencion, horarioAtencionFin }, { new: true });
            res.status(200).json({ 
                message: "Complejo deportivo PTE Alto actualizado correctamente", 
                response: complejoDeportivoPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el complejo deportivo PTE Alto", error: error });
        }
    },
    //eliminar un complejo deportivo PTE Alto por id
    eliminarComplejoDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const complejoDeportivoPteAlto = await ComplejosDeportivosPteAlto.findByIdAndDelete(id);

            // Eliminar el complejo deportivo de la institucion
            const institucion = await Institucion.findById(complejoDeportivoPteAlto.institucion);
            if (!institucion) {
                return res.status(404).json({ message: "Institución no encontrada" });
            }
            institucion.complejosPteAlto = institucion.complejosPteAlto.filter(complejo => complejo.toString() !== complejoDeportivoPteAlto._id.toString());
            await institucion.save();

            res.status(200).json({ 
                message: "Complejo deportivo PTE Alto eliminado correctamente", 
                response: complejoDeportivoPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar el complejo deportivo PTE Alto", error: error });
        }
    }
}


module.exports = complejosDeportivosPteAltoController;