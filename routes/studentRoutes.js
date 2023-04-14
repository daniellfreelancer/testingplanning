var express = require('express');
const { create } = require('../controllers/studentController');
var router = express.Router();

router.post('/create',create)


module.exports = router;