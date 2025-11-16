// --- Load Environment Variables First ---
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application.routes');
const profileRoutes = require('./routes/profile');

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- Database ---
connectDB();

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // For form data
// Sanitize data against NoSQL injection attacks
app.use(mongoSanitize());

// Session setup (required for passport.session())
app.use(session({
  name: 'utopiahire.sid',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.get('/', (req, res) => {
  res.send('UtopiaHire API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/v1/applications', applicationRoutes);

// --- Google OAuth Routes ---
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }), // Generate JWT, no session
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// --- Error Handler (Last) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});