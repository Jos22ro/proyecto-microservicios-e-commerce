const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied',
      message: 'Token is required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      exp: decoded.exp
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please refresh your token' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or tampered' 
      });
    } else {
      return res.status(500).json({ 
        error: 'Authentication error',
        message: 'An error occurred during authentication' 
      });
    }
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      exp: decoded.exp
    };
  } catch (error) {
    req.user = null;
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};