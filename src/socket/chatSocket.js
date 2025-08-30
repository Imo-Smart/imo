import http from "http";
import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";

import { connectDB } from "../config/db.js";
import Conversation from "../models/Conversation.js";

dotenv.config();

const app = express();
const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Conecta ao MongoDB usando MONGODB_URI
connectDB();

let users = [];

io.on("connection", (socket) => {
  console.log(`🔌 Nova conexão: ${socket.id}`);

  socket.on("onLogin", async (user) => {
    console.log(`✅ Usuário logado: ${user.name}`);
    users = users.filter((u) => u.name !== user.name);

    const updatedUser = { ...user, online: true, socketId: socket.id, messages: [] };
    users.push(updatedUser);

    const admin = users.find((x) => x.name === "Admin" && x.online);

    try {
      if (updatedUser.name === "Admin") {
        const allConversations = await Conversation.find();
        io.to(updatedUser.socketId).emit("listUsers", users);
        io.to(updatedUser.socketId).emit("loadHistoryAll", allConversations);
      } else {
        const conversation = await Conversation.findOne({ userName: updatedUser.name });
        if (conversation && admin) {
          io.to(admin.socketId).emit("loadHistory", conversation.messages);
        }
      }
    } catch (err) {
      console.error("❌ Erro ao buscar conversas:", err.message);
    }
  });

  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      console.log(`❌ Usuário desconectado: ${user.name}`);
      user.online = false;
      const admin = users.find((x) => x.name === "Admin" && x.online);
      if (admin) io.to(admin.socketId).emit("updateUser", user);
    }
  });

  socket.on("onMessage", async (message) => {
    try {
      const admin = users.find((x) => x.name === "Admin" && x.online);
      if (message.from === "Admin") {
        const user = users.find((x) => x.name === message.to && x.online);
        if (user) io.to(user.socketId).emit("message", message);

        try {
          let conversation = await Conversation.findOne({ userName: message.to });
          if (!conversation) conversation = new Conversation({ userName: message.to, messages: [] });
          conversation.messages.push(message);
          await conversation.save();
        } catch (err) {
          console.error("❌ Erro ao salvar mensagem Admin->User:", err.message);
        }
      } else {
        if (admin) io.to(admin.socketId).emit("message", message);

        try {
          let conversation = await Conversation.findOne({ userName: message.from });
          if (!conversation) conversation = new Conversation({ userName: message.from, messages: [] });
          conversation.messages.push(message);
          await conversation.save();
        } catch (err) {
          console.error("❌ Erro ao salvar mensagem User->Admin:", err.message);
        }

        if (!admin) {
          io.to(socket.id).emit("message", {
            from: "System",
            to: message.from,
            body: "Responderemos em breve.",
          });
        }
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error.message);
    }
  });
});

// Usa CHAT_PORT do .env ou default 5001
const port = process.env.CHAT_PORT || 5001;
httpServer.listen(port, () => {
  console.log(`💬 Chat server running on port ${port}`);
});
