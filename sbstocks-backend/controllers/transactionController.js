const mongoose         = require("mongoose");
const Transaction      = require("../models/Transaction");
const { asyncHandler } = require("../middleware/asyncHandler");

exports.getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, symbol } = req.query;
  const q = { user: req.user.id };
  if (type)   q.type   = type;
  if (symbol) q.symbol = String(symbol).toUpperCase();
  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Transaction.countDocuments(q);
  const data  = await Transaction.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate("order","orderType status");
  res.json({ success: true, count: data.length, total, data });
});

exports.getTransactionStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const stats  = await Transaction.aggregate([
    { $match: { user: userId, type: { $in: ["buy","sell"] } } },
    { $group: { _id: null, totalBuys: { $sum: { $cond: [{ $eq: ["$type","buy"] },1,0] } }, totalSells: { $sum: { $cond: [{ $eq: ["$type","sell"] },1,0] } }, totalVolume: { $sum: { $abs: "$amount" } }, totalPnL: { $sum: { $ifNull: ["$pnl",0] } } } },
  ]);
  res.json({ success: true, data: stats[0] || { totalBuys:0, totalSells:0, totalVolume:0, totalPnL:0 } });
});
