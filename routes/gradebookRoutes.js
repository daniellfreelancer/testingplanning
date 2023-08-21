var express = require('express');
const { createNote, deleteNote, updateNote, getNoteById, getAllNotes, getNotesByClassroom } = require('../controllers/gradebookController');
var router = express.Router()


router.post('/create', createNote)
router.post('/remove-note', deleteNote)
router.put('/update/:studentId/gradebook/:idNote', updateNote)
router.get('/find-by-id/:idNote', getNoteById);
router.get('/find', getAllNotes);
router.get('/find/classroom/:classroomId', getNotesByClassroom);
module.exports = router;