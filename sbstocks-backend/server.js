require("dotenv").config();
const http       = require("http");
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit  = require("express-rate-limit");

const errorHandler   = require("./middleware/errorHandler");
const { initSocket } = require("./socket/socketHandler");

// Route imports
const authRoutes        = require("./routes/auth");
const stockRoutes       = require("./routes/stocks");
const orderRoutes       = require("./routes/orders");
const portfolioRoutes   = require("./routes/portfolio");
const walletRoutes      = require("./routes/wallet");
const transactionRoutes = require("./routes/transactions");
const watchlistRoutes   = require("./routes/watchlist");
const leaderboardRoutes = require("./routes/leaderboard");
const newsRoutes        = require("./routes/news");
const adminRoutes       = require("./routes/admin");

const app = express();
const server = http.createServer(app);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sbstocks")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => { console.error("❌ MongoDB error:", err.message); process.exit(1); });

// Security & middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
}));
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(mongoSanitize());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Rate limiting
app.use("/api/auth", rateLimit({ windowMs: 15*60*1000, max: 20, message: { success:false, message:"Too many requests" } }));
app.use("/api", rateLimit({ windowMs: 1*60*1000, max: 200 }));

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// API routes
app.use("/api/auth",         authRoutes);
app.use("/api/stocks",       stockRoutes);
app.use("/api/orders",       orderRoutes);
app.use("/api/portfolio",    portfolioRoutes);
app.use("/api/wallet",       walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/watchlist",    watchlistRoutes);
app.use("/api/leaderboard",  leaderboardRoutes);
app.use("/api/news",         newsRoutes);
app.use("/api/admin",        adminRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Error handler
app.use(errorHandler);

// Init socket
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SB Stocks backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = { app, server };
