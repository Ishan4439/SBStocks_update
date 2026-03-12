const express  = require("express");
const router   = express.Router();
const { getNews } = require("../controllers/newsController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.get("/", getNews);
module.exports = router;
