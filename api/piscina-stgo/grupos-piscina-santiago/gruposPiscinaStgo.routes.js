const express = require('express');
const router = express.Router();
const gruposPiscinaStgoController = require('./gruposPiscinaStgoController');

router.post('/crear-grupo', gruposPiscinaStgoController.crearGrupoPiscinaStgo);
router.get('/obtener-grupos', gruposPiscinaStgoController.obtenerGruposPiscinaStgo);
router.get('/obtener-grupo/:id', gruposPiscinaStgoController.obtenerGrupoPiscinaStgo);

router.put('/asignar-profesor/:id', gruposPiscinaStgoController.actualizarProfesoresGrupoPiscinaStgo);
router.put('/remover-profesor/:id', gruposPiscinaStgoController.eliminarProfesorGrupoPiscinaStgo);

router.put('/agregar-usuario/:id', gruposPiscinaStgoController.actualizarUsuariosGrupoPiscinaStgo);
router.delete('/remover-usuario/:id/:usuarioId', gruposPiscinaStgoController.eliminarUsuarioGrupoPiscinaStgo);

router.put('/actualizar-variantes/:id', gruposPiscinaStgoController.actualizarVariantesGrupoPiscinaStgo);
router.delete('/eliminar-variante/:id/:varianteId', gruposPiscinaStgoController.eliminarVarianteGrupoPiscinaStgo);

router.put('/actualizar-plan/:id', gruposPiscinaStgoController.actualizarPlanGrupoPiscinaStgo);
router.put('/remover-plan/:id', gruposPiscinaStgoController.eliminarPlanGrupoPiscinaStgo);

router.put('/actualizar-grupo/:id', gruposPiscinaStgoController.actualizarGrupoPiscinaStgo);

router.put('/marcar-asistencia/:id', gruposPiscinaStgoController.marcarAsistenciaGrupoPiscinaStgo);
router.get('/obtener-asistencia/:id', gruposPiscinaStgoController.obtenerAsistenciaGrupoPiscinaStgo);

router.get('/buscar-usuario/:rut', gruposPiscinaStgoController.buscarUsuarioPiscinaPorRut);

module.exports = router;
