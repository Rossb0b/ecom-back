const express = require('express');
const ProductController = require('../controllers/product');
const BucketController = require('../controllers/bucket');
const checkRole = require('../middlewares/role/check-role');

const router = express.Router();

router.post("", checkRole, ProductController.addProduct);

router.post("/:id", checkRole, ProductController.updateProduct);

router.get("", ProductController.getProducts);

router.get("/:id", ProductController.getOneProduct);

router.delete("/:id", checkRole, ProductController.deleteProduct, BucketController.updateBucketAfterProductDeletion);

module.exports = router;