const ClubesPteAlto = require('./clubesPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client');

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

const DOCUMENTOS_MAX = 10;

// Normalizar body cuando viene de multipart (FormData): parsear JSON en responsable/contacto/status/documentosExistentes
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
    if (typeof normalized.documentosExistentes === 'string') {
        try {
            normalized.documentosExistentes = JSON.parse(normalized.documentosExistentes);
        } catch (_) {
            normalized.documentosExistentes = [];
        }
    }
    return normalized;
}

const clubesPteAltoController = {

    // crear club PTE Alto
    crearClubPteAlto: async (req, res) => {
        try {
            const body = normalizeBody(req.body);
            const clubPteAlto = new ClubesPteAlto({ ...body, documentos: [] });
            await clubPteAlto.save();

            const files = req.files && Array.isArray(req.files) ? req.files : [];
            if (files.length > 0) {
                const urls = [];
                for (const file of files.slice(0, DOCUMENTOS_MAX)) {
                    const key = await uploadMulterFile(file);
                    urls.push(`${cloudfrontUrl}/${key}`);
                }
                clubPteAlto.documentos = urls;
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
            const documentosExistentes = Array.isArray(body.documentosExistentes) ? body.documentosExistentes : [];
            delete body.documentosExistentes;

            const clubPteAlto = await ClubesPteAlto.findByIdAndUpdate(req.params.id, body, { new: true });
            const files = req.files && Array.isArray(req.files) ? req.files : [];
            const newUrls = [];
            for (const file of files.slice(0, DOCUMENTOS_MAX - documentosExistentes.length)) {
                const key = await uploadMulterFile(file);
                newUrls.push(`${cloudfrontUrl}/${key}`);
            }
            clubPteAlto.documentos = [...documentosExistentes, ...newUrls].slice(0, DOCUMENTOS_MAX);
            await clubPteAlto.save();

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