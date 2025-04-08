const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  // In a real implementation, you would verify the token with a secret key
  // For now, we'll just check if it exists and has a valid format
  try {
    // This is a placeholder for actual JWT verification
    // In production, you would use: jwt.verify(token, process.env.JWT_SECRET)
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = {
  authenticateToken
};
