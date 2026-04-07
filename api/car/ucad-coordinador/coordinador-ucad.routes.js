const express = require('express');
const router = express.Router();
const coordinadorController = require('./coordinador-ucad-controller');

// Middleware de autenticación
const { verificarToken, verificarRol } = require('../middleware/auth');

// ==================== RUTAS COORDINADOR ====================

/**
 * @route   GET /api/coordinador/mis-profesionales
 * @desc    Obtener profesionales asignados al coordinador logueado
 * @access  Coordinador
 */
router.get('/mis-profesionales', verificarToken, coordinadorController.obtenerMisProfesionales);

/**
 * @route   GET /api/coordinador/mis-especialidades
 * @desc    Obtener especialidades asignadas al coordinador logueado
 * @access  Coordinador
 */
router.get('/mis-especialidades', verificarToken, coordinadorController.obtenerMisEspecialidades);

/**
 * @route   POST /api/coordinador/asignar-profesional
 * @desc    Coordinador se auto-asigna profesionales
 * @access  Coordinador
 */
router.post('/asignar-profesional', verificarToken, coordinadorController.autoAsignarProfesionales);

/**
 * @route   DELETE /api/coordinador/desasignar-profesional/:profesionalId
 * @desc    Desasignar un profesional
 * @access  Coordinador
 */
router.delete('/desasignar-profesional/:profesionalId', verificarToken, coordinadorController.desasignarProfesional);

/**
 * @route   GET /api/coordinador/agenda/:profesionalId
 * @desc    Obtener agenda de un profesional asignado
 * @access  Coordinador
 */
router.get('/agenda/:profesionalId', verificarToken, coordinadorController.obtenerAgendaProfesional);

/**
 * @route   GET /api/coordinador/agenda/:profesionalId/mes/:ano/:mes
 * @desc    Obtener horarios de un mes específico
 * @access  Coordinador
 */
router.get('/agenda/:profesionalId/mes/:ano/:mes', verificarToken, coordinadorController.obtenerHorariosMes);

/**
 * @route   POST /api/coordinador/agenda/:profesionalId/fecha
 * @desc    Guardar/actualizar horarios de una fecha específica
 * @access  Coordinador
 */
router.post('/agenda/:profesionalId/fecha', verificarToken, coordinadorController.guardarHorariosFecha);

/**
 * @route   POST /api/coordinador/agenda/:profesionalId/copiar-horarios
 * @desc    Copiar horarios de una fecha a otra(s)
 * @access  Coordinador
 */
router.post('/agenda/:profesionalId/copiar-horarios', verificarToken, coordinadorController.copiarHorarios);

/**
 * @route   POST /api/coordinador/agenda/:profesionalId/aplicar-plantilla
 * @desc    Aplicar plantilla base a múltiples fechas
 * @access  Coordinador
 */
router.post('/agenda/:profesionalId/aplicar-plantilla', verificarToken, coordinadorController.aplicarPlantillaAFechas);

/**
 * @route   PUT /api/coordinador/agenda/:profesionalId/periodo
 * @desc    Editar agenda de un profesional por período
 * @access  Coordinador
 */
router.put('/agenda/:profesionalId/periodo', verificarToken, coordinadorController.editarAgendaPorPeriodo);

/**
 * @route   POST /api/coordinador/agenda/:profesionalId/ajuste-rango
 * @desc    Agregar ajuste por rango de fechas
 * @access  Coordinador
 */
router.post('/agenda/:profesionalId/ajuste-rango', verificarToken, coordinadorController.gestionarAjusteRango);

/**
 * @route   DELETE /api/coordinador/agenda/:profesionalId/ajuste-rango/:ajusteId
 * @desc    Eliminar ajuste por rango de fechas
 * @access  Coordinador
 */
router.delete('/agenda/:profesionalId/ajuste-rango/:ajusteId', verificarToken, coordinadorController.eliminarAjusteRango);

/**
 * @route   POST /api/coordinador/agenda/:profesionalId/excepcion
 * @desc    Crear excepción (bloqueo por fecha específica)
 * @access  Coordinador
 */
router.post('/agenda/:profesionalId/excepcion', verificarToken, coordinadorController.crearExcepcion);

/**
 * @route   DELETE /api/coordinador/agenda/:profesionalId/excepcion/:excepcionId
 * @desc    Eliminar excepción
 * @access  Coordinador
 */
router.delete('/agenda/:profesionalId/excepcion/:excepcionId', verificarToken, coordinadorController.eliminarExcepcion);

// ==================== RUTAS ADMIN ====================

/**
 * @route   GET /api/admin/coordinadores
 * @desc    Obtener todos los coordinadores
 * @access  Admin
 */
router.get('/admin/coordinadores', verificarToken, coordinadorController.obtenerTodosCoordinadores);

/**
 * @route   POST /api/admin/coordinador/asignar
 * @desc    Admin asigna profesionales a coordinador
 * @access  Admin
 */
router.post('/admin/coordinador/asignar', verificarToken, coordinadorController.adminAsignarProfesionales);

/**
 * @route   GET /api/admin/asignaciones
 * @desc    Obtener todas las asignaciones
 * @access  Admin
 */
router.get('/admin/asignaciones', verificarToken, coordinadorController.obtenerTodasAsignaciones);

/**
 * @route   PUT /api/admin/coordinador/:id/permisos
 * @desc    Modificar permisos de un coordinador
 * @access  Admin
 */
router.put('/admin/coordinador/:id/permisos', verificarToken, coordinadorController.modificarPermisosCoordinador);

module.exports = router;
