const express = require('express');
const PaymentController = require('../controllers/payment');
const checkAuth = require('../middlewares/auth/check-auth');

const router = express.Router();

router.get("", checkAuth, PaymentController.getClientSecretAndValue);

module.exports = router;