const User             = require("../models/User");
const Transaction      = require("../models/Transaction");
const { asyncHandler } = require("../middleware/asyncHandler");
const ErrorResponse    = require("../utils/ErrorResponse");

exports.getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: { cashBalance: user.cashBalance } });
});

exports.addFunds = asyncHandler(async (req, res, next) => {
  const amt = parseFloat(req.body.amount);
  if (!amt || amt <= 0)  return next(new ErrorResponse("Amount must be positive", 400));
  if (amt > 1000000)     return next(new ErrorResponse("Max add $1,000,000 at once", 400));
  const user = await User.findById(req.user.id);
  user.cashBalance = parseFloat((user.cashBalance + amt).toFixed(2));
  await user.save();
  await Transaction.create({ user: user._id, type: "deposit", amount: amt, balanceAfter: user.cashBalance, orderType: "wallet", notes: "Virtual funds added" });
  res.json({ success: true, message: "$" + amt.toLocaleString() + " added to wallet", data: { cashBalance: user.cashBalance } });
});

exports.withdraw = asyncHandler(async (req, res, next) => {
  const amt = parseFloat(req.body.amount);
  if (!amt || amt <= 0) return next(new ErrorResponse("Amount must be positive", 400));
  const user = await User.findById(req.user.id);
  if (user.cashBalance < amt) return next(new ErrorResponse("Insufficient balance: $" + user.cashBalance.toFixed(2), 400));
  user.cashBalance = parseFloat((user.cashBalance - amt).toFixed(2));
  await user.save();
  await Transaction.create({ user: user._id, type: "withdrawal", amount: -amt, balanceAfter: user.cashBalance, orderType: "wallet", notes: "Virtual funds withdrawn" });
  res.json({ success: true, message: "$" + amt.toLocaleString() + " withdrawn", data: { cashBalance: user.cashBalance } });
});

exports.getLedger = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const q    = { user: req.user.id, type: { $in: ["deposit","withdrawal"] } };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Transaction.countDocuments(q);
  const data  = await Transaction.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  res.json({ success: true, count: data.length, total, data });
});
