const express = require('express');
const router = express.Router();
const { accessChat, getMyChats, createGroupChat,sendMessage,
  getMessages,
  markRead,
  searchUsers, } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware'); 
router.use(authMiddleware); // Apply auth middleware to all routes

router.get('/', getMyChats);
router.post('/access', accessChat);
router.post('/group', createGroupChat); 
router.post('/message', sendMessage);
router.get('/message/:chatId', getMessages);
router.post('/message/read', markRead);
router.get('/search-users', searchUsers);   
module.exports = router;