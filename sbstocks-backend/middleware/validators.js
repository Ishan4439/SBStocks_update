const { body, validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

exports.registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
];

exports.loginRules = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.orderRules = [
  body("symbol").trim().notEmpty().withMessage("Symbol required"),
  body("side").isIn(["buy","sell"]).withMessage("Side must be buy or sell"),
  body("orderType").isIn(["market","limit","stoploss"]).withMessage("Invalid order type"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

exports.stockRules = [
  body("symbol").trim().notEmpty().withMessage("Symbol required"),
  body("name").trim().notEmpty().withMessage("Name required"),
  body("currentPrice").isFloat({ min: 0.01 }).withMessage("Valid price required"),
];

exports.walletRules = [
  body("amount").isFloat({ min: 0.01 }).withMessage("Valid amount required"),
];
