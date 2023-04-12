var express = require('express');
const { createSchool } = require('../controllers/schoolController');
var router = express.Router();


router.post('/create', createSchool)


module.exports = router