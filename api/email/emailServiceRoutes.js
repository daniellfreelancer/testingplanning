const express = require('express');
const router = express.Router();
const emailServiceController = require('./emailServiceController');

router.post('/patentes-piscina', emailServiceController.enviarPatentePiscinaSantiago)


module.exports = router