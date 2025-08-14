const EncuestaGym = require('../models/encuestaGymModel');

// Crear encuestas masivsas
const crearEncuestasMasivas = async (req, res) => {
    try {
        const {
            respondidaPor,
            idInterno: idInternoPrefijo = "ENC",
            ...resto
        } = req.body || {};

        if (!Array.isArray(respondidaPor) || respondidaPor.length === 0) {
            return res.status(400).json({
                ok: false,
                message: "El campo 'respondidaPor' debe ser un array con al menos un ID.",
            });
        }

        const requeridos = ["institucion", "creadaPor"];
        const faltantes = requeridos.filter((k) => !resto[k]);
        if (faltantes.length) {
            return res.status(400).json({
                ok: false,
                message: `Faltan campos requeridos: ${faltantes.join(", ")}`,
            });
        }

        const docs = respondidaPor.map((idResp) => {
            const uniqueSuffix =
                typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

            return {
                ...resto,
                idInterno: `${idInternoPrefijo}-${uniqueSuffix}`,
                respondidaPor: idResp,
                respondida: false,
            };
        });

        // Inserción masiva
        const creadas = await EncuestaGym.insertMany(docs, { ordered: true });

        return res.status(201).json({
            ok: true,
            message: `Encuestas creadas: ${creadas.length}`,
            data: creadas,
        });
    } catch (err) {
        console.error("Error en crearEncuestasMasivas:", err);
        return res.status(500).json({
            ok: false,
            message: "Error interno al crear encuestas masivas.",
            error: process.env.NODE_ENV === "production" ? undefined : String(err),
        });
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
