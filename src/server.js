import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import Conversation from './models/Conversation.js'

// Rotas
import userRoutes from './routes/userRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

// ✅ Conexão com MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err))


// Rotas de teste
app.get('/test-server', (req, res) => {
  res.send('🚀 Imosmart server running! ✅')
})

// Rotas da aplicação
app.use('/api/users', userRoutes)
app.use('/api/properties', propertyRoutes)

// ✅ Criar servidor HTTP
const httpServer = createServer(app)

// ✅ Configuração Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // ⚠️ Trocar pela URL do frontend em produção
    methods: ['GET', 'POST'],
  },
})

// ✅ Eventos WebSocket
io.on('connection', (socket) => {
  console.log('🟢 Novo cliente conectado:', socket.id)

  // Usuário entra em uma conversa
  socket.on('joinConversation', async ({ conversationId }) => {
    socket.join(conversationId)
    console.log(`📌 Cliente ${socket.id} entrou na conversa ${conversationId}`)
  })

  // Enviar mensagem
  socket.on('sendMessage', async ({ conversationId, from, to, body }) => {
    try {
      const conversation = await Conversation.findById(conversationId)

      if (!conversation) {
        console.error('❌ Conversa não encontrada:', conversationId)
        return
      }

      const newMessage = { from, to, body }
      conversation.messages.push(newMessage)
      await conversation.save()

      // Broadcast da mensagem em tempo real
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

// ✅ Rotas REST para conversas
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversa não encontrada' })
    }
    res.json(conversation)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar conversa', error: err.message })
  }
})

app.post('/api/conversations', async (req, res) => {
  try {
    const { userName } = req.body
    const newConversation = new Conversation({ userName, messages: [] })
    await newConversation.save()
    res.status(201).json(newConversation)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar conversa', error: err.message })
  }
})

// ✅ Middleware de erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err.message)
  res.status(500).json({ message: 'Erro interno no servidor' })
})

// ✅ Porta do servidor
const PORT = process.env.PORT || 3333
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
