const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema({
  price     : { type: Number, required: true },
  timestamp : { type: Date, default: Date.now },
}, { _id: false });

const stockSchema = new mongoose.Schema({
  symbol        : { type: String, required: true, unique: true, uppercase: true, trim: true },
  name          : { type: String, required: true, trim: true },
  sector        : { type: String, default: "Other", enum: ["Tech","Auto","Finance","Energy","Healthcare","Retail","Other"] },
  currentPrice  : { type: Number, required: true, min: 0.01 },
  previousClose : { type: Number, required: true },
  openPrice     : { type: Number, required: true },
  dayHigh       : { type: Number, default: 0 },
  dayLow        : { type: Number, default: 0 },
  change        : { type: Number, default: 0 },
  changePercent : { type: Number, default: 0 },
  volume        : { type: Number, default: 0 },
  marketCap     : { type: String, default: "—" },
  priceHistory  : [priceHistorySchema],
  isActive      : { type: Boolean, default: true },
  lastUpdated   : { type: Date, default: Date.now },
}, { timestamps: true });

stockSchema.index({ symbol: 1 });
stockSchema.index({ sector: 1 });
stockSchema.index({ changePercent: -1 });

module.exports = mongoose.model("Stock", stockSchema);
