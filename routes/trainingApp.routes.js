var express = require('express');
const { createTraining, getTrainingList, getTrainingListByUser, getTrainingById } = require('../controllers/trainingAppController');
var router = express.Router()

router.post('/create', createTraining)
router.get('/training-list', getTrainingList)
router.get('/training-list-by-user/:id/:typeUser', getTrainingListByUser)
router.get('/training-by-id/:trainingId', getTrainingById)


module.exports = router;