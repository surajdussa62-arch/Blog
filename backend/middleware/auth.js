/**
 * Auth Middleware
 * Protects routes that require a logged-in user.
 */

// Ensure user is authenticated
const protect = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/auth/login');
};

// Redirect logged-in users away from auth pages
const redirectIfLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

// Attach current user to res.locals so all views can access it
const setCurrentUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.session.userId);
      res.locals.currentUser = user;
    } catch {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  // Pass flash messages to views
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
};

module.exports = { protect, redirectIfLoggedIn, setCurrentUser };
