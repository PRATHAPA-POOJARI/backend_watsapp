const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/user");

// Create or get existing 1-on-1 chat
exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }

    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [req.user.id, userId] },
    })
      .populate("members", "-otp -otpExpires")
      .populate("lastMessage");

    if (chat) return res.json(chat);

    chat = await Chat.create({
      members: [req.user.id, userId],
      isGroup: false,
    });

    chat = await Chat.findById(chat._id).populate("members", "-otp -otpExpires");
    res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all chats for logged-in user
exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user.id })
      .populate("members", "username email")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username" },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Create group chat
exports.createGroupChat = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || members.length < 2) {
      return res.status(400).json({ msg: "Group name and at least 2 members required" });
    }

    const group = await Chat.create({
      name,
      isGroup: true,
      members: [...members, req.user.id],
      groupAdmin: req.user.id,
    });

    const fullGroup = await Chat.findById(group._id)
      .populate("members", "username email")
      .populate("groupAdmin", "username email");

    res.status(201).json(fullGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, type } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ msg: "chatId and content required" });
    }

    const message = await Message.create({
      chatId,
      sender: req.user.id,
      content,
      type: type || "text",
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    const populated = await Message.findById(message._id).populate(
      "sender",
      "username"
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Message send failed" });
  }
};

// Get all messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark messages as read
exports.markRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      {
        chatId,
        readBy: { $ne: req.user.id },
        sender: { $ne: req.user.id },
      },
      { $addToSet: { readBy: req.user.id }, $set: { status: "read" } }
    );

    res.json({ msg: "Messages marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Search users — returns ALL users if query is empty
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    let users;

    if (!query || query.trim() === "") {
      // Return all users except current user
      users = await User.find({ _id: { $ne: req.user.id } }).select(
        "username email"
      );
    } else {
      users = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
        _id: { $ne: req.user.id },
      }).select("username email");
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};  