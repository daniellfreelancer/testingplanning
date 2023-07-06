var express = require('express');
var router = express.Router();
const {signUp, getAdmins, resetPassword, signIn, signOut, updateUser}  = require('../controllers/adminController')
const upload = require('../libs/docsStorage')

router.post('/register',upload.single('imgUrl') ,signUp)
router.post('/login',signIn)
router.post('/logout', signOut)
router.post('/reset', resetPassword)
router.get('/users', getAdmins)
router.patch('/update/:rut', upload.single('imgUrl'), updateUser)

module.exports = router;