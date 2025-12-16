const EventosPteAlto = require('./eventosPteAlto');
const VariantesPteAlto = require('../eventos-variantes-pte-alto/eventosVariantesPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client'); // helper centralizado

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;
const eventosPteAltoController = {
    crearEventoPteAlto: async (req, res) => {

        try {

            const { nombre, descripcion, horarioInicio, horarioFin, fechaInicio, fechaFin, lugar, direccion, capacidad, creadoPor, variantes } = req.body;
            
            // Parsear variantes si viene como string JSON (desde FormData)
            let variantesParsed = variantes;
            if (typeof variantes === 'string') {
                try {
                    variantesParsed = JSON.parse(variantes);
                } catch (error) {
                    console.log('Error al parsear variantes:', error);
                    variantesParsed = [];
                }
            }

            const nuevoEventoPteAlto = new EventosPteAlto({
                nombre,
                descripcion,
                horarioInicio,
                horarioFin,
                fechaInicio,
                fechaFin,
                lugar,
                direccion,
                capacidad,
                creadoPor,
            });

            
            if (req.file) {
                try {
                    const key = await uploadMulterFile(req.file);
                    const fileUrl = `${cloudfrontUrl}/${key}`;
                    nuevoEventoPteAlto.imgUrl = fileUrl;
                } catch (error) {
                    console.log(error);
                }
            }

            if (variantesParsed && Array.isArray(variantesParsed) && variantesParsed.length > 0) {
                for (const variante of variantesParsed) {
                    const nuevaVariante = new VariantesPteAlto({ evento: nuevoEventoPteAlto._id, ...variante });
                    await nuevaVariante.save();
                    nuevoEventoPteAlto.variantes.push(nuevaVariante._id);
                }
            }

            await nuevoEventoPteAlto.save();

            res.status(201).json({
                message: 'Evento creado correctamente',
                response: nuevoEventoPteAlto,
                success: true,
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al crear el evento',
                error: error.message,
                success: false,
            });
        }

    },
    editarEventoPteAlto: async (req, res) => {


        try {
            
            const { id } = req.params;

            const eventoPteAlto = await EventosPteAlto.findByIdAndUpdate(id, req.body, { new: true });


            if (req.file) {
                try {
                    const key = await uploadMulterFile(req.file);
                    const fileUrl = `${cloudfrontUrl}/${key}`;
                    eventoPteAlto.imgUrl = fileUrl;
                } catch (error) {
                    console.log(error);
                }
            }

            await eventoPteAlto.save();

            if (!eventoPteAlto) {
                return res.status(404).json({
                    message: 'Evento no encontrado',
                    success: false,
                });
            }
            res.status(200).json({
                message: 'Evento actualizado correctamente',
                response: eventoPteAlto,
                success: true,
            });

        } catch (error) {
            
            console.log(error);
            res.status(500).json({
                message: 'Error al actualizar el evento',
                error: error.message,
                success: false,
            });
        }

    },
    eliminarEventoPteAlto: async (req, res) => {

        try {

            const { id } = req.params;

            //buscar y eliminar las variantes asociadas al evendo, en caso de que exista
            const variantes = await VariantesPteAlto.find({ evento: id });
            if (variantes && variantes.length > 0) {
                for (const variante of variantes) {
                    await variante.deleteOne();
                }
            }
            //luego eliminar el evento
            const eventoPteAlto = await EventosPteAlto.findByIdAndDelete(id);
            if (!eventoPteAlto) {
                return res.status(404).json({
                    message: 'Evento no encontrado',
                    success: false,
                });
            }
            res.status(200).json({
                message: 'Evento eliminado correctamente',
                response: eventoPteAlto,
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al eliminar el evento',
                error: error.message,
                success: false,
            });
        }
    },
    obtenerEventoPteAltoporId: async (req, res) => {

        try {
            
            const { id } = req.params;
            
            // Obtener el evento
            const eventoPteAlto = await EventosPteAlto.findById(id);
            
            if (!eventoPteAlto) {
                return res.status(404).json({
                    message: 'Evento no encontrado',
                    success: false,
                });
            }

            // Obtener todas las variantes del evento con sus usuarios populados
            const variantes = await VariantesPteAlto.find({ evento: id })
                .populate('usuarios', 'nombre apellido email rut telefono fechaNacimiento sexo');

            // Asignar las variantes populadas al evento
            eventoPteAlto.variantes = variantes;
            
            res.status(200).json({
                message: 'Evento obtenido correctamente',
                response: eventoPteAlto,
                success: true,
            });
        } catch (error) {
            
            console.log(error);
            res.status(500).json({
                message: 'Error al obtener el evento',
                error: error.message,
                success: false,
            });
        }


    },
    obtenerTodosLosEventosPteAlto: async (req, res) => {

        //obtener todos los eventos, con las variantes asociadas
        try {

            const eventosPteAlto = await EventosPteAlto.find({ status: true })
                .populate({
                    path: 'variantes',
                    model: VariantesPteAlto,
                });
            if (!eventosPteAlto) {
                return res.status(404).json({
                    message: 'Eventos no encontrados',
                    success: false,
                });
            }
            res.status(200).json({
                message: 'Eventos obtenidos correctamente',
                response: eventosPteAlto,
                success: true,
            });
        } catch (error) {

            console.log(error);
            res.status(500).json({
                message: 'Error al obtener los eventos',
                error: error.message,
                success: false,
            });
        }


    }
}

module.exports = eventosPteAltoController;