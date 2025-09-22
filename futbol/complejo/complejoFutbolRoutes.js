const express = require("express");
const router = express.Router();
const complejoController = require("./complejoFutbolController");
const { databaseMiddleware } = require("../../config/database");

router.use(databaseMiddleware);

router.post("/crear", complejoController.crearComplejo);
router.post("/editar/:id", complejoController.editarComplejo);
router.get("/getall", complejoController.obtenerTodos);
router.get("/getone/:id", complejoController.obtenerPorId);
router.get("/getespacio/:espacioId", complejoController.obtenerPorEspacio);
router.get("/getdeporte/:deporte", complejoController.obtenerPorDeporte);
router.get("/getcomuna/:comuna", complejoController.obtenerPorComuna);
router.get("/getzona/:zona", complejoController.obtenerPorZonaComuna);

module.exports = router;