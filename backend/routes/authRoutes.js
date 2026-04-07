const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');

// Register
router.get('/register', redirectIfLoggedIn, authController.getRegister);
router.post(
  '/register',
  redirectIfLoggedIn,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  authController.postRegister
);

// Login
router.get('/login', redirectIfLoggedIn, authController.getLogin);
router.post(
  '/login',
  redirectIfLoggedIn,
  [
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  authController.postLogin
);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
