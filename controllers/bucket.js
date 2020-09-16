const Bucket = require('../models/bucket');
const Product = require('../models/product');

/**
 * Method to create a new Bucket
 * @returns {json{e<string>, json{createdBucket<Bucket>} if success}}
 */
exports.createBucket = async (req, res) => {

  const bucket = new Bucket(req.body);
  bucket.userId = req.userData.userId;

  bucket.validate(async (err) => {

    if (err) {
      return res.status(422).json(err);
    }
    
    try {
      const createdBucket = await bucket.save();
      
      res.status(201).json({
        ...createdBucket
      });
    } catch (e) {
      res.status(400).json(e);
    }
  });
};

/**
 * Method to fetch the bucket of the current logged in user
 * @returns {json{e<string>, json{bucket<Bucket>} if success}}
 */
exports.getBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findOne({ 'userId': req.userData.userId })
      .populate({
        path: 'products',
        populate: {
          path: 'product',
          model: 'Product',
          select: 'name price',
        }
      });

    res.status(200).json(bucket);
  } catch (e) {
    res.status(404).json(e);
  }
};

/**
 * Method to update the bucket passed in the req
 * @returns {json{e<string>, json{bucket<Bucket>} if success}}
 */
exports.updateBucket = async (req, res) => {

  const bucket = new Bucket(req.body);
  let total = 0;
  bucket.price = total;

  bucket.validate(async (err) => {

    if (err) {
      return res.status(422).json(err);
    }

    for (const product of bucket.products) {
      total = total + (product.product.price * product.volume);
    }
  
    bucket.price = (Math.round(total * 100) / 100).toFixed(2);

    try {
      const result = await Bucket.updateOne({ _id: bucket._id }, bucket);

      // Checking if the bucket has been modified
      if (result.n > 0) {
        return res.status(200).json(bucket);
      } else {
        return res.status(401).json({ e: 'Unknow error with the edition' });
      } 
    } catch (e) {
      res.status(400).json(e);
    }
  });
};

/**
 * Method to delete the bucket of the current user
 * @returns {json{e<string>, json{} if success}}
 */
exports.deleteBucket = async (req, res) => {
  try {
    const result = await Bucket.deleteMany({ 'userId': req.userData.userId });

    if (result.n > 0) {
      res.status(204).send();
    } else {
      res.status(401).json({ e: 'Unknow error with the edition' });
    } 
  } catch (e) {
    res.status(500).json(e);
  }
};

/**
 * Method to remove the deleted Product from buckets saving this product
 * @returns {json{e<string>, json{} if success}}
 */
exports.updateBucketAfterProductDeletion = async (req, res) => {
  
  let result;
  let buckets;

  try {
    buckets = await Bucket.find({ 'products.product._id': req.params.id });

    if (buckets.length === 0) {
      return res.status(204).send();
    }

    result = await Bucket.updateMany({
      'products.product._id': req.params.id,
    },
    { 
      $pull: { 
        'products': { 
          'product._id': [req.params.id],
        }, 
      },
    });

    if (result.n > 0) {
      return res.status(204).send();
    } else {
      return res.status(401).json({ e: "Unknow error with the edit" });
    } 
  } catch (e) {
    res.status(400).json(e);
  }
}