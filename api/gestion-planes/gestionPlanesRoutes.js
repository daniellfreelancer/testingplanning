const express = require('express');
const router = express.Router();
const gestionPlanesController = require('./gestionPlanesController');

router.post('/crear', gestionPlanesController.crearPlan);
router.put('/editar/:id', gestionPlanesController.editarPlan);
router.delete('/eliminar-plan/:id', gestionPlanesController.eliminarPlan);
//obtener planes por institucion
router.get('/planes-institucion/:institucion', gestionPlanesController.planesPorInstitucion);
//asignarPlanAUsuario
router.post('/asignar/:usuarioId/:planId', gestionPlanesController.asignarPlanAUsuario);
//eliminarPlanDeUsuario
router.post('/eliminar/:usuarioId/:planId', gestionPlanesController.quitarPlanAUsuario);

//creacion de plan N
router.post('/creacion-plan', gestionPlanesController.crearPlanN);
router.put('/editar-plan-n/:id', gestionPlanesController.editarPlanN);
router.delete('/eliminar-plan-n/:id', gestionPlanesController.eliminarPlanN);
router.get('/planes-n-por-institucion/:institucion', gestionPlanesController.planesNPorInstitucion);
//crear variante plan N
router.post('/crear-variante-plan-n', gestionPlanesController.crearVariantePlanN);
router.put('/editar-variante-plan-n/:id', gestionPlanesController.editarVariantePlanN);
router.delete('/eliminar-variante-plan-n/:id', gestionPlanesController.eliminarVariantePlanN);


module.exports = router;