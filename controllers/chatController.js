// controllers/chatController.js
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType } = req.body;
    const senderId = req.user.id;
    
    // Create message
    const message = new Message({
      chat: chatId,
      sender: senderId,
      content,
      messageType: messageType || 'text'
    });
    
    await message.save();
    
    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      $inc: { [`unreadCount.${chatId}`]: 1 }
    });
    
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ msg: "Message send failed" });
  }
};

exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'username profilePicture status isOnline')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ msg: "Failed to get chats" });
  }
};