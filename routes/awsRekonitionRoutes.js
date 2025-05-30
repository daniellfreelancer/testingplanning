var express = require('express');
var router = express.Router();
const upload = require('../libs/docsStorage');
const { verificarUsuario, registrarUsuario } = require('../controllers/aws');

router.post('/verify-person', upload.single('foto'), verificarUsuario)
router.post('/create-user', upload.single('foto'),registrarUsuario )

module.exports = router