var express = require('express');
const { create, deletePlanification } = require('../controllers/planificationController');
var router = express.Router();

router.post('/create', create)
// router.delete('/delete/:id', deletePlanification)
router.delete('/delete-planification', deletePlanification)
router.delete('/delete-planification/:planificationId/classroom/:classroomId', deletePlanification)

module.exports = router