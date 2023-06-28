const express = require('express');
const router = express.Router();
const uploadDocs = require('../libs/docsStorage');
const { createPlanification, deletePlanificationWorkshop, getPlanificationById, updatePlanification } = require('../controllers/workshopPlanificationController');


router.post('/create', uploadDocs.single('quiz'), createPlanification )
// router.post('/create', createPlanification)
// router.delete('/delete-planification', deletePlanification )
router.delete('/delete-planification/:planificationId/workshop/:workshopId', deletePlanificationWorkshop )
router.get('/find/:id', getPlanificationById )
router.patch('/update/:planificationId', uploadDocs.single('quiz'), updatePlanification )


module.exports = router