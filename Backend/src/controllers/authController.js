const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ... existing
exports.signup = async (req, res) => {
  const { name, surname, email, password, role, location } = req.body;
  const profilePhoto = req.file ? req.file.path : undefined;

  if (!name || !surname || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = new User({
      name, surname, email, password, role, location, profilePhoto,
      isProfileComplete: !!profilePhoto // True only if photo uploaded, else false
    });
    await user.save();
    const token = generateToken(user._id, user.role);
    // Set secure cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
    res.status(201).json({ token, user: { ...user.toJSON(), password: undefined } });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'This email already has an account' });
    }
    res.status(400).json({ error: err.message });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken(user._id, user.role);
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  res.json({ token, user: { ...user.toJSON(), password: undefined } });
};