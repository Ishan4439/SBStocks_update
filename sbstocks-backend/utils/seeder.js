require("dotenv").config();
const mongoose  = require("mongoose");
const Stock     = require("../models/Stock");
const User      = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Watchlist = require("../models/Watchlist");

const STOCKS = [
  { symbol:"AAPL",  name:"Apple Inc.",           sector:"Tech",       currentPrice:189.84, previousClose:188.60, marketCap:"2.94T" },
  { symbol:"MSFT",  name:"Microsoft Corp.",       sector:"Tech",       currentPrice:378.91, previousClose:375.79, marketCap:"2.81T" },
  { symbol:"GOOGL", name:"Alphabet Inc.",          sector:"Tech",       currentPrice:142.56, previousClose:141.69, marketCap:"1.78T" },
  { symbol:"NVDA",  name:"NVIDIA Corp.",           sector:"Tech",       currentPrice:875.40, previousClose:856.80, marketCap:"2.16T" },
  { symbol:"AMZN",  name:"Amazon.com Inc.",        sector:"Tech",       currentPrice:185.73, previousClose:187.87, marketCap:"1.92T" },
  { symbol:"META",  name:"Meta Platforms Inc.",    sector:"Tech",       currentPrice:486.50, previousClose:480.30, marketCap:"1.24T" },
  { symbol:"TSLA",  name:"Tesla Inc.",             sector:"Auto",       currentPrice:248.42, previousClose:253.73, marketCap:"789B"  },
  { symbol:"JPM",   name:"JPMorgan Chase & Co.",   sector:"Finance",    currentPrice:198.30, previousClose:198.75, marketCap:"572B"  },
  { symbol:"BAC",   name:"Bank of America Corp.",  sector:"Finance",    currentPrice:38.52,  previousClose:38.10,  marketCap:"303B"  },
  { symbol:"XOM",   name:"Exxon Mobil Corp.",      sector:"Energy",     currentPrice:112.87, previousClose:111.20, marketCap:"451B"  },
  { symbol:"JNJ",   name:"Johnson & Johnson",      sector:"Healthcare", currentPrice:158.40, previousClose:157.90, marketCap:"382B"  },
  { symbol:"WMT",   name:"Walmart Inc.",           sector:"Retail",     currentPrice:167.23, previousClose:165.80, marketCap:"450B"  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Promise.all([Stock.deleteMany({}), User.deleteMany({}), Portfolio.deleteMany({}), Watchlist.deleteMany({})]);
    console.log("🗑  Cleared existing data");

    const stockDocs = STOCKS.map(s => ({
      ...s,
      change       : parseFloat((s.currentPrice - s.previousClose).toFixed(2)),
      changePercent: parseFloat(((s.currentPrice - s.previousClose) / s.previousClose * 100).toFixed(2)),
      openPrice    : s.previousClose,
      dayHigh      : parseFloat((s.currentPrice * 1.01).toFixed(2)),
      dayLow       : parseFloat((s.currentPrice * 0.99).toFixed(2)),
      priceHistory : Array.from({ length: 10 }, (_, i) => ({
        price: parseFloat((s.currentPrice * (0.97 + Math.random() * 0.06)).toFixed(2)),
        timestamp: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
      })),
      isActive: true,
    }));
    await Stock.insertMany(stockDocs);
    console.log("📈 Seeded " + stockDocs.length + " stocks");

    const startBal = parseFloat(process.env.STARTING_BALANCE) || 100000;

    await User.create({ name: "SB Admin", email: "admin@sbstocks.com", password: "Admin@123", role: "admin", cashBalance: 999999999 });
    console.log("👑 Admin:  admin@sbstocks.com / Admin@123");

    const demo = await User.create({ name: "Demo Trader", email: "demo@sbstocks.com", password: "Demo@123", role: "user", cashBalance: startBal });
    await Portfolio.create({ user: demo._id, holdings: [] });
    await Watchlist.create({ user: demo._id, stocks: [] });
    console.log("👤 Demo:   demo@sbstocks.com  / Demo@123");

    console.log("\n✅ Database seeded successfully!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder error:", err.message);
    process.exit(1);
  }
}

seed();
