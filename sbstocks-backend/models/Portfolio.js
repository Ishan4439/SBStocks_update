const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
  stock          : { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  symbol         : { type: String, required: true, uppercase: true },
  quantity       : { type: Number, required: true, min: 0 },
  averagePrice   : { type: Number, required: true },
  investedAmount : { type: Number, required: true },
}, { _id: false });

const snapshotSchema = new mongoose.Schema({
  date        : { type: Date, default: Date.now },
  totalValue  : { type: Number, required: true },
  cashBalance : { type: Number, required: true },
  investedAmt : { type: Number, default: 0 },
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  user              : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  holdings          : [holdingSchema],
  totalInvested     : { type: Number, default: 0 },
  totalCurrentValue : { type: Number, default: 0 },
  totalPnL          : { type: Number, default: 0 },
  totalPnLPercent   : { type: Number, default: 0 },
  snapshots         : [snapshotSchema],
}, { timestamps: true });

portfolioSchema.methods.recalculate = function(priceMap) {
  let invested = 0, currentVal = 0;
  this.holdings.forEach(h => {
    const livePrice = priceMap[h.symbol] || h.averagePrice;
    invested   += h.investedAmount;
    currentVal += livePrice * h.quantity;
  });
  this.totalInvested     = parseFloat(invested.toFixed(2));
  this.totalCurrentValue = parseFloat(currentVal.toFixed(2));
  this.totalPnL          = parseFloat((currentVal - invested).toFixed(2));
  this.totalPnLPercent   = invested > 0 ? parseFloat(((currentVal - invested) / invested * 100).toFixed(2)) : 0;
};

portfolioSchema.index({ user: 1 });

module.exports = mongoose.model("Portfolio", portfolioSchema);
