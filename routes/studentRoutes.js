var express = require('express');
const { create, getStudentDetail, updateTask, findTaskByStudent, updateTaskById, getStudentsByfilter, getStudents, updateStudent, deleteStudent, getStudentsAll, getStudentByRut } = require('../controllers/studentController');
const upload = require('../libs/docsStorage')
var router = express.Router();

router.post('/create', upload.single('imgUrl'),create)
router.get('/find/:id', getStudentDetail );
router.get('/all-students', getStudentsAll );
router.post('/updateTask/:studentId/task/:taskId', upload.single('fileStudent'), updateTask);
router.get('/find/:studentId/tasks/:idTask', findTaskByStudent);
router.put('/update/:studentId/tasks/:idTask', upload.single('fileStudent'), updateTaskById);
router.get('/search', getStudentsByfilter)
router.get('/get-all', getStudents)
router.put('/update/:id', updateStudent)
router.delete('/delete/:id', deleteStudent)
router.get('/get-by-rut/:rut', getStudentByRut)



module.exports = router;