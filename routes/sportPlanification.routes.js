const express = require('express');
const router = express.Router();
const upLoadDocs = require('../libs/docsStorage');
const { createSportPlanification, deleteSportPlanification, getSportPlanificationById, updateSportPlanification, getSportPlanificationBySportCategory } = require('../controllers/sportPlanificationController');

router.post('/create', upLoadDocs.single('quiz'), createSportPlanification)
router.delete('/delete/:id/category/:idSport', deleteSportPlanification)
router.get('/find/:id', getSportPlanificationById)
router.patch('/update/:id', upLoadDocs.single('quiz'), updateSportPlanification)
router.get('/get-all/:id', getSportPlanificationBySportCategory)

module.exports = router