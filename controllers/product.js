const Product = require('../models/product');
const AWS = require('aws-sdk');
const { S3 } = require('aws-sdk');
const bucketName = 'YOUR_BUCKET_NAME';

/**
 * Method to fetch every products
 * @returns {json{e<string>, json{products<Product[]>} if success}}
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (e) {
    res.status(404).json(e);
  }
};

/**
 * Method to fetch a specific product
 * @returns {json{e<string>, json{product<Product>} if success}}
 */
exports.getOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (e) {
    res.status(404).json(e);
  }
};

/**
 * Method to create a new Product
 * @returns {json{e<string>, json{} if success}}
 */
exports.addProduct = async (req, res) => {

  if (!req.body.files || !req.body.name || !req.body.description || !req.body.price) {
    return res.status(422).send();
  }

  const files = req.body.files;
  const formatedFiles = [];
  const responses = [];

  // Define the differents types of files we accept
  const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
  };

  // Define witch S3 bucket we are going to upload on
  const url = 'http://' + bucketName + '.s3.eu-west-3.amazonaws.com/';

  AWS.config.loadFromPath('./aws-config.json');

  // Instantiates the S3 bucket connexion
  const s3 = new AWS.S3();

  // Loop through every files to check if their are well passed in base64 
  for (const file of files) {
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
    
    response = {
      type: matches[1],
      data: new Buffer(matches[2], 'base64')
    }
  
    responses.push(response);
  }


  /** 
   * Loop through the validated files to check their type
   * Define a new fileName for those and push them on the S3 bucket
   * Define the URL where we can find retrive them and a new alt for those
   */
  let index = 0;
  for (const response of responses) {
    const name = req.body.name.split(' ').join('-') + '-' + index;
    const ext = MIME_TYPE_MAP[response.type];
    const fileName = name + '-' + Date.now() + '.' + ext;

    const params = {
      'Bucket': bucketName,
      'Key': fileName,
      'Body': response.data,
    };

    try {
      await s3.putObject(params).promise();
    } catch (e) {
      return res.status(500).send();
    }
    
    imageUri = url + fileName;
    imageAlt = "image du produit : " + req.body.name;

    const image = { uri: imageUri, alt: imageAlt };
    formatedFiles.push(image);
    
    index++;
  }

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    images: formatedFiles,
  });

  product.validate(async (err) => {

    if (err) {
      return res.status(422).json(err);
    } 
    
    try {
      await product.save();
      res.status(201).send();
    } catch (e) {
      res.status(400).json(e);
    }
  })
};

/**
 * Method to update a specific Product
 * @returns {json{e<string>, json{} if success}}
 */
exports.updateProduct = async (req, res) => {

  if (!req.body.filesToKeep || !req.body.filesToUpload || !req.body.name || !req.body.description || !req.body.price) {
    return res.status(422).send();
  }

  const formatedFiles = req.body.filesToKeep;
  const filesToUpload = req.body.filesToUpload;
  const responses = [];
  let product = new Product();
  let result;
  
  // Define witch S3 bucket we are going to upload on
  const url = 'http://' + bucketName + '.s3.eu-west-3.amazonaws.com/';

  // Define the differents types of files we accept
  const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
  };

  AWS.config.loadFromPath('./aws-config.json');

  // Instantiates the S3 bucket connexion
  let s3 = new AWS.S3();

  // Loop through every files to check if their are well passed in base64
  for (const file of filesToUpload) {
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches.length !== 3) {
      return res.status(422).send();
    }

    response = {
      type: matches[1],
      data: new Buffer(matches[2], 'base64')
    }

    responses.push(response);
  }

  /** 
   * Loop through the validated files to check their type
   * Define a new fileName for those and push them on the S3 bucket
   * Define the URL where we can find retrive them and a new alt for those
   */
  let index = 0;
  for (const response of responses) {
    const isValid = MIME_TYPE_MAP[responses.type];

    let error = new Error('Invalid mime type');

    if (isValid) {
      error = null;
    }

    const name = req.body.name.split(' ').join('-') + '-' + indexForResponses;
    const ext = MIME_TYPE_MAP[response.type];
    const fileName = name + '-' + Date.now() + '.' + ext;

    const params = {
      'Bucket': bucketName,
      'Key': fileName,
      'Body': response.data
    }

    try {
      await s3.putObject(params).promise();
    } catch (e) {
      return res.status(500).send();
    }

    imageUri = url + fileName;
    imageAlt = "image du produit : " + req.body.name;

    const image = { uri: imageUri, alt: imageAlt };
    formatedFiles.push(image);

    index++;
  }

  try {
    product = await Product.findById({ _id: req.body._id });
  } catch (e) {
    return res.status(404).json(e);
  }

  const params = {
    Bucket: bucketName,
    Delete: {
      Objects: []
    },
  };

  for (const imageOfProduct of product.images) {
    if (!formatedFiles.some(formatedFile => formatedFile.uri === imageOfProduct.uri)) {
      const imageName = {
        Key: imageOfProduct.uri.split(url).join(''),
      };
      params.Delete.Objects.push(imageName);
    }
  }

  try {
    await s3.deleteObject(params).promise();
  } catch (e) {
    return res.status(500).send();
  }

  product = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    images: formatedFiles,
  };
  
  product.validate(async (err) => {
    
    if (err) {
      return res.status(422).json(err);
    }
  
    try {
      result = await Product.updateOne({ _id: req.body._id }, product);
  
      if (result.n > 0) {
        return res.status(204).send();
      } else {
        return res.status(401).json(e);
      } 
    } catch (e) {
      res.status(400).json(e);
    }
  });
}

/**
 * Method to delete a specific Product
 * @returns {json{e<string>, json{} if success}}
 */
exports.deleteProduct = async (req, res, next) => {

  AWS.config.loadFromPath('./aws-config.json');

  // Define witch S3 bucket we are going to upload on
  const url = 'http://' + bucketName + '.s3.eu-west-3.amazonaws.com/';
  
  let s3 = new AWS.S3();
  
  const params = {
    Bucket: bucketName,
    Delete: {
      Objects: []
    }
  };

  try {
    const product = await getProduct(req.params.id);

    // Loop through every images to delete and delete them from the S3 bucket
    for (let image of product.images) {
      const imageName = {
        Key: image.uri.split(url).join(''),
      };
      params.Delete.Objects.push(imageName);
    }
  } catch (e) {
    return res.status(404).json(e);
  }
  
  try {
    await s3.deleteObjects(params).promise();
  } catch (e) {
    return res.status(500).send();
  }

  try {
    const result = await Product.deleteOne({ _id: req.params.id });
    if (result.n > 0) {
      next() 
    } else {
      res.status(401).json(e);
    } 
  } catch (e) {
    res.status(400).json(e);
  }
};

/**
 * Method to fetch a specific Product
 * @returns {json{e<string>, json{} if success}}
 */
getProduct = async (productId) => {
  try {
    return await Product.findById({ _id: productId });
  } catch (e) {
    return res.status(404).json(e);
  }
};
