const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const { asyncHandler } = require("./asyncHandler");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) token = auth.split(" ")[1];
  if (!token) return next(new ErrorResponse("Not authorised", 401));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return next(new ErrorResponse("User not found", 401));
    if (!req.user.isActive) return next(new ErrorResponse("Account deactivated", 403));
    next();
  } catch (_) {
    return next(new ErrorResponse("Invalid token", 401));
  }
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new ErrorResponse("Forbidden", 403));
  next();
};
