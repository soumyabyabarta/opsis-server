import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate anonymous JWT sessions.
 * Attaches decoded session payload to req.session.
 */
export const authenticateSession = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No session token provided. Please start a new session.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.session = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please start a new session.'
    });
  }
};

/**
 * Optional auth — attaches session if present, continues regardless
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.session = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
      req.session = null;
    }
  }

  next();
};
