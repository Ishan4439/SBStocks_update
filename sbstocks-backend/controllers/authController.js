const User        = require("../models/User");
const Portfolio   = require("../models/Portfolio");
const Watchlist   = require("../models/Watchlist");
const jwt         = require("jsonwebtoken");
const { asyncHandler } = require("../middleware/asyncHandler");
const ErrorResponse    = require("../utils/ErrorResponse");

const sendTokens = (user, status, res) => {
  const accessToken  = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7*24*60*60*1000 });
  res.status(status).json({ success: true, accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, cashBalance: user.cashBalance, badges: user.badges, totalTrades: user.totalTrades } });
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return next(new ErrorResponse("Email already registered", 400));
  const user = await User.create({ name, email, password });
  await Portfolio.create({ user: user._id, holdings: [] });
  await Watchlist.create({ user: user._id, stocks: [] });
  sendTokens(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorResponse("Provide email and password", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) return next(new ErrorResponse("Invalid credentials", 401));
  if (!user.isActive) return next(new ErrorResponse("Account deactivated", 403));
  sendTokens(user, 200, res);
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return next(new ErrorResponse("No refresh token", 401));
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) return next(new ErrorResponse("User not found", 401));
    res.json({ success: true, accessToken: user.generateAccessToken() });
  } catch (_) {
    return next(new ErrorResponse("Invalid refresh token", 401));
  }
});

exports.logout = asyncHandler(async (req, res) => {
  res.cookie("refreshToken", "", { maxAge: 0, httpOnly: true });
  res.json({ success: true, message: "Logged out" });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role, cashBalance: user.cashBalance, badges: user.badges, totalTrades: user.totalTrades, createdAt: user.createdAt } });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return next(new ErrorResponse("Provide current and new password", 400));
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(currentPassword))) return next(new ErrorResponse("Current password incorrect", 400));
  user.password = newPassword;
  await user.save();
  sendTokens(user, 200, res);
});
