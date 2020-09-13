const express = require('express');
const UserController = require('../controllers/user');
const AuthController = require('../controllers/auth');
const checkAuth = require('../middlewares/auth/check-auth');

const router = express.Router();

router.post("", UserController.createUser, AuthController.autoLogin);

router.get("", checkAuth, UserController.getUserFromJWT);

router.post('/:id', checkAuth, UserController.updateUser);

module.exports = router;