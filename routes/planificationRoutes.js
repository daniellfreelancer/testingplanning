var express = require('express');
const { deletePlanification, createPlanification, getPlanificationById, updatePlanification, testingPlanificationDoc, getPlanifications } = require('../controllers/planificationController');
var router = express.Router();
const {uploadFile} = require('../s3')
const { upload, uploadToS3 } = require('../libs/storageAWS')
const uploadDocs = require('../libs/docsStorage')


router.post('/create', uploadDocs.single('quiz'), createPlanification)
// router.post('/create', createPlanification)
router.delete('/delete-planification', deletePlanification)
router.delete('/delete-planification/:planificationId/classroom/:classroomId', deletePlanification)
router.get('/find/:id', getPlanificationById)
router.patch('/update/:planificationId', uploadDocs.single('quiz'), updatePlanification)
router.get('/get-all', getPlanifications)


module.exports = router