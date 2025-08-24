import http from 'http'
import { Server } from 'socket.io'
import express from 'express'
import dotenv from 'dotenv'

import Conversation from '../models/Conversation.js'

dotenv.config()

const app = express()
const httpServer = http.Server(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

// Array em memória para controle de usuários online
const users = []

io.on('connection', (socket) => {
  // 📌 Login do usuário
  socket.on('onLogin', async (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    }

    const existUser = users.find((x) => x.name === updatedUser.name)
    if (existUser) {
      existUser.socketId = socket.id
      existUser.online = true
    } else {
      users.push(updatedUser)
    }

    // Admin recebe atualização do usuário
    const admin = users.find((x) => x.name === 'Admin' && x.online)
    if (admin && updatedUser.name !== 'Admin') {
      io.to(admin.socketId).emit('updateUser', updatedUser)
    }

    // Carrega histórico de conversa do usuário para Admin
    if (updatedUser.name === 'Admin') {
      const allConversations = await Conversation.find()
      io.to(updatedUser.socketId).emit('listUsers', users)
      io.to(updatedUser.socketId).emit('loadHistoryAll', allConversations)
    } else {
      const conversation = await Conversation.findOne({
        userName: updatedUser.name,
      })
      if (conversation && admin) {
        io.to(admin.socketId).emit('loadHistory', conversation.messages)
      }
    }
  })

  // 📌 Desconexão
  socket.on('disconnect', () => {
    const user = users.find((x) => x.socketId === socket.id)
    if (user) {
      user.online = false
      const admin = users.find((x) => x.name === 'Admin' && x.online)
      if (admin) {
        io.to(admin.socketId).emit('updateUser', user)
      }
    }
  })

  // 📌 Usuário selecionado pelo admin
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
      if (message.from === 'Admin') {
        // Mensagem do Admin para usuário
        const user = users.find((x) => x.name === message.to && x.online)
        if (user) io.to(user.socketId).emit('message', message)

        // Salvar no MongoDB
        let conversation = await Conversation.findOne({
          userName: message.to,
        })
        if (!conversation) {
          conversation = new Conversation({
            userName: message.to,
            messages: [],
          })
        }
        conversation.messages.push(message)
        await conversation.save()
      } else {
        // Mensagem do usuário para Admin
        const admin = users.find((x) => x.name === 'Admin' && x.online)
        if (admin) io.to(admin.socketId).emit('message', message)

        let conversation = await Conversation.findOne({
          userName: message.from,
        })
        if (!conversation) {
          conversation = new Conversation({
            userName: message.from,
            messages: [],
          })
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

const port = process.env.PORT || 3333
httpServer.listen(port, () => {
  console.log(`💻 Server running on port ${port}`)
})
