const express = require('express');
const upload = require('../libs/storage');
const {createResumeTraining, getResumeTrainingBySportCategory, getResumeTrainingById, getResumeByTeacher} = require('../controllers/resumeVMTraining.controller');
const router = express.Router();

router.post('/create', upload.fields([{name: 'imgFirstVMClass', maxCount: 1}, {name: 'imgSecondVMClass', maxCount: 1}, {name: 'imgThirdVMClass', maxCount: 1}]), createResumeTraining);
router.get('/find/:id', getResumeTrainingById);
router.get('/get-all/:id', getResumeTrainingBySportCategory);
router.get('/resume-by-teacher/:teacherId', getResumeByTeacher)

module.exports = router;