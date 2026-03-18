const HistoricoPteAlto = require('./historicoPteAlto');

const historicoPteAltoController = {

    crearHistoricoPteAlto: async (req, res) => {
        try {
            const historico = new HistoricoPteAlto(req.body);
            await historico.save();
            res.status(201).json({ message: 'Histórico PTE Alto creado correctamente', historico });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear histórico PTE Alto', error });
        }
    },

    obtenerTodosHistoricosPteAlto: async (req, res) => {
        try {
            const historicos = await HistoricoPteAlto.find()
                .sort({ createdAt: -1 })
                .populate('realizadoPor', 'nombre apellido email rol rut telefono');
            res.status(200).json({ message: 'Históricos PTE Alto obtenidos correctamente', historicos });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener históricos PTE Alto', error });
        }
    },
};

module.exports = historicoPteAltoController;
