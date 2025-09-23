// controllers/evaScoutingController.js
const mongoose = require("mongoose");
const evaScoutingSchema = require("../models/evaluacionScouting");

const Scouting = mongoose.models.EvaluacionScouting
    || mongoose.model("EvaluacionScouting", evaScoutingSchema);

const controller = {
    crear: async (req, res) => {
        try {
            const nuevo = new Scouting(req.body);
            await nuevo.save();
            res.status(201).json({ message: "Scouting creado", scouting: nuevo });
        } catch (error) {
            res.status(500).json({ error: "Error al crear", message: error.message });
        }
    },
    obtenerTodos: async (_req, res) => {
        try {
            const docs = await Scouting.find().sort({ fecha_evaluacion: -1, createdAt: -1 });
            res.status(200).json(docs);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener todos", message: error.message });
        }
    },
    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const doc = await Scouting.findById(id);
            if (!doc) return res.status(404).json({ error: "No se encontró el scouting" });
            res.status(200).json(doc);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener por id", message: error.message });
        }
    },
    obtenerPorFecha: async (req, res) => {
        try {
            const { fecha } = req.params;
            const start = new Date(fecha);
            if (isNaN(start)) return res.status(400).json({ error: "Fecha inválida. Usa YYYY-MM-DD" });
            const end = new Date(start);
            end.setUTCDate(start.getUTCDate() + 1);
            const docs = await Scouting.find({ fecha_evaluacion: { $gte: start, $lt: end } })
                .sort({ fecha_evaluacion: -1 });
            res.status(200).json(docs);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener por fecha", message: error.message });
        }
    },
    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            const eliminado = await Scouting.findByIdAndDelete(id);
            if (!eliminado) return res.status(404).json({ error: "No se encontró el scouting" });
            res.status(200).json({ message: "Scouting eliminado", scouting: eliminado });
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar", message: error.message });
        }
    },
    obtenerPorEvaluado: async (req, res) => {
        try {
            const { id } = req.params;
            const docs = await Scouting.find({ evaluado: id })
                .sort({ fecha_evaluacion: -1 });
            res.status(200).json(docs);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener por evaluado", message: error.message });
        }
    },
    obtenerPorEvaluador: async (req, res) => {
        try {
            const { id } = req.params;
            const docs = await Scouting.find({ evaluador: id })
                .sort({ fecha_evaluacion: -1 });
            res.status(200).json(docs);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener por evaluador", message: error.message });
        }
    },
};

module.exports = controller;
