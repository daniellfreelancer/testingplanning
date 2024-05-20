var express = require('express');
var router = express.Router();
const {signUp, getAdmins, resetPassword, signIn, signOut, updateUser, emailToResetPassword, deleteUser, resetPasswordInsideApp, getTeachers}  = require('../controllers/adminController')
const upload = require('../libs/docsStorage')

router.post('/register',upload.single('imgUrl') ,signUp)
router.post('/login',signIn)
router.post('/logout', signOut)
router.post('/reset', resetPassword)
router.get('/users', getAdmins)
router.patch('/update/:rut', upload.single('imgUrl'), updateUser)
router.post('/reset-password',emailToResetPassword)
router.delete('/user/:_id', deleteUser);
router.put('/reset-from-app', resetPasswordInsideApp)
router.get('/teachers', getTeachers)

module.exports = router;