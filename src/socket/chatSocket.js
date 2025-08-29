import http from 'http'
import { Server } from 'socket.io'
import express from 'express'
import dotenv from 'dotenv'

import Conversation from '../models/Conversation.js'

dotenv.config()

const app = express()
const httpServer = http.Server(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

// Array em memória para usuários online
let users = []

io.on('connection', (socket) => {
  console.log(`🔌 Nova conexão: ${socket.id}`)

  // 📌 Login do usuário
  socket.on('onLogin', async (user) => {
    console.log(`✅ Usuário logado: ${user.name}`)

    // Remove duplicado caso já exista
    users = users.filter((u) => u.name !== user.name)

    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    }
    users.push(updatedUser)

    // Notifica admin
    const admin = users.find((x) => x.name === 'Admin' && x.online)
    if (admin && updatedUser.name !== 'Admin') {
      io.to(admin.socketId).emit('updateUser', updatedUser)
    }

    // Carrega histórico
    if (updatedUser.name === 'Admin') {
      const allConversations = await Conversation.find()
      io.to(updatedUser.socketId).emit('listUsers', users)
      io.to(updatedUser.socketId).emit('loadHistoryAll', allConversations)
    } else {
      const conversation = await Conversation.findOne({ userName: updatedUser.name })
      if (conversation && admin) {
        io.to(admin.socketId).emit('loadHistory', conversation.messages)
      }
    }
  })

  // 📌 Desconexão
  socket.on('disconnect', () => {
    const user = users.find((x) => x.socketId === socket.id)
    if (user) {
      console.log(`❌ Usuário desconectado: ${user.name}`)
      user.online = false
      const admin = users.find((x) => x.name === 'Admin' && x.online)
      if (admin) {
        io.to(admin.socketId).emit('updateUser', user)
      }
    }
  })

  // 📌 Selecionar usuário
  socket.on('onUserSelected', (user) => {
    const admin = users.find((x) => x.name === 'Admin' && x.online)
    if (admin) {
      const existUser = users.find((x) => x.name === user.name)
      io.to(admin.socketId).emit('selectUser', existUser)
    }
  })

  // 📌 Enviar mensagem
  socket.on('onMessage', async (message) => {
    try {
      console.log(`💬 Mensagem recebida de ${message.from} para ${message.to}`)
      if (message.from === 'Admin') {
        const user = users.find((x) => x.name === message.to && x.online)
        if (user) io.to(user.socketId).emit('message', message)

        let conversation = await Conversation.findOne({ userName: message.to })
        if (!conversation) {
          conversation = new Conversation({ userName: message.to, messages: [] })
        }
        conversation.messages.push(message)
        await conversation.save()
      } else {
        const admin = users.find((x) => x.name === 'Admin' && x.online)
        if (admin) io.to(admin.socketId).emit('message', message)

        let conversation = await Conversation.findOne({ userName: message.from })
        if (!conversation) {
          conversation = new Conversation({ userName: message.from, messages: [] })
        }
        conversation.messages.push(message)
        await conversation.save()

        if (!admin) {
          io.to(socket.id).emit('message', {
            from: 'System',
            to: message.from,
            body: 'Responderemos em breve.',
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
    }
  })
})

const port = process.env.CHAT_PORT || 5001
httpServer.listen(port, () => {
  console.log(`💬 Chat server running on port ${port}`)
})
