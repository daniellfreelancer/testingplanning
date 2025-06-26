const express = require('express');
const router = express.Router();
const userCarController = require('./userCarController');

router.post('/signup', userCarController.carSignUp);
router.post('/login', userCarController.carSignIn);
router.get('/all-users', userCarController.carGetAllUsers);
router.get('/get/:id', userCarController.carGetUserById);
router.post('/forgot-password', userCarController.carForgotPassword);
router.put('/update/:id', userCarController.carUpdateUser);
router.delete('/delete/:id', userCarController.carDeleteUser);

module.exports = router;