const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");
const { uploadFile, refreshUrl } = require("../controllers/uploadController");

router.post("/", protect, upload.single("file"), uploadFile);
router.post("/refresh-url", protect, refreshUrl);

module.exports = router;