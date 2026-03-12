const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name     : { type: String, required: true, trim: true, maxlength: 50 },
  email    : { type: String, required: true, unique: true, lowercase: true, trim: true },
  password : { type: String, required: true, minlength: 6, select: false },
  role     : { type: String, enum: ["user","admin"], default: "user" },
  cashBalance      : { type: Number, default: 100000 },
  refreshToken     : { type: String, select: false },
  badges           : [{ type: String }],
  totalTrades      : { type: Number, default: 0 },
  profitableTrades : { type: Number, default: 0 },
  isActive         : { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.generateAccessToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "15m" });
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" });
};

module.exports = mongoose.model("User", userSchema);
