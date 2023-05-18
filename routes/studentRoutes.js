var express = require('express');
const { create } = require('../controllers/studentController');
const upload = require('../libs/storage');
var router = express.Router();

router.post('/create', upload.single('image'),create)


module.exports = router;