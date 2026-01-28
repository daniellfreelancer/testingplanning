const SedesDeportivasPteAlto = require('./sedesDeportivasPteAlto');
const { uploadMulterFile } = require('../../../utils/s3Client');

const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

const sedesDeportivasPteAltoController = {
    crearSedeDeportivaPteAlto: async (req, res) => {
        try {
            const body = req.body;
            const talleres = Array.isArray(body.talleres)
                ? body.talleres
                : [];
            const eventos = Array.isArray(body.eventos)
                ? body.eventos
                : [];
            const dias = Array.isArray(body.dias)
                ? body.dias
                : (typeof body.dias === 'string' ? (() => { try { const p = JSON.parse(body.dias); return Array.isArray(p) ? p : []; } catch { return []; } })() : []);
            const payload = {
                nombre: body.nombre,
                descripcion: body.descripcion,
                direccion: body.direccion,
                ciudad: body.ciudad,
                comuna: body.comuna,
                region: body.region,
                status: body.status || 'activo',
                dias,
                horarioApertura: body.horarioApertura,
                horarioCierre: body.horarioCierre,
                talleres,
                eventos,
            };
            const newSedeDeportivaPteAlto = new SedesDeportivasPteAlto(payload);
            if (req.file) {
                try {
                    const key = await uploadMulterFile(req.file);
                    const fileUrl = `${cloudfrontUrl}/${key}`;
                    newSedeDeportivaPteAlto.imgUrl = fileUrl;
                }   catch (uploadErr) {
                    console.log(uploadErr);
                    return res.status(500).json({
                        message: 'Error al subir la imagen de la sede deportiva',
                        error: uploadErr.message,
                        success: false,
                    });
                }
            }
            await newSedeDeportivaPteAlto.save();
            res.status(201).json({
                message: 'Sede deportiva creada correctamente',
                response: newSedeDeportivaPteAlto,
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al crear la sede deportiva',
                error: error.message,
                success: false,
            });
        }
    },
    obtenerTodasLasSedesDeportivasPteAlto: async (req, res) => {
        try {
            const sedesDeportivasPteAlto = await SedesDeportivasPteAlto.find();
            res.status(200).json({
                message: 'Sedes deportivas obtenidas correctamente',
                response: sedesDeportivasPteAlto,
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al obtener las sedes deportivas',
                error: error.message,
                success: false,
            });
        }
    },
    obtenerSedeDeportivaPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const sedeDeportivaPteAlto = await SedesDeportivasPteAlto.findById(id);
            res.status(200).json({
                message: 'Sede deportiva obtenida correctamente',
                response: sedeDeportivaPteAlto,
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al obtener la sede deportiva',
                error: error.message,
                success: false,
            });
        }
    },
    actualizarSedeDeportivaPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const sedeDeportivaPteAlto = await SedesDeportivasPteAlto.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).json({
                message: 'Sede deportiva actualizada correctamente',
                response: sedeDeportivaPteAlto,
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al actualizar la sede deportiva',
                error: error.message,
                success: false,
            });
        }
    },
    eliminarSedeDeportivaPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            await SedesDeportivasPteAlto.findByIdAndDelete(id);
            res.status(200).json({
                message: 'Sede deportiva eliminada correctamente',
                success: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error al eliminar la sede deportiva',
                error: error.message,
                success: false,
            });
        }
    }
}

module.exports = sedesDeportivasPteAltoController;