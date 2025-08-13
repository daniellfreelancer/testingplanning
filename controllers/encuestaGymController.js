const EncuestaGym = require('../models/encuestaGymModel');

// Crear encuestas masivsas
const crearEncuestasMasivas = async (req, res) => {
    try {
        const {
            idInternoBase,
            institucion,
            complejo,
            creadaPor,
            preguntas = {},
            respondidaPorIds = [],
        } = req.body;

        if (!Array.isArray(respondidaPorIds) || respondidaPorIds.length === 0) {
            return res.status(400).json({ mensaje: 'Debe enviar respondidaPorIds (array con al menos 1 id).' });
        }

        // Arma las preguntas si las mandan como objeto {1:{},2:{},...}
        const buildPreguntas = () => {
            const obj = {};
            for (let i = 1; i <= 10; i++) {
                const p = preguntas[i];
                if (p && (p.titulo || p.valoracion != null)) {
                    obj[`pregunta${i}`] = { titulo: p.titulo || '', valoracion: p.valoracion ?? undefined };
                }
            }
            return obj;
        };

        const nowSuffix = Date.now(); // por si no te mandan idInternoBase
        const docs = respondidaPorIds.map((respId, idx) => ({
            idInterno: idInternoBase ? `${idInternoBase}-${idx + 1}` : `ENC-${nowSuffix}-${idx + 1}`,
            institucion,
            complejo,
            creadaPor,
            respondidaPor: respId,
            respondida: false,
            habilitada: true,
            ...buildPreguntas(),
        }));

        // Castea a ObjectId donde corresponda (por si te llegan strings)
        docs.forEach(d => {
            if (d.institucion) d.institucion = new mongoose.Types.ObjectId(d.institucion);
            if (d.complejo) d.complejo = new mongoose.Types.ObjectId(d.complejo);
            if (d.creadaPor) d.creadaPor = new mongoose.Types.ObjectId(d.creadaPor);
            if (d.respondidaPor) d.respondidaPor = new mongoose.Types.ObjectId(d.respondidaPor);
        });

        const creadas = await EncuestaGym.insertMany(docs, { ordered: false });
        return res.status(201).json({
            mensaje: 'Encuestas creadas correctamente',
            creadas,
            total: creadas.length,
            solicitadas: docs.length,
        });
    } catch (error) {
        // Si ordered:false, insertMany puede lanzar errores de duplicados pero igual crea algunas
        console.error('Error al crear encuestas masivas:', error);
        return res.status(500).json({ mensaje: 'Error al crear encuestas masivas', detalle: error?.message });
    }
};

// Crear encuesta
const crearEncuesta = async (req, res) => {
    try {
        const datos = req.body;
        const nuevaEncuesta = new EncuestaGym({ ...datos, respondida: false });
        await nuevaEncuesta.save();
        res.status(201).json({ mensaje: 'Encuesta creada correctamente', encuesta: nuevaEncuesta });
    } catch (error) {
        console.error('Error al crear encuesta:', error);
        res.status(500).json({ mensaje: 'Error al crear encuesta' });
    }
};

// Obtener todas las encuestas
const obtenerEncuesta = async (req, res) => {
    try {
        const encuestas = await EncuestaGym.find();
        res.status(200).json(encuestas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener encuestas' });
    }
};

// Obtener por institución
const obtenerEncuestaPorInstitucion = async (req, res) => {
    try {
        const { institucion } = req.body;
        const encuestas = await EncuestaGym.find({ institucion });
        res.json(encuestas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener por institución' });
    }
};

// Obtener por complejo
const obtenerEncuestaPorComplejo = async (req, res) => {
    try {
        const { complejos } = req.body;
        const encuestas = await EncuestaGym.find({ complejos });
        res.json(encuestas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener por complejo' });
    }
};

// Obtener por evaluado
const obtenerEncuestaPorEvaluado = async (req, res) => {
    try {
        const { evaluado } = req.body;
        const encuestas = await EncuestaGym.find({ evaluado });
        res.json(encuestas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener por evaluado' });
    }
};

// Obtener por creador
const obtenerEncuestaPorCreador = async (req, res) => {
    try {
        const { creadaPor } = req.body;
        const encuestas = await EncuestaGym.find({ creadaPor });
        res.json(encuestas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener por creador' });
    }
};

// Obtener por usuario
const obtenerEncuestaPorUsuario = async (req, res) => {
    try {
        const { respondidaPor } = req.body;
        const encuestas = await EncuestaGym.find({ respondidaPor });
        res.json(encuestas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener por usuario' });
    }
};

// Obtener por ID interno
const obtenerEncuestaPorIdInterno = async (req, res) => {
    try {
        const { idInterno } = req.body;
        const encuesta = await EncuestaGym.findOne({ idInterno });
        if (!encuesta) return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
        res.json(encuesta);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener por idInterno' });
    }
};

// Editar encuesta
const editarEncuesta = async (req, res) => {
    try {
        const { idInterno, ...camposActualizados } = req.body;

        const encuesta = await EncuestaGym.findOneAndUpdate(
            { idInterno },
            camposActualizados,
            { new: true }
        );

        if (!encuesta) {
            return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
        }

        res.json({ mensaje: 'Encuesta actualizada correctamente', encuesta });
    } catch (error) {
        console.error('Error al editar encuesta:', error);
        res.status(500).json({ mensaje: 'Error al editar encuesta' });
    }
};


// Eliminar encuesta por idInterno
const eliminarEncuesta = async (req, res) => {
    try {
        const { idInterno } = req.body;
        const resultado = await EncuestaGym.findOneAndDelete({ idInterno });
        if (!resultado) return res.status(404).json({ mensaje: 'Encuesta no encontrada' });
        res.json({ mensaje: 'Encuesta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar encuesta' });
    }
};

// Responder encuesta (actualizar valoraciones y marcar como respondida)
const responderEncuesta = async (req, res) => {
    try {
        const { idInterno, respuestas } = req.body;

        const encuesta = await EncuestaGym.findOne({ idInterno });
        if (!encuesta) return res.status(404).json({ mensaje: 'Encuesta no encontrada' });

        for (let i = 1; i <= 10; i++) {
            const key = `pregunta${i}`;
            if (respuestas[key]) {
                encuesta[key] = {
                    ...encuesta[key],
                    valoracion: respuestas[key].valoracion,
                };
            }
        }

        encuesta.respondida = true;
        await encuesta.save();

        res.json({ mensaje: 'Encuesta respondida correctamente', encuesta });
    } catch (error) {
        console.error('Error al responder encuesta:', error);
        res.status(500).json({ mensaje: 'Error al responder encuesta' });
    }
};

module.exports = {
    crearEncuesta,
    obtenerEncuesta,
    obtenerEncuestaPorInstitucion,
    obtenerEncuestaPorComplejo,
    obtenerEncuestaPorCreador,
    obtenerEncuestaPorUsuario,
    obtenerEncuestaPorIdInterno,
    eliminarEncuesta,
    responderEncuesta,
    editarEncuesta,
    obtenerEncuestaPorEvaluado,
    crearEncuestasMasivas,
};
