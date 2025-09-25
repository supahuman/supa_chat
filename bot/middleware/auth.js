// Simple auth middleware for development
// In production, replace with real JWT/session validation

export const protect = (req, res, next) => {
  try {
    if (process.env.ALLOW_PUBLIC_BOT === 'true') {
      req.user = { id: 'public-user', role: 'admin' };
      return next();
    }

    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      // TODO: validate token and set real user
      req.user = { id: 'token-user', role: 'user' };
      return next();
    }

    return res.status(401).json({ success: false, error: 'Not authorized' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Auth error' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, error: 'Admin only' });
};


