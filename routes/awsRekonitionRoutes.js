var express = require('express');
var router = express.Router();
const upload = require('../libs/docsStorage');
const { verificarUsuario, registrarUsuario, subirFotoUsuarioRegistrado } = require('../controllers/aws');

router.post('/verify-person', upload.single('foto'), verificarUsuario)
router.post('/create-user', upload.single('foto'),registrarUsuario )
router.put('/update-rekognition-user', upload.single('foto'), subirFotoUsuarioRegistrado)

module.exports = router