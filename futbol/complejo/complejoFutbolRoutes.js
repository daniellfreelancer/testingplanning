const express = require("express");
const router = express.Router();
const complejoController = require("./complejoFutbolController");
const { databaseMiddleware } = require("../../config/database");

router.use(databaseMiddleware);

router.post("/crear", complejoController.crearComplejo);
router.post("/editar/:id", complejoController.editarComplejo);

module.exports = router;