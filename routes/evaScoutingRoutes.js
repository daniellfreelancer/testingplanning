const express = require("express");
const router = express.Router();
const controller = require("../controllers/evaScoutingController");

router.post("/crear", controller.crear);
router.get("/getall", controller.obtenerTodos);
router.get("/getone-fecha/:fecha", controller.obtenerPorFecha); // 2025-09-23
router.get("/getone-eva/:id", controller.obtenerPorId);
router.delete("/delete/:id", controller.eliminar);
router.get("/getone-evaluado/:id", controller.obtenerPorEvaluado);
router.get("/getone-evaluador/:id", controller.obtenerPorEvaluador);

module.exports = router;
