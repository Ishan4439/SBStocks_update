const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user         : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stock        : { type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true },
  symbol       : { type: String, required: true, uppercase: true },
  orderType    : { type: String, enum: ["market","limit","stoploss"], required: true },
  side         : { type: String, enum: ["buy","sell"], required: true },
  quantity     : { type: Number, required: true, min: 1 },
  limitPrice   : { type: Number, default: null },
  stopPrice    : { type: Number, default: null },
  executedPrice: { type: Number, default: null },
  totalAmount  : { type: Number, default: 0 },
  status       : { type: String, enum: ["pending","executed","cancelled","rejected"], default: "pending" },
  executedAt   : { type: Date, default: null },
  cancelledAt  : { type: Date, default: null },
  notes        : { type: String, default: "" },
}, { timestamps: true });

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ symbol: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);
