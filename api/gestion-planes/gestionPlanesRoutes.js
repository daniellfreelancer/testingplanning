const express = require('express');
const router = express.Router();
const gestionPlanesController = require('./gestionPlanesController');

router.post('/crear', gestionPlanesController.crearPlan);
router.put('/editar/:id', gestionPlanesController.editarPlan);
router.delete('/planes/:id', gestionPlanesController.eliminarPlan);
//obtener planes por institucion
router.get('/planes-institucion/:institucion', gestionPlanesController.planesPorInstitucion);
//asignarPlanAUsuario
router.post('/asignar/:usuarioId/:planId', gestionPlanesController.asignarPlanAUsuario);
//eliminarPlanDeUsuario
router.post('/eliminar/:usuarioId/:planId', gestionPlanesController.quitarPlanAUsuario);

module.exports = router;