var express = require('express');
const upload = require('../libs/docsStorage');
const { addMoment, getAllMoments, deleteMoment, getMomentsByType } = require('../controllers/momentController');
var router = express.Router();

router.post('/create', upload.single('momentImg'), addMoment)
router.get('/get', getAllMoments)
router.get('/by-type', getMomentsByType)
router.delete('/delete/:momentId/user/:userId', deleteMoment);

module.exports = router;