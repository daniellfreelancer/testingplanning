var express = require('express');
var router = express.Router();
const {signUp, getAdmins, resetPassword, signIn, signOut, updateUser, emailToResetPassword, deleteUser, resetPasswordInsideApp, getTeachers, controlParentalActive}  = require('../controllers/adminController')
const upload = require('../libs/docsStorage');
const { idFrontUpload, idBackUpload, backgroundUpload, otherDocsUpload } = require('../controllers/docsController');

router.post('/register',upload.single('imgUrl') ,signUp)
router.post('/login',signIn)
router.post('/logout', signOut)
router.post('/reset', resetPassword)
router.post('/control-parental', controlParentalActive);
router.get('/users', getAdmins)
router.patch('/update/:rut', upload.single('imgUrl'), updateUser)
router.post('/reset-password',emailToResetPassword)
router.delete('/user/:_id', deleteUser);
router.put('/reset-from-app', resetPasswordInsideApp)
router.get('/teachers', getTeachers)
router.patch('/upload-id-front/:id', upload.single('idFront'), idFrontUpload )
router.patch('/upload-id-back/:id', upload.single('idBack'), idBackUpload)
router.patch('/upload-background/:id', upload.single('backgroundDoc'), backgroundUpload)
router.patch('/upload-other-docs/:id', upload.single('otherDocs'), otherDocsUpload)

module.exports = router;