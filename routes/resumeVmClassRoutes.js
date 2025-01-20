var express = require('express');
const upload = require('../libs/storage');
const { createResume, getResume, getResumeById, getResumeByClassroom, getResumeByTeacher } = require('../controllers/resumeVMClassController');
var router = express.Router();

router.post('/create-resume', upload.fields([
    { name: 'imgFirstVMClass', maxCount: 1 },
    { name: 'imgSecondVMClass', maxCount: 1 },
    { name: 'imgThirdVMClass', maxCount: 1 }
  ]), createResume );

router.get('/resumes', getResume)
router.get('/vmresume/:id', getResumeById)
router.get('/resumes/:classroomId', getResumeByClassroom);
router.get('/resume-by-teacher/:teacherId', getResumeByTeacher)


module.exports = router;