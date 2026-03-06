const Organigrama = require('../models/organigrama');
const Joi = require('joi');

// Validación para crear/actualizar organigrama
const organigramaValidator = Joi.object({
    nombre: Joi.string().required().messages({
        "string.empty": "El nombre es requerido"
    }),
    descripcion: Joi.string().allow(''),
    nodes: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        type: Joi.string(),
        position: Joi.object({
            x: Joi.number().required(),
            y: Joi.number().required()
        }).unknown(true),
        data: Joi.object({
            label: Joi.string().required(),
            cargo: Joi.string().allow(''),
            email: Joi.string().allow(''),
            telefono: Joi.string().allow(''),
            departamento: Joi.string().allow(''),
            imgUrl: Joi.string().allow('')
        }).unknown(true),
        style: Joi.object().unknown(true)
    }).unknown(true)).required(),
    edges: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        source: Joi.string().required(),
        target: Joi.string().required(),
        type: Joi.string(),
        animated: Joi.boolean(),
        style: Joi.object().unknown(true)
    }).unknown(true)).required(),
    institution: Joi.string().allow(null),
    club: Joi.string().allow(null),
    isActive: Joi.boolean()
}).unknown(true);

const organigramaController = {
    // Crear organigrama
    create: async (req, res) => {
        try {
            const { error } = organigramaValidator.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const organigramaData = {
                ...req.body,
            };

            // Solo agregar createdBy si hay usuario autenticado
            if (req.user && req.user._id) {
                organigramaData.createdBy = req.user._id;
            }

            const organigrama = new Organigrama(organigramaData);

            await organigrama.save();

            res.status(201).json({
                success: true,
                message: 'Organigrama creado exitosamente',
                data: organigrama
            });
        } catch (error) {
            console.error('Error al crear organigrama:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear organigrama',
                error: error.message
            });
        }
    },

    // Obtener todos los organigramas
    getAll: async (req, res) => {
        try {
            const { institution, club, isActive } = req.query;
            const filter = {};

            if (institution) filter.institution = institution;
            if (club) filter.club = club;
            if (isActive !== undefined) filter.isActive = isActive === 'true';

            const organigramas = await Organigrama.find(filter)
                .populate('createdBy', 'name lastName email')
                .populate('institution', 'name')
                .populate('club', 'name')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                data: organigramas
            });
        } catch (error) {
            console.error('Error al obtener organigramas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener organigramas',
                error: error.message
            });
        }
    },

    // Obtener organigrama por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const organigrama = await Organigrama.findById(id)
                .populate('createdBy', 'name lastName email')
                .populate('institution', 'name')
                .populate('club', 'name');

            if (!organigrama) {
                return res.status(404).json({
                    success: false,
                    message: 'Organigrama no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: organigrama
            });
        } catch (error) {
            console.error('Error al obtener organigrama:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener organigrama',
                error: error.message
            });
        }
    },

    // Actualizar organigrama
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { error } = organigramaValidator.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const organigrama = await Organigrama.findByIdAndUpdate(
                id,
                {
                    ...req.body,
                    $inc: { version: 1 }
                },
                { new: true, runValidators: true }
            );

            if (!organigrama) {
                return res.status(404).json({
                    success: false,
                    message: 'Organigrama no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Organigrama actualizado exitosamente',
                data: organigrama
            });
        } catch (error) {
            console.error('Error al actualizar organigrama:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar organigrama',
                error: error.message
            });
        }
    },

    // Eliminar organigrama (soft delete)
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const organigrama = await Organigrama.findByIdAndUpdate(
                id,
                { isActive: false },
                { new: true }
            );

            if (!organigrama) {
                return res.status(404).json({
                    success: false,
                    message: 'Organigrama no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Organigrama eliminado exitosamente',
                data: organigrama
            });
        } catch (error) {
            console.error('Error al eliminar organigrama:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar organigrama',
                error: error.message
            });
        }
    },

    // Eliminar permanentemente
    hardDelete: async (req, res) => {
        try {
            const { id } = req.params;

            const organigrama = await Organigrama.findByIdAndDelete(id);

            if (!organigrama) {
                return res.status(404).json({
                    success: false,
                    message: 'Organigrama no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Organigrama eliminado permanentemente'
            });
        } catch (error) {
            console.error('Error al eliminar organigrama:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar organigrama',
                error: error.message
            });
        }
    }
};

module.exports = organigramaController;
