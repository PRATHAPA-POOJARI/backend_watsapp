const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes); // ← fixed: was /api/chats

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track online users
const onlineUsers = new Map();

// Socket JWT middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = decoded;
    next();
  });
});

io.on("connection", (socket) => {
  const userId = socket.user.id;
  console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

  // Mark user online
  onlineUsers.set(userId, socket.id);
  io.emit("user_online", { userId });

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`${socket.user.username} joined chat: ${chatId}`);
  });

  // Send message only to that chat room
  socket.on("send_message", (data) => {
    socket.to(data.chatId).emit("receive_message", data);
  });

  // Typing indicators
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
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});