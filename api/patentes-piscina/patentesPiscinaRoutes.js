const express = require("express");
const router = express.Router();
const patentesPiscinaController = require("./patentesPiscinaController");

router.post("/crear", patentesPiscinaController.crear);
router.get("/todas", patentesPiscinaController.listarTodas);
router.get("/count", patentesPiscinaController.contar);
router.get("/por-institucion/:institucion", patentesPiscinaController.listarPorInstitucion);
router.get("/por-rut/:rut", patentesPiscinaController.listarPorRut);

module.exports = router;
