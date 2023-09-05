var express = require('express');
const upload = require('../libs/docsStorage');
const { addMoment, getAllMoments } = require('../controllers/momentController');
var router = express.Router();

router.post('/create', upload.single('momentImg'), addMoment)
router.get('/get', getAllMoments)

module.exports = router;