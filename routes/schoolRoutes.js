var express = require('express');
const { createSchool, addAdminToSchool, removeAdminFromSchool, addClassroomToSchool } = require('../controllers/schoolController');
var router = express.Router();


router.post('/create', createSchool)
router.patch('/new-admin', addAdminToSchool)
router.patch('/new-classroom', addClassroomToSchool)
router.delete('/delete-admin', removeAdminFromSchool)


module.exports = router