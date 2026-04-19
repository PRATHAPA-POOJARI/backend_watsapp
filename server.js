const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/Chat"); // ← ADD THIS
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = decoded;
    next();
  });
});

// ← async added here
io.on("connection", async (socket) => {
  const userId = socket.user.id;
  console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

  onlineUsers.set(userId, socket.id);
  io.emit("user_online", { userId });

  // Auto-join all existing chat rooms
  try {
    const chats = await Chat.find({ members: userId });
    chats.forEach((chat) => {
      socket.join(chat._id.toString());
      console.log(`${socket.user.username} auto-joined: ${chat._id}`);
    });
  } catch (err) {
    console.error("Failed to auto-join rooms:", err.message);
  }

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`${socket.user.username} joined chat: ${chatId}`);
  });

  socket.on("send_message", (data) => {
    console.log(`📨 ${socket.user.username} → room ${data.chatId}`);
    socket.to(data.chatId).emit("receive_message", data);
  });

  socket.on("typing", ({ chatId }) => {
    socket.to(chatId).emit("typing", { username: socket.user.username });
  });

  socket.on("stop_typing", ({ chatId }) => {
    socket.to(chatId).emit("stop_typing");
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("user_offline", { userId });
    console.log(`❌ User disconnected: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});