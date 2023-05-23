var express = require('express');
const upload = require('../libs/storage');
const { createResume } = require('../controllers/resumeVMClassController');
var router = express.Router();

router.post('/create-resume', upload.fields([
    { name: 'imgFirstVMClass', maxCount: 1 },
    { name: 'imgSecondVMClass', maxCount: 1 },
    { name: 'imgThirdVMClass', maxCount: 1 }
  ]), createResume )


module.exports = router;