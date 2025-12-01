const EspaciosDeportivos = require('./espaciosDeportivosPteAlto');
const ComplejosDeportivos = require('../complejos-deportivos/complejosDeportivosPteAlto');
const espaciosDeportivosPteAltoController = {
    //crear espacio deportivo PTE Alt, agregarlo y agregarlo al complejo deportivo
    crearEspacioDeportivoPteAlto: async (req, res) => {

        try {
            const {complejoDeportivo} = req.params;
            const nuevoEspacioDeportivoPteAlto = new EspaciosDeportivos({
                ...req.body,
            });

            nuevoEspacioDeportivoPteAlto.complejoDeportivo = complejoDeportivo;
            await nuevoEspacioDeportivoPteAlto.save();


            const complejoEncontrado = await ComplejosDeportivos.findById(complejoDeportivo);
            complejoEncontrado.espaciosDeportivos.push(nuevoEspacioDeportivoPteAlto._id);
            await complejoEncontrado.save();

            res.status(201).json({ 
                message: "Espacio deportivo creado correctamente", 
                response: nuevoEspacioDeportivoPteAlto,
                success: true });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el espacio deportivo PTE Alto", error });
        }
    },
    obtenerTodosLosEspaciosDeportivosPteAlto: async (req, res) => {
        try {
            const espaciosDeportivosPteAlto = await EspaciosDeportivos.find();
            res.status(200).json({ 
                message: "Espacios deportivos PTE Alto obtenidos correctamente", 
                response: espaciosDeportivosPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener los espacios deportivos PTE Alto", error });
        }
    },
    obtenerEspacioDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const espacioDeportivoPteAlto = await EspaciosDeportivos.findById(id);
            res.status(200).json({ 
                message: "Espacio deportivo PTE Alto obtenido correctamente", 
                response: espacioDeportivoPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener el espacio deportivo PTE Alto", error });
        }
    },
    actualizarEspacioDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, direccion, ciudad, comuna, region, complejoDeportivo, talleres, status, dias, horarioApertura, horarioCierre, valor, pago, deporte, galeria } = req.body;
            const espacioDeportivoPteAlto = await EspaciosDeportivos.findByIdAndUpdate(id, { nombre, descripcion, direccion, ciudad, comuna, region, complejoDeportivo, talleres, status, dias, horarioApertura, horarioCierre, valor, pago, deporte, galeria }, { new: true });
            res.status(200).json({ 
                message: "Espacio deportivo PTE Alto actualizado correctamente", 
                response: espacioDeportivoPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el espacio deportivo PTE Alto", error });
        }
    },
    eliminarEspacioDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const espacioDeportivoPteAlto = await EspaciosDeportivos.findByIdAndDelete(id);

            //eliminar el espacio deportivo del complejo deportivo
            const complejoEncontrado = await ComplejosDeportivos.findById(espacioDeportivoPteAlto.complejoDeportivo);
            complejoEncontrado.espaciosDeportivos = complejoEncontrado.espaciosDeportivos.filter(espacio => espacio.toString() !== espacioDeportivoPteAlto._id.toString());
            await complejoEncontrado.save();

            res.status(200).json({ 
                message: "Espacio deportivo PTE Alto eliminado correctamente", 
                response: espacioDeportivoPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar el espacio deportivo PTE Alto", error });
        }
    }
}
module.exports = espaciosDeportivosPteAltoController;