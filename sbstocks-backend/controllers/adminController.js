const User             = require("../models/User");
const Stock            = require("../models/Stock");
const Order            = require("../models/Order");
const Transaction      = require("../models/Transaction");
const Portfolio        = require("../models/Portfolio");
const { asyncHandler } = require("../middleware/asyncHandler");
const ErrorResponse    = require("../utils/ErrorResponse");

exports.getStats = asyncHandler(async (req, res) => {
  const [users, stocks, orders, vol] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Stock.countDocuments({ isActive: true }),
    Order.countDocuments({ status: "executed" }),
    Transaction.aggregate([{ $match: { type: { $in: ["buy","sell"] } } }, { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } }]),
  ]);
  res.json({ success: true, data: { totalUsers: users, totalStocks: stocks, totalOrders: orders, totalVolume: (vol[0] && vol[0].total && vol[0].total.toFixed(2)) || "0.00" } });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const q = { role: "user" };
  if (search) q.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(q);
  const data  = await User.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select("-password -refreshToken");
  res.json({ success: true, count: data.length, total, data });
});

exports.toggleUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)              return next(new ErrorResponse("User not found", 404));
  if (user.role === "admin") return next(new ErrorResponse("Cannot deactivate admin", 400));
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: "User " + (user.isActive ? "activated" : "deactivated"), data: { isActive: user.isActive } });
});

exports.resetBalance = asyncHandler(async (req, res, next) => {
  const startBal = parseFloat(process.env.STARTING_BALANCE) || 100000;
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse("User not found", 404));
  user.cashBalance = startBal;
  user.totalTrades = 0;
  user.profitableTrades = 0;
  user.badges = [];
  await user.save();
  await Portfolio.findOneAndUpdate({ user: req.params.id }, { holdings: [], totalInvested: 0, totalCurrentValue: 0, totalPnL: 0, totalPnLPercent: 0 });
  res.json({ success: true, message: "User reset to defaults" });
});
