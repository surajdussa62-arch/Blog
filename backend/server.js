const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

dotenv.config();

const connectDB = require('./config/database');

const { setCurrentUser } = require('./middleware/auth');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
// Render uses 10000; local uses 5000. This handles both.
const PORT = process.env.PORT || 10000; 

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session & flash
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
  })
);
app.use(flash());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Set currentUser & flash messages for all views
app.use(setCurrentUser);
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', postRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { title: '404 Not Found', message: 'The page you are looking for does not exist.' });
});

// 500 handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: '500 Server Error', message: 'Something went wrong on our end.' });
});

// --- THE FIX: ASYNC STARTUP ---
const start = async () => {
  try {
    // 1. Wait for database connection first
    await connectDB();
    
    // 2. Only start the server if step 1 succeeds
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Database Connected & Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Critical Error: Could not start server", error);
    process.exit(1); // Tell Render the deploy failed
  }
};

start();