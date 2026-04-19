const express = require('express');
const router = express.Router();
const { accessChat, getMyChats, createGroupChat,sendMessage,
  getMessages,
  markRead,
  searchUsers, } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware'); 
router.use(authMiddleware); // Apply auth middleware to all routes
router.get("/search", searchUsers);            // ← was /search-users
router.post("/", accessChat);                  // ← was /access
router.get("/", getMyChats);
router.post("/group", createGroupChat);
router.post("/message", sendMessage);
router.get("/message/:chatId", getMessages);
router.put("/message/:chatId/read", markRead);
 
module.exports = router;