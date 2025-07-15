const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SECRET_KEY;

const protect = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Invalid token error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};



const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

module.exports = { protect, isAdmin };