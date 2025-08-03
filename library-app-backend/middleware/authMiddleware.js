const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';

// Middleware to verify JWT and attach user info
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded contains { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { verifyToken, isAdmin };
