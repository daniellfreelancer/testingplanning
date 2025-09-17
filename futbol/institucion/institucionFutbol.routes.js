const express = require("express");
const router = express.Router();
const institucionController = require("./institucionFutbolController");
const {databaseMiddleware} = require('../../config/database');

router.use(databaseMiddleware);
router.post("/crear", institucionController.crearInstitucion);
router.post("/editar/:id", institucionController.editarInstitucion);

module.exports = router;