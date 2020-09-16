const Command = require('../models/command');
const Bucket = require('../models/bucket');
const User = require('../models/user');

/**
 * Method to create a new Command
 * @returns {json{e<string>, json{createdCommand<Command>} if success}}
 */
exports.createCommand = async (req, res) => {

  const command = new Command();

  if (!req.body.billingAddress || !req.body.shippingAddress) {
    return res.status(422).send();
  }

  command.clientInformation.billingAddress = req.body.billingAddressId;
  command.clientInformation.shippingAddress = req.body.shippingAddressId;
  command.clientInformation.user = req.userData.userId;

  try {
    // retrive the bucket for the current user
    const bucket = await Bucket.findById(req.body.bucketId)
    .populate({
      path: 'products',
      populate: {
        path: 'product',
        model: 'Product',
        select: 'name price',
      }
    });
    
    // Loop through the bucket products
    for (let i = 0; i < bucket.products.length; i++) {
      command.bucketInformation.products[i] = {
        productId: null,
        name: null,
        price: null,
        volume: null
      };

      // Push those products data into the command bucketInformation
      command.bucketInformation.products[i].productId = bucket.products[i].product._id;
      command.bucketInformation.products[i].name = bucket.products[i].product.name;
      command.bucketInformation.products[i].price = bucket.products[i].product.price;
      command.bucketInformation.products[i].volume = bucket.products[i].volume;
    }

    command.bucketInformation.price = bucket.price;
    const createdCommand = await command.save();
    res.status(201).json(createdCommand);
  } catch (e) {
    res.status(400).json(e);
  }
};

/**
 * Method to fetch every command for a given User or for all User if thecurrent logged in user is admin
 * @returns {json{e<string>, json{commands<Command[]>} if success}}
 */
exports.getCommands = async (req, res) => {

  let commands;
  let user;
  let users;

  try {
    // Get the current logged in user data and check about his role
    user = await User.findById({ _id: req.userData.userId });
    
    if (user.role === 0) {
      users = await User.find();
      commands = await Command.find().lean()
      .populate({
        path: 'clientInformation',
        populate: {
          path: 'user',
          model: 'User',
          select: 'firstname lastname',
        }
      });

      // Loop through every commands and users to push the correct data about the billing address and the shipping address
      for (const command of commands) {
        for (const user of users) {
          for (const billingAddress of user.billingAddress) {
            if (billingAddress._id.toString() === command.clientInformation.billingAddress.toString()) {
              command.clientInformation.billingAddress = {
                name: billingAddress.name,
                address: billingAddress.address,
                city: billingAddress.city,
                postCode: billingAddress.postCode,
              };
            }
          }
          
          for (const shippingAddress of user.shippingAddress) {
            if (shippingAddress._id.toString() === command.clientInformation.shippingAddress.toString()) {
              command.clientInformation.shippingAddress = {
                name: shippingAddress.name,
                address: shippingAddress.address,
                city: shippingAddress.city,
                postCode: shippingAddress.postCode,
              };
            }
          }
        }
      }
    } else {
      commands = await Command.find({ 'clientInformation.user': req.userData.userId }).lean()
      .populate({
        path: 'clientInformation',
        populate: {
          path: 'user',
          model: 'User',
          select: 'firstname lastname',
        }
      });

      // Loop through every commands to push the data about the billing address and the shipping address
      for (const command of commands) {
        for (const billingAddress of user.billingAddress) {
          if (billingAddress._id.toString() === command.clientInformation.billingAddress.toString()) {
            command.clientInformation.billingAddress = {
              name: billingAddress.name,
              address: billingAddress.address,
              city: billingAddress.city,
              postCode: billingAddress.postCode,
            };
          }
        }
  
        for (const shippingAddress of user.shippingAddress) {
          if (shippingAddress._id.toString() === command.clientInformation.shippingAddress.toString()) {
            command.clientInformation.shippingAddress = {
              name: shippingAddress.name,
              address: shippingAddress.address,
              city: shippingAddress.city,
              postCode: shippingAddress.postCode,
            };
          }
        }
      }
    }

    res.status(200).json(commands);
  } catch (e) {
    res.status(404).json(e);
  }
};

/**
 * Method to fetch a specific Command
 * @returns {json{e<string>, json{command<Command>} if success}}
 */
exports.getCommand = async (req, res) => {
  try {
    const command = await Command.findById(req.body.commandId)
    .populate({
      path: 'clientInformation',
      populate: {
        path: 'user',
        model: 'User',
        select: 'firstname lastname',
      }
    });

    // Loop through every billing addresses to push the data about the shipping address for this command
    for (const billingAddress of user.billingAddress) {
      if (billingAddress._id.toString() === command.clientInformation.billingAddress.toString()) {
        command.clientInformation.billingAddress = {
          name: billingAddress.name,
          address: billingAddress.address,
          city: billingAddress.city,
          postCode: billingAddress.postCode,
        };
      }
    }

    // Loop through every shipping addresses to push the data about the shipping address for this command
    for (const shippingAddress of user.shippingAddress) {
      if (shippingAddress._id.toString() === command.clientInformation.shippingAddress.toString()) {
        command.clientInformation.shippingAddress = {
          name: shippingAddress.name,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postCode: shippingAddress.postCode,
        };
      }
    }

    res.status(200).json(command);
  } catch (e) {
    res.status(404).json(e);
  }
};