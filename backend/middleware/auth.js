// middleware/auth.js — JWT verification for protected routes
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Expect: Authorization: Bearer <token>
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Role guard — pass allowed roles array e.g. roleGuard(["manager","dispatcher"])
const roleGuard = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user?.role)) {
    return res.status(403).json({ error: "Access denied for your role" });
  }
  next();
};

module.exports = { auth, roleGuard };
