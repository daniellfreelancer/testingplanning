const express = require('express');
const router = express.Router();
const gymUserController = require('../controllers/gymUser.controller')


router.post('/user/create', gymUserController.signUpUserGym)
router.post('/user/login', gymUserController.signInUserGym)
router.post('/user/logout', gymUserController.signOutUserGym)


module.exports = router