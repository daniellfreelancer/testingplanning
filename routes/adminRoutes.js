var express = require('express');
var router = express.Router();
const {signUp, getAdmins, resetPassword, signIn, signOut}  = require('../controllers/adminController')


router.post('/register',signUp)
router.post('/login',signIn)
router.post('/logout', signOut)
router.post('/reset', resetPassword)
router.get('/users', getAdmins)

module.exports = router;