const mongoose = require("mongoose");

const watchlistItemSchema = new mongoose.Schema({
  stock      : { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  symbol     : { type: String, required: true, uppercase: true },
  alertPrice : { type: Number, default: null },
  addedAt    : { type: Date, default: Date.now },
}, { _id: false });

const watchlistSchema = new mongoose.Schema({
  user   : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  stocks : [watchlistItemSchema],
}, { timestamps: true });

module.exports = mongoose.model("Watchlist", watchlistSchema);
