const EventosPteAlto = require('./eventosPteAlto');
const VariantesPteAlto = require('../eventos-variantes-pte-alto/eventosVariantesPteAlto');
const { uploadFile } = require('../../../utils/s3CloudFront'); // Igual que noticias y álbumes

const eventosPteAltoController = {
    crearEventoPteAlto: async (req, res) => {

        try {
            console.log('=== CREAR EVENTO - INICIO ===');
            console.log('Body recibido:', req.body);
            console.log('req.files:', req.files);

            const { nombre, descripcion, horarioInicio, horarioFin, fechaInicio, fechaFin, lugar, direccion, capacidad, creadoPor, variantes, linkExterno, esEventoExterno, destacado } = req.body;

            console.log('Datos extraídos:', { nombre, esEventoExterno, destacado, linkExterno });

            // Parsear variantes si viene como string JSON (desde FormData)
            let variantesParsed = variantes;
            if (typeof variantes === 'string') {
                try {
                    variantesParsed = JSON.parse(variantes);
                    console.log('Variantes parseadas:', variantesParsed);
                } catch (error) {
                    console.log('Error al parsear variantes:', error);
                    variantesParsed = [];
                }
            }

            console.log('Creando nuevo evento...');
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
                linkExterno: linkExterno || null,
                esEventoExterno: esEventoExterno === 'true' || esEventoExterno === true || false,
                destacado: destacado === 'true' || destacado === true || false,
            });
            console.log('Evento creado en memoria:', nuevoEventoPteAlto);

            // Subir imagen si existe (usando express-fileupload)
            if (req.files && req.files.imgUrl) {
                console.log('Procesando imagen con express-fileupload...');
                try {
                    const result = await uploadFile(req.files.imgUrl, {
                        category: 'eventos',
                        optimize: true,
                        optimizeOptions: {
                            maxWidth: 1920,
                            quality: 85,
                            format: 'jpeg'
                        }
                    });
                    nuevoEventoPteAlto.imgUrl = result.cloudFrontUrl;
                    console.log('Imagen subida:', result.cloudFrontUrl);
                } catch (error) {
                    console.error('Error subiendo imagen:', error);
                }
            }

            // Solo crear variantes si no es evento externo
            if (!nuevoEventoPteAlto.esEventoExterno && variantesParsed && Array.isArray(variantesParsed) && variantesParsed.length > 0) {
                console.log('Creando variantes...');
                for (const variante of variantesParsed) {
                    const nuevaVariante = new VariantesPteAlto({ evento: nuevoEventoPteAlto._id, ...variante });
                    await nuevaVariante.save();
                    nuevoEventoPteAlto.variantes.push(nuevaVariante._id);
                }
                console.log('Variantes creadas:', nuevoEventoPteAlto.variantes.length);
            }

            console.log('Guardando evento en BD...');
            await nuevoEventoPteAlto.save();
            console.log('Evento guardado exitosamente');

            res.status(201).json({
                message: 'Evento creado correctamente',
                response: nuevoEventoPteAlto,
                success: true,
            });

        } catch (error) {
            console.error('Error al crear evento:', error);
            res.status(500).json({
                message: 'Error al crear el evento',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                success: false,
            });
        }

    },
    editarEventoPteAlto: async (req, res) => {

        try {
            console.log('=== EDITAR EVENTO - INICIO ===');
            console.log('ID:', req.params.id);
            console.log('Body:', req.body);
            console.log('Files:', req.files);

            const { id } = req.params;

            // Buscar el evento primero
            const eventoPteAlto = await EventosPteAlto.findById(id);

            if (!eventoPteAlto) {
                return res.status(404).json({
                    message: 'Evento no encontrado',
                    success: false,
                });
            }

            // Parsear variantes si viene como string
            let variantesParsed = req.body.variantes;
            if (typeof req.body.variantes === 'string') {
                try {
                    variantesParsed = JSON.parse(req.body.variantes);
                } catch (error) {
                    console.log('Error al parsear variantes:', error);
                    variantesParsed = [];
                }
            }

            // Actualizar campos (excluir variantes por ahora)
            const { variantes, ...updateData } = req.body;
            Object.assign(eventoPteAlto, updateData);

            // Convertir booleanos que vienen como strings
            if (typeof updateData.esEventoExterno === 'string') {
                eventoPteAlto.esEventoExterno = updateData.esEventoExterno === 'true';
            }
            if (typeof updateData.destacado === 'string') {
                eventoPteAlto.destacado = updateData.destacado === 'true';
            }
            if (typeof updateData.status === 'string') {
                eventoPteAlto.status = updateData.status === 'true';
            }

            // Subir nueva imagen si existe (usando express-fileupload)
            if (req.files && req.files.imgUrl) {
                console.log('Procesando imagen...');
                try {
                    const result = await uploadFile(req.files.imgUrl, {
                        category: 'eventos',
                        optimize: true,
                        optimizeOptions: {
                            maxWidth: 1920,
                            quality: 85,
                            format: 'jpeg'
                        }
                    });
                    eventoPteAlto.imgUrl = result.cloudFrontUrl;
                    console.log('Imagen actualizada:', result.cloudFrontUrl);
                } catch (error) {
                    console.error('Error subiendo imagen:', error);
                }
            }

            await eventoPteAlto.save();
            console.log('Evento guardado exitosamente');

            res.status(200).json({
                message: 'Evento actualizado correctamente',
                response: eventoPteAlto,
                success: true,
            });

        } catch (error) {
            console.error('Error al actualizar evento:', error);
            res.status(500).json({
                message: 'Error al actualizar el evento',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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


    },
    obtenerEventosDestacados: async (req, res) => {
        try {
            const { limit } = req.query;

            let query = EventosPteAlto.find({ status: true, destacado: true })
                .populate({
                    path: 'variantes',
                    model: VariantesPteAlto,
                })
                .sort({ createdAt: -1 });

            if (limit) {
                query = query.limit(parseInt(limit));
            }

            const eventosDestacados = await query;

            res.status(200).json({
                message: 'Eventos destacados obtenidos correctamente',
                response: eventosDestacados,
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al obtener eventos destacados',
                error: error.message,
                success: false,
            });
        }
    }
}

module.exports = eventosPteAltoController;