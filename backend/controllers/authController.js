const User = require('../models/User');
const { validationResult } = require('express-validator');

// GET /auth/register
exports.getRegister = (req, res) => {
  res.render('pages/auth/register', { title: 'Register' });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/register');
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/auth/register');
    }

    const user = await User.create({ name, email, password });

    // Auto-login after registration
    req.session.userId = user._id;
    req.flash('success', `Welcome, ${user.name}! Your account has been created.`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/register');
  }
};

// GET /auth/login
exports.getLogin = (req, res) => {
  res.render('pages/auth/login', { title: 'Login' });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/login');
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    req.session.userId = user._id;
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/login');
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
