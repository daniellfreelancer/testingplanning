const express = require("express");
const router = express.Router();
const transbankController = require("../controllers/payments/transbank.controller");

router.post("/init", transbankController.initTransaction);
router.post("/commit", transbankController.commitTransaction);
router.get("/status/:token", transbankController.getStatus);
router.post("/refund", transbankController.refundTransaction);

module.exports = router;
