# 🚀 SB Stocks — Paper Trading Platform

A full-stack MERN paper trading application with real-time price simulation, portfolio management, and comprehensive trading features.

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd sbstocks-backend
npm install
# Edit .env with your MongoDB URI (defaults to localhost:27017/sbstocks)
npm run seed       # Seed DB with stocks + demo user
npm run dev        # Start backend on port 5000
```

### 2. Frontend Setup
```bash
cd sbstocks-frontend
npm install
npm run dev        # Start frontend on port 3000
```

### 3. Open
Visit: http://localhost:3000

### Demo Credentials
- **Demo user**: demo@sbstocks.com / Demo@123
- **Admin**: admin@sbstocks.com / Admin@123

---

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
sbstocks-backend/
├── server.js              ✅ Main entry point
├── .env                   ✅ Environment config
├── controllers/           ✅ Business logic
│   ├── authController.js      Auth: register, login, JWT
│   ├── stockController.js     Stock CRUD + live prices
│   ├── orderController.js     Market/Limit/Stop-Loss orders
│   ├── portfolioController.js Holdings + P&L + snapshots
│   ├── walletController.js    Cash management + ledger
│   ├── transactionController.js History + stats
│   ├── watchlistController.js  User watchlists
│   ├── leaderboardController.js Rankings
│   ├── newsController.js      Market news (NewsAPI or mock)
│   └── adminController.js     Admin dashboard
├── models/
│   ├── User.js           ✅ User with JWT methods
│   ├── Stock.js          ✅ Stock with price history
│   ├── Portfolio.js      ✅ Holdings + snapshots + P&L
│   ├── Order.js          ✅ Orders with status tracking
│   ├── Transaction.js    ✅ Full transaction ledger
│   └── Watchlist.js      ✅ Per-user watchlist
├── middleware/
│   ├── auth.js           ✅ JWT protect + authorize
│   ├── asyncHandler.js   ✅ Async error wrapper
│   ├── validators.js     ✅ Input validation rules
│   └── errorHandler.js   ✅ Global error handler
├── services/
│   ├── stockService.js        Price simulation engine
│   ├── tradeExecutor.js       Atomic trade execution
│   └── orderExecutionService.js Pending order checker
├── socket/
│   └── socketHandler.js  ✅ Socket.io + price broadcasts
├── routes/               ✅ All API routes
└── utils/
    ├── seeder.js         ✅ DB seeder with 12 stocks
    └── ErrorResponse.js  ✅ Custom error class
```

### Frontend (React + Vite)
Single-file React app with inline CSS and all components.

## 🔧 Environment Variables (Backend)
```
MONGO_URI=mongodb://localhost:27017/sbstocks
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
PORT=5000
CLIENT_URL=http://localhost:3000
STARTING_BALANCE=100000
NEWS_API_KEY=demo          # Optional: NewsAPI key for real news
```

## 🐛 Bugs Fixed
1. **Duplicate component declarations** — NewsPage, LeaderboardPage, AchievementsPage were declared twice
2. **AdminPage scope error** — `stocks` variable was undefined inside AdminPage
3. **WalletPage scope error** — `loadAppData` called directly; fixed to use `onRefresh` prop
4. **TradeModal error div** — Error message `<div>` was incorrectly nested inside `<button>`
5. **News sentiment mismatch** — Fixed to handle both "pos"/"positive" formats from API vs mock data
6. **Missing server.js** — Main entry point was absent
7. **Missing models** — Stock.js and Watchlist.js models were missing
8. **Empty Portfolio.js** — Model file was empty (0 bytes)
9. **Missing middleware** — auth.js, asyncHandler.js, validators.js, errorHandler.js all missing
10. **Missing .env files** — Both frontend and backend .env created

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login + get JWT |
| GET | /api/auth/me | Current user |
| GET | /api/stocks | All stocks |
| GET | /api/stocks/gainers | Top gainers |
| GET | /api/stocks/losers | Top losers |
| POST | /api/orders | Place order |
| GET | /api/orders | User orders |
| DELETE | /api/orders/:id | Cancel order |
| GET | /api/portfolio | Portfolio + holdings |
| GET | /api/wallet | Cash balance |
| POST | /api/wallet/add | Add funds |
| POST | /api/wallet/withdraw | Withdraw funds |
| GET | /api/transactions | Transaction history |
| GET | /api/watchlist | Get watchlist |
| GET | /api/leaderboard | Rankings |
| GET | /api/news | Market news |
