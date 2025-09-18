const express = require("express");
const router = express.Router();
const espacioController = require("./espacioFutbolController");
const { databaseMiddleware } = require("../../config/database");

router.use(databaseMiddleware);

router.post("/crear", espacioController.crearEspacio);
router.post("/editar/:id", espacioController.editarEspacio);

module.exports = router;