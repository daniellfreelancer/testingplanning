var express = require('express');
var router = express.Router();
const {signUp, singIn, singOut, getAdmins}  = require('../controllers/adminController')


router.post('/register',signUp)
router.post('/login',singIn)
router.post('/logout', singOut)
router.get('/users', getAdmins)

module.exports = router;