const bcrypt = require('bcryptjs');
const User = require('../models/user');

/**
 * Method to create a new User
 * @returns {json{e<string>, next() if success}}
 */
exports.createUser = async (req, res, next) => {

  let user = new User(req.body);
  let result;

  user.validate(async (e) => {
    if (e) {
      return res.status(422).json({
        e: e,
      });
    }

    try {
      user.password = await hashPassword(req.body.password);
      result = await user.save();
  
      // Instantiates the const formatedUser from the new user data without his id and his password
      const { _id, password, ...formatedUser } = result._doc;
      req.body = formatedUser;
      // Call the method to log automaticly the user created
      next();
    } catch (e) {
      res.status(500).json({
        e: e
      });
    } 
  })

  
};

/**
 * Method to update a User
 * @returns {json{e<string>, json{user<User>} if success}}
 */
exports.updateUser = async (req, res) => {

  let user = new User(req.body);
  let result;

  user.validate(async (e) => {

    if (e) {
      return res.status(422).json({
        e: e,
      });
    }
  });

  try {
    result = await User.updateOne({ _id: user._id }, user);

    if (result.n > 0) return res.status(200).json(user);
    else return res.status(401).json({e: "Unknow error with the edit"});
  } catch (e) {
    res.status(400).json({
      e: e,
    });
  }
};

/**
 * Encrypt the password
 */
hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

/**
 * Method to create a new User
 * @returns {json{e<string>, json{formatedUser} if success}}
 */
exports.getUserFromJWT = async (req, res) => {

  let user;

  try {
    user = await User.findById(req.userData.userId);
    // Instantiates the const formatedUser from the new user data without his id and his password
    const { password, ...formatedUser } = user._doc;

    res.status(200).json(formatedUser);
  } catch (e) {
    return res.status(404).json({
      e: e,
    });
  }
};
