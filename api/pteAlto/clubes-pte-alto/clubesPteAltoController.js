const ClubesPteAlto = require('./clubesPteAlto');

const clubesPteAltoController = {

    // crear club PTE Alto
    crearClubPteAlto: async (req, res) => {
        try {
            const clubPteAlto = new ClubesPteAlto(req.body);
            await clubPteAlto.save();
            res.status(201).json({ message: 'Club PTE Alto creado correctamente', clubPteAlto });
        } catch (error) {
            res.status(500).json({ message: 'Error al crear club PTE Alto', error });
        }
    },
    // obtener todos los clubes PTE Alto
    obtenerTodosLosClubesPteAlto: async (req, res) => {
        try {
            const clubesPteAlto = await ClubesPteAlto.find().sort({ nombre: 1 });
            res.status(200).json({ message: 'Clubes PTE Alto obtenidos correctamente', clubesPteAlto });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener clubes PTE Alto', error });
        }
    },
    // obtener club PTE Alto por id
    obtenerClubPteAltoPorId: async (req, res) => {
        try {
            const clubPteAlto = await ClubesPteAlto.findById(req.params.id);
            res.status(200).json({ message: 'Club PTE Alto obtenido correctamente', clubPteAlto });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener club PTE Alto', error });
        }
    },
    // actualizar club PTE Alto por id
    actualizarClubPteAltoPorId: async (req, res) => {
        try {
            const clubPteAlto = await ClubesPteAlto.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json({ message: 'Club PTE Alto actualizado correctamente', clubPteAlto });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar club PTE Alto', error });
        }
    },
    // eliminar club PTE Alto por id
    eliminarClubPteAltoPorId: async (req, res) => {
        try {
            await ClubesPteAlto.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Club PTE Alto eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar club PTE Alto', error });
        }
    },
}

module.exports = clubesPteAltoController;