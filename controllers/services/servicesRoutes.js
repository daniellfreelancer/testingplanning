var express = require('express');
const { cleanStudentsProgramAndWorkshop } = require('./servicesController');
var router = express.Router();

// Limpia (remueve) estudiantes del programa y de los workshops asociados, y luego los elimina
router.delete('/clean-students-program-and-workshops/:programId', cleanStudentsProgramAndWorkshop);

module.exports = router;
