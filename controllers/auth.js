const { validationResult } = require('express-validator/check');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const {
    email,
    name,
    password
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });
    const result = await user.save()

    res.status(201).json({ message: 'User created!', userId: result._id });
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email })

    if (!user) {
      const error = new Error('User with this email was not found.');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
      
    if (!isEqual) {
      const error = new Error('Wrong password.');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      'somesupersecretsecretkey',
      { expiresIn: '1h' }
    );
    res.status(200).json({ token: token, userId: user._id.toString(), email: user.email });

  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getStatus = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({
      message: 'Fetched status successfully.',
      status: user.status
    })
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.postStatus = async (req, res, next) => {
  const { status } = req.body;
  const userId = req.userId;
  try {
    const user = await User.findById(userId)

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = status;

    await user.save();

    await res.status(200).json({ message: 'User updated'});
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}