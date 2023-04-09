var express = require('express');
var router = express.Router();
const {signUp, singIn, singOut}  = require('../controllers/adminController')


router.post('/register',signUp)
router.post('/login',singIn)
router.post('/logout', singOut)

module.exports = router;