var express = require('express');
const { createTraining, getTrainingList, getTrainingListByUser, getTrainingById, getTrainingByListOnlyStudents } = require('../controllers/trainingAppController');
var router = express.Router()

router.post('/create', createTraining)
router.get('/training-list', getTrainingList)
router.get('/training-list-by-user/:id/:typeUser', getTrainingListByUser)
router.get('/training-by-id/:trainingId', getTrainingById)
router.get('/training-by-student-list/', getTrainingByListOnlyStudents)


module.exports = router;