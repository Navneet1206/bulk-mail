const express = require("express");
const { getTemplates, sendEmails } = require("../controllers/emailController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/templates", authMiddleware, getTemplates);
router.post("/send", authMiddleware, sendEmails);

module.exports = router;
