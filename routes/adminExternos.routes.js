const express = require("express");
const router = express.Router();
const adminExternosController = require("../controllers/adminExternosController");

router.post(
  "/crear-admin-externo/:institucion",
  adminExternosController.crearAdminExterno
);
router.post("/login", adminExternosController.loginAdminExterno);
router.get("/mis-usuarios", adminExternosController.obtenerMisUsuarios);
router.post("/agregar-usuarios", adminExternosController.agregarUsuariosALista);
router.post("/quitar-usuario", adminExternosController.quitarUsuarioDeLista);
router.get(
  "/obtener-por-institucion/:institucion",
  adminExternosController.obtenerAdminExternosPorInstitucion
);
router.get(
  "/obtener-todos",
  adminExternosController.obtenerTodosAdminExternos
);
router.get(
  "/obtener-por-id/:id",
  adminExternosController.obtenerAdminExternoPorId
);
router.put(
  "/actualizar/:id",
  adminExternosController.actualizarAdminExterno
);
router.patch(
  "/actualizar-status/:id",
  adminExternosController.actualizarStatusAdminExterno
);
router.post(
  "/resetear-password/:id",
  adminExternosController.resetearPasswordAdminExterno
);

router.get(
  "/historial-accesos/mis-usuarios/:periodo?",
  adminExternosController.obtenerHistorialAccesosMisUsuarios
);

router.get(
  "/obtener-externos-para-patentes/:id",
  adminExternosController.obtenerExternosParaPatentes
);

module.exports = router;
