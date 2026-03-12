const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user        : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type        : { type: String, enum: ["buy","sell","deposit","withdrawal"], required: true },
  symbol      : { type: String, uppercase: true, default: null },
  quantity    : { type: Number, default: null },
  price       : { type: Number, default: null },
  amount      : { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  orderType   : { type: String, enum: ["market","limit","stoploss","wallet"], default: "market" },
  order       : { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  notes       : { type: String, default: "" },
  pnl         : { type: Number, default: null },
  pnlPercent  : { type: Number, default: null },
}, { timestamps: true });

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
