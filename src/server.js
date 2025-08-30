import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import Conversation from './models/Conversation.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err))

// Criar servidor HTTP
const httpServer = createServer(app)

// Configurar Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // ⚠️ Ajuste depois para a URL do seu frontend
    methods: ['GET', 'POST'],
  },
})

// Eventos de WebSocket
io.on('connection', (socket) => {
  console.log('🟢 Novo cliente conectado:', socket.id)

  // Entrar em uma conversa existente
  socket.on('joinConversation', async ({ conversationId }) => {
    socket.join(conversationId)
    console.log(`📌 Cliente ${socket.id} entrou na conversa ${conversationId}`)
  })

  // Enviar mensagem
  socket.on('sendMessage', async ({ conversationId, from, to, body }) => {
    try {
      // Buscar conversa no banco
      const conversation = await Conversation.findById(conversationId)

      if (!conversation) {
        console.error('❌ Conversa não encontrada:', conversationId)
        return
      }

      const newMessage = { from, to, body }
      conversation.messages.push(newMessage)
      await conversation.save()

      // Enviar a mensagem em tempo real para todos na sala
      io.to(conversationId).emit('newMessage', {
        conversationId,
        ...newMessage,
        createdAt: new Date(),
      })
    } catch (err) {
      console.error('❌ Erro ao enviar mensagem:', err.message)
    }
  })

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id)
  })
})

// Porta do servidor
const PORT = process.env.PORT || 5001
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
