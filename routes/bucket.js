const express = require('express');
const BucketController = require('../controllers/bucket');
const checkAuth = require('../middlewares/auth/check-auth');

const router = express.Router();

router.post("", checkAuth, BucketController.createBucket);

router.get("", checkAuth, BucketController.getBucket);

router.post("/:id", checkAuth, BucketController.updateBucket);

router.delete('/', checkAuth, BucketController.deleteBucket);

module.exports = router;