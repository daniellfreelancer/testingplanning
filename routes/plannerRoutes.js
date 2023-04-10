var express = require('express');
const { createPlan, addRPU,  insertObjective, getPlanners, addRegularProgramUnit, addAprendizajesToUnit, insertAprendizajes, insertAprendizaje, insertResources } = require('../controllers/plannerController');
var router = express.Router();

router.post('/create', createPlan)
router.post('/:grade/:level', addRegularProgramUnit)
router.post('/insertar-aprendizaje', insertAprendizaje);
router.post('/insertar-recursos', insertResources);
router.get('/data', getPlanners)
// router.put('/:grade/:level', insertObjective)
// router.post('/:unit/aprendizajes', addAprendizajesToUnit);
//ruta para ingresar aprendizaje

//ruta para ingresar recursos


module.exports = router;