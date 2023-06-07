var express = require('express');
const { deletePlanification, createPlanification, getPlanificationById, updatePlanification } = require('../controllers/planificationController');
var router = express.Router();
const uploadDocs = require('../libs/docsStorage')

router.post('/create', uploadDocs.single('quiz'), createPlanification)
router.delete('/delete-planification', deletePlanification)
router.delete('/delete-planification/:planificationId/classroom/:classroomId', deletePlanification)
router.get('/find/:id', getPlanificationById)
router.patch('/update/:planificationId', updatePlanification)

module.exports = router