var express = require('express');
const { create, getStudentDetail, updateTask, findTaskByStudent, updateTaskById } = require('../controllers/studentController');
const upload = require('../libs/docsStorage')
var router = express.Router();

router.post('/create', upload.single('imgUrl'),create)
router.get('/find/:id', getStudentDetail );
router.post('/updateTask/:studentId/task/:taskId', upload.single('fileStudent'), updateTask);
router.get('/find/:studentId/tasks/:idTask', findTaskByStudent);
router.put('/update/:studentId/tasks/:idTask', upload.single('fileStudent'), updateTaskById);



module.exports = router;