const jwt = require('jsonwebtoken');
const User = require('../../models/user');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, "rS)Td:>08Z}E?>6_x(}sX|DpdJms/Wf6Aw#lI0$^gH`$p,*h#p:vjjfSq,pDd]h");
    req.userData = { email: decodedToken.email, userId: decodedToken.userId, admin: false };
    const user = await User.findById({ _id: decodedToken.userId });

    if (user.role === 0) {
      req.userData.admin = true;
      next();
    } else {
      return res.status(401).json({message: 'You are not admin or not authenticated'});
    }
  } catch (error) {
    return res.status(401).json({ message: 'You are not admin or not authenticated' });
  }
};