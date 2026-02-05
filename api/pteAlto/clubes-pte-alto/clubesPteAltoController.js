const ClubesPteAlto = require('./clubesPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client');

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

// Normalizar body cuando viene de multipart (FormData): parsear JSON en responsable/contacto y status
function normalizeBody(body) {
    const normalized = { ...body };
    if (typeof normalized.responsable === 'string') {
        try {
            normalized.responsable = JSON.parse(normalized.responsable);
        } catch (_) {
            normalized.responsable = [];
        }
    }
    if (typeof normalized.contacto === 'string') {
        try {
            normalized.contacto = JSON.parse(normalized.contacto);
        } catch (_) {
            normalized.contacto = [];
        }
    }
    if (typeof normalized.status === 'string') {
        normalized.status = normalized.status === 'true';
    }
    return normalized;
}

const clubesPteAltoController = {

    // crear club PTE Alto
    crearClubPteAlto: async (req, res) => {
        try {
            const body = normalizeBody(req.body);
            const clubPteAlto = new ClubesPteAlto(body);
            await clubPteAlto.save();

            //subir documento del club a s3
            if (req.file) {
                const key = await uploadMulterFile(req.file);
                const fileUrl = `${cloudfrontUrl}/${key}`;
                clubPteAlto.documento = fileUrl;
                await clubPteAlto.save();
            } 

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
            const body = normalizeBody(req.body);
            const clubPteAlto = await ClubesPteAlto.findByIdAndUpdate(req.params.id, body, { new: true });
            //subir documento del club a s3
            
            if (req.file) {
                const key = await uploadMulterFile(req.file);
                const fileUrl = `${cloudfrontUrl}/${key}`;
                clubPteAlto.documento = fileUrl;
                await clubPteAlto.save();
            }

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