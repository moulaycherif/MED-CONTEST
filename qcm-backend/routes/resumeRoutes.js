const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");

router.post("/generate", resumeController.generate);

module.exports = router;
