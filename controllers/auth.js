const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

/**
 * Async method to connect a User
 * First check that the user exist
 * Uncrypt and compare the password
 * Create a new token with user data, the JWT key, and the delay before his connexion expires
 *
 * @returns {json{e<string> || e<string>, token, expiresIn<number>, userId<string>}}
 */
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });

    if (!user) {
      return res.status(404).json({
        message: 'Auth failed'
      });
    }

    // Compare the password send by the req and the uncrypted password store in the DB for the user
    const result = await bcrypt.compare(req.body.password, user.password);

    if (!result) {
      return res.status(403).json({
        message: 'Auth failed'
      });
    }

    // Instantiates the const formatedUser from the new user data without his id and his password
    const {password, ...formatedUser} = user._doc;
    
    const token = jwtSign({ email: formatedUser.email, userId: formatedUser._id });

    res.status(200).json({
      token: token,
      expiresIn: 3600,
      user: formatedUser
    });
  } catch (e) {
    return res.status(422).json({
      e: e,
    });
  }
};

/**
 * Async method to connect a User
 * First check that the user exist
 * Create a new token with user data, the JWT key, and the delay before his connexion expires
 *
 * @returns {json{e<string> || e<string>, token, expiresIn<number>, userId<string>}}
 */
exports.autoLogin = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });

    if (!user) {
      return res.status(404).json({
        e: e,
      });
    }

    // Instantiates the const formatedUser from the new user data without his password
    const { password, ...formatedUser } = user._doc;

    const token = jwtSign({ email: formatedUser.email, userId: formatedUser._id });

    res.status(200).json({
      token: token,
      expiresIn: 3600,
      user: formatedUser
    });
  } catch (e) {
    return res.status(422).json({
      e: e,
    });
  }
};

/**
 * Create a new token of connexion for the identified user
 */
jwtSign = ({ email, userId }) => {
  return jwt.sign(
    { email: email, userId: userId },
    "rS)Td:>08Z}E?>6_x(}sX|DpdJms/Wf6Aw#lI0$^gH`$p,*h#p:vjjfSq,pDd]h",
    { expiresIn: '1h' },
  );
};

