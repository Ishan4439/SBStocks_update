const express  = require("express");
const router   = express.Router();
const { getPortfolio, getSnapshots } = require("../controllers/portfolioController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.get("/", getPortfolio);
router.get("/snapshots", getSnapshots);
module.exports = router;
