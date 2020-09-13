const express = require('express');
const CommandController = require('../controllers/command');
const checkAuth = require('../middlewares/auth/check-auth');

const router = express.Router();

router.post("", checkAuth, CommandController.createCommand);

router.get("", checkAuth, CommandController.getCommands);

router.get("/:id", checkAuth, CommandController.getCommand);

module.exports = router;