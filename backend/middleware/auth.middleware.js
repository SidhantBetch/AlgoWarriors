const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
      const user = rows[0];
      
      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const recruiterOnly = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a recruiter' });
  }
};

const candidateOnly = (req, res, next) => {
  if (req.user && req.user.role === 'candidate') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a candidate' });
  }
};

module.exports = { protect, recruiterOnly, candidateOnly };
