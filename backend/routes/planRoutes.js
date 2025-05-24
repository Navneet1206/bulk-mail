const express = require("express");
const { getPlans, updatePlan } = require("../controllers/planController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getPlans);
router.post("/update", authMiddleware, updatePlan);

module.exports = router;
