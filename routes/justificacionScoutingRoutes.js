const express = require("express");
const router = express.Router();
const controller = require("../controllers/justificacionScoutingController");

router.post("/crear", controller.crear);
/*
{
  "transporte": "Bus",
  "comida": "Hamburg",
  "hospedaje": "Hotel Central",
  "evaluador": "66f16e9b5a93c45d2c2d9b22",
  "validado": [false, false, true]
}
*/
router.get("/getall", controller.obtenerTodos);
router.get("/getone-evaluador/:id", controller.obtenerPorEvaluador);
router.put("/editar/:id", controller.editar);
router.get("/getone-justificacion/:id", controller.obtenerPorId);

module.exports = router;
