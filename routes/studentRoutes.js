var express = require('express');
const { create } = require('../controllers/studentController');
const upload = require('../libs/docsStorage')
var router = express.Router();

router.post('/create', upload.single('imgUrl'),create)


module.exports = router;