const EventosVariantesPteAlto = require('./eventosVariantesPteAlto');
const UsuariosPteAlto = require('../usuarios-pte-alto/usuariosPteAlto');
const EventosPteAlto = require('../eventos-pte-alto/eventosPteAlto');


// calcular la edad del usuario con la fecha de nacimiento completa tomando en cuenta el dia, mes y año
function calcularEdad(fechaNacimiento) {
    const fechaActual = new Date();
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    if (fechaActual.getMonth() < fechaNacimiento.getMonth() || (fechaActual.getMonth() === fechaNacimiento.getMonth() && fechaActual.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad;
}

const eventosVariantesPteAltoController = {

    inscripcionUsuarioAVariante: async (req, res) => {
        try {

            const { varianteId, eventoId } = req.params;
            const {usuario} = req.body
            // verificar que el usuario existe
            let usuarioExistente = await UsuariosPteAlto.findOne({ rut: usuario.rut });
            if (!usuarioExistente) {
                const nuevoUsuario = new UsuariosPteAlto({
                    ...req.body,
                });
                await nuevoUsuario.save();
                usuarioExistente = nuevoUsuario;
            }

            // calcular la edad del usuario
            const edadUsuario = calcularEdad(usuarioExistente.fechaNacimiento);

            // verificar que la variante existe y obtener el evento asociado
            const varianteExistente = await EventosVariantesPteAlto.findById(varianteId);
            if (!varianteExistente) {
                return res.status(404).json({
                    message: 'Variante no encontrada',
                    success: false,
                });
            }
            // Obtener el evento y todas sus variantes
            const evento = await EventosPteAlto.findById(eventoId);
            if (!evento) {
                return res.status(404).json({
                    message: 'Evento asociado a la variante no encontrado',
                    success: false,
                });
            }

            const variantesDelEvento = await EventosVariantesPteAlto.find({ evento: eventoId }).populate('usuarios');

            console.log(variantesDelEvento);


            // buscar el _id del usuario en cada variante en su campo usuarios

            for (const variante of variantesDelEvento) {
                const usuarioEncontrado = variante.usuarios.find(usuario => usuario._id.toString() === usuario.id);
                if (usuarioEncontrado) {
                    console.log(usuarioEncontrado);
                    return res.status(200).json({
                        message: 'el usuario ya esta inscrito al evento',
                        success: true,
                    });
                } 
            }


            // verificar la edad del usuario
            if (edadUsuario < varianteExistente.edadMinima || edadUsuario > varianteExistente.edadMaxima) {
                return res.status(400).json({
                    message: 'El usuario no cumple con la edad requerida para el evento',
                    success: false,
                });
            }

            // inscribir el usuario a la variante
            varianteExistente.usuarios.push(usuarioExistente._id);
            await varianteExistente.save();

            return res.status(200).json({
                message: 'Usuario inscrito a la variante correctamente',
                success: true,
            });


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Error al inscribir usuario a la variante',
                error: error.message,
                success: false
            });
        }
    }
};

module.exports = eventosVariantesPteAltoController;