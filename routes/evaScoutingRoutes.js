const express = require("express");
const router = express.Router();
const controller = require("../controllers/evaScoutingController");

router.post("/crear", controller.crear);
/*
{
  "fecha_evaluacion": "2025-09-23T14:10:00.000Z",
  "calificaciones": [8, 8, 8, 6],
  "evaluado": "66f16e3f5a93c45d2c2d9b11",
  "evaluador": "66f16e9b5a93c45d2c2d9b22"
}
*/

router.get("/getall", controller.obtenerTodos);
router.get("/getone-fecha/:fecha", controller.obtenerPorFecha); // 2025-09-23
router.get("/getone-eva/:id", controller.obtenerPorId);
router.delete("/delete/:id", controller.eliminar);
router.get("/getone-evaluado/:id", controller.obtenerPorEvaluado);
router.get("/getone-evaluador/:id", controller.obtenerPorEvaluador);
router.put("/editar/:id", controller.editar);

module.exports = router;
