var express = require('express');
const upload = require('../libs/docsStorage');
const { createTask, getAllTasks, getTaskDetail, deleteTask, deleteTaskFromClassroom, updateTaskInClassroom, updateTaskForStudent, deleteAllTasksFromClassroom } = require('../controllers/taskController');
var router = express.Router();

router.post('/create', createTask)
router.get('/all', getAllTasks);
router.get('/:id', getTaskDetail);
router.put('/update/:studentId/tasks/:idTask', upload.single('fileStudent'), updateTaskForStudent);

router.delete('/classrooms/:classroomId/tasks/:idTask', deleteAllTasksFromClassroom);

module.exports = router;