// models/Chat.js
const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroupChat: { type: Boolean, default: false },
  groupName: String,
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  unreadCount: { type: Map, of: Number, default: {} }, // userID -> count
}, { timestamps: true });

// models/Message.js
const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: String,
  mediaUrl: String,
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'video', 'audio', 'document', 'location'],
    default: 'text'
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });