const express  = require("express");
const router   = express.Router();
const { getTransactions, getTransactionStats } = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.get("/", getTransactions);
router.get("/stats", getTransactionStats);
module.exports = router;
